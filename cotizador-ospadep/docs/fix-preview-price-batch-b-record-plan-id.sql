-- Fix SB06: preview_price_batch — colisión PL/pgSQL entre variable `b` (batch) y alias CTE `base b`.
-- Error típico: record "b" has no field "plan_id"
--
-- Ejecutar en Supabase SQL Editor.
-- Incluye preview_price_batch corregido + preview_price_batch_by_provider (resumen por prestador).

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
  batch_row record;
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'not authorized';
  end if;

  select * into batch_row from public.price_batches pb where pb.id = batch;
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
    where p.effective_month = public.month_start(batch_row.source_month)
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
    where p.effective_month = public.month_start(batch_row.target_month)
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
      br.plan_id,
      br.role,
      br.age_min,
      br.age_max,
      br.is_particular,
      br.old_price,
      br.new_price,
      br.pct,
      br.scope,
      tot.total_rows,
      row_number() over (
        order by (abs(br.new_price - br.old_price) > 0.005) desc,
          br.plan_id,
          br.role,
          br.age_min
      ) as rn
    from base br
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

create or replace function public.preview_price_batch_by_provider(batch uuid)
returns table (
  provider_id uuid,
  provider_name text,
  pct numeric,
  scope text,
  rows_changed bigint,
  rows_total bigint
)
language plpgsql
security definer
set search_path = public
as $$
declare
  batch_row record;
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'not authorized';
  end if;

  select * into batch_row from public.price_batches pb where pb.id = batch;
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
    where p.effective_month = public.month_start(batch_row.source_month)
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
    where p.effective_month = public.month_start(batch_row.target_month)
  ),
  calc as (
    select
      s.plan_id,
      s.provider_id,
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
      s.provider_id,
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
  )
  select
    prov.id as provider_id,
    prov.name as provider_name,
    coalesce(max(base.pct), 0) as pct,
    coalesce(max(base.scope), 'both') as scope,
    count(*) filter (where abs(base.new_price - base.old_price) > 0.005)::bigint as rows_changed,
    count(*)::bigint as rows_total
  from base
  join public.providers prov on prov.id = base.provider_id
  group by prov.id, prov.name
  order by prov.name;
end;
$$;
