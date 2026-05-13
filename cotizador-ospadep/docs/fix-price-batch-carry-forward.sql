-- Carry-forward al aplicar un batch parcial (mismo target_month).
--
-- Contexto comercial: los aumentos llegan en distintos momentos por prestador.
-- Antes solo se insertaban filas con pct <> 0, dejando el mes destino incompleto
-- y rompiendo cotizaciones al usar active_effective_month global.
--
-- Comportamiento nuevo:
-- - Se escriben TODAS las filas del mes origen en el mes destino.
-- - Si aplica regla (scope_ok y pct <> 0): precio = tarifa origen * (1 + pct/100).
-- - Si no: precio = COALESCE(tarifa ya cargada en mes destino, tarifa origen).
--   Así, un segundo batch (otro prestador) no pisa aumentos ya aplicados en destino.
--
-- Ejecutar en Supabase SQL Editor después de tener preview/apply definidos.

create or replace function public.preview_price_batch(
  batch uuid,
  sample_limit int default 30
)
returns table (
  plan_id uuid,
  role text,
  age_min int,
  age_max int,
  is_particular boolean,
  old_price numeric,
  new_price numeric,
  pct numeric,
  scope text,
  total_rows bigint
)
language plpgsql
security definer
set search_path = public
as $$
declare
  b record;
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'not authorized';
  end if;

  select * into b from public.price_batches pb where pb.id = batch;
  if not found then
    raise exception 'batch not found';
  end if;

  return query
  with src as (
    select
      p.plan_id,
      p.role::text as role,
      p.age_min,
      coalesce(p.age_max, -1) as age_max_norm,
      p.is_particular,
      p.price::numeric as old_price,
      pl.provider_id,
      pl.id as plan_uuid
    from public.prices p
    join public.plans pl on pl.id = p.plan_id
    where p.effective_month = public.month_start(b.source_month)
  ),
  tgt as (
    select
      p.plan_id,
      p.role::text as role,
      p.age_min,
      coalesce(p.age_max, -1) as age_max_norm,
      p.is_particular,
      p.price::numeric as target_price
    from public.prices p
    where p.effective_month = public.month_start(b.target_month)
  ),
  calc as (
    select
      s.plan_id,
      s.role,
      s.age_min,
      s.age_max_norm,
      s.is_particular,
      s.old_price,
      public.get_effective_pct(batch, s.provider_id, s.plan_uuid) as pct,
      public.get_effective_scope(batch, s.provider_id, s.plan_uuid) as scope
    from src s
  ),
  scoped as (
    select
      c.*,
      case
        when c.scope = 'both' then true
        when c.scope = 'particular' then c.is_particular = true
        when c.scope = 'no_particular' then c.is_particular = false
        else true
      end as scope_ok
    from calc c
  ),
  base as (
    select
      s.plan_id,
      s.role,
      s.age_min,
      case when s.age_max_norm = -1 then null else s.age_max_norm end as age_max,
      s.is_particular,
      s.old_price,
      case
        when s.scope_ok and s.pct <> 0 then round(s.old_price * (1 + s.pct / 100.0), 2)
        else round(coalesce(t.target_price, s.old_price), 2)
      end as new_price,
      s.pct,
      s.scope
    from scoped s
    left join tgt t
      on t.plan_id = s.plan_id
     and t.role = s.role
     and t.age_min = s.age_min
     and t.age_max_norm = s.age_max_norm
     and t.is_particular = s.is_particular
  ),
  tot as (
    select count(*)::bigint as total_rows from base
  ),
  ranked as (
    select
      b.plan_id,
      b.role,
      b.age_min,
      b.age_max,
      b.is_particular,
      b.old_price,
      b.new_price,
      b.pct,
      b.scope,
      tot.total_rows,
      row_number() over (
        order by (abs(b.new_price - b.old_price) > 0.005) desc,
          b.plan_id,
          b.role,
          b.age_min
      ) as rn
    from base b
    cross join tot
  )
  select
    ranked.plan_id,
    ranked.role,
    ranked.age_min,
    ranked.age_max,
    ranked.is_particular,
    ranked.old_price,
    ranked.new_price,
    ranked.pct,
    ranked.scope,
    ranked.total_rows
  from ranked
  where ranked.rn <= greatest(sample_limit, 0)
  order by ranked.rn;
end;
$$;

create or replace function public.apply_price_batch(batch uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  b record;
  inserted_count bigint := 0;
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'not authorized';
  end if;

  select * into b from public.price_batches pb where pb.id = batch for update;
  if not found then
    raise exception 'batch not found';
  end if;

  if b.status = 'applied' then
    return json_build_object('status','already_applied');
  end if;

  with src as (
    select
      p.plan_id,
      p.role,
      p.age_min,
      p.age_max,
      p.is_particular,
      p.price::numeric as old_price,
      pl.provider_id,
      pl.id as plan_uuid
    from public.prices p
    join public.plans pl on pl.id = p.plan_id
    where p.effective_month = public.month_start(b.source_month)
  ),
  tgt as (
    select
      p.plan_id,
      p.role,
      p.age_min,
      p.age_max,
      p.is_particular,
      p.price::numeric as target_price
    from public.prices p
    where p.effective_month = public.month_start(b.target_month)
  ),
  calc as (
    select
      s.*,
      public.get_effective_pct(batch, s.provider_id, s.plan_uuid) as pct,
      public.get_effective_scope(batch, s.provider_id, s.plan_uuid) as scope
    from src s
  ),
  scoped as (
    select
      c.*,
      case
        when c.scope = 'both' then true
        when c.scope = 'particular' then c.is_particular = true
        when c.scope = 'no_particular' then c.is_particular = false
        else true
      end as scope_ok
    from calc c
  ),
  rows_to_write as (
    select
      s.plan_id,
      s.role,
      s.age_min,
      s.age_max,
      s.is_particular,
      case
        when s.scope_ok and s.pct <> 0 then round(s.old_price * (1 + s.pct / 100.0), 2)
        else round(coalesce(t.target_price, s.old_price), 2)
      end as price,
      public.month_start(b.target_month) as effective_month,
      now() as updated_at,
      auth.uid() as updated_by,
      batch as batch_id
    from scoped s
    left join tgt t
      on t.plan_id = s.plan_id
     and t.role = s.role
     and t.age_min = s.age_min
     and t.is_particular = s.is_particular
     and t.age_max is not distinct from s.age_max
  ),
  upserted as (
    insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at, updated_by, batch_id)
    select plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at, updated_by, batch_id
    from rows_to_write
    on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
    do update set
      price = excluded.price,
      updated_at = excluded.updated_at,
      updated_by = excluded.updated_by,
      batch_id = excluded.batch_id
    returning 1
  )
  select count(*) into inserted_count from upserted;

  update public.price_batches
  set status = 'applied'
  where id = batch;

  return json_build_object(
    'status','applied',
    'rows_written', inserted_count,
    'source_month', public.month_start(b.source_month),
    'target_month', public.month_start(b.target_month)
  );
exception when others then
  update public.price_batches
  set status = 'failed'
  where id = batch;
  raise;
end;
$$;
