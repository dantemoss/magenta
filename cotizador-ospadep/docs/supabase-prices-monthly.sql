-- Precios con histórico mensual + batches idempotentes
-- Ejecutar en Supabase SQL Editor.

-- Requiere: tabla `plans` con provider_id y tabla `providers`.
-- Requiere: función public.is_admin(uid uuid) (ver supabase-auth-roles.sql).

-- 0) Extensiones útiles
create extension if not exists pgcrypto;

-- 1) Columna de vigencia mensual y auditoría en prices
alter table public.prices
  add column if not exists effective_month date,
  add column if not exists updated_at timestamptz,
  add column if not exists updated_by uuid,
  add column if not exists batch_id uuid;

-- Backfill: asumir que los precios existentes corresponden al mes actual
update public.prices
set effective_month = date_trunc('month', now())::date
where effective_month is null;

alter table public.prices
  alter column effective_month set not null;

-- Unique por fila y mes (evita duplicados y permite idempotencia)
create unique index if not exists prices_unique_month
on public.prices(plan_id, role, age_min, age_max, is_particular, effective_month);

-- 2) Tablas de batch y reglas (% por prestador/plan)
create table if not exists public.price_batches (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  created_by uuid not null default auth.uid(),
  source_month date not null,
  target_month date not null,
  status text not null default 'draft' check (status in ('draft','previewed','applied','failed')),
  notes text
);

create table if not exists public.price_batch_rules (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.price_batches(id) on delete cascade,
  provider_id uuid null references public.providers(id) on delete cascade,
  plan_id uuid null references public.plans(id) on delete cascade,
  pct numeric not null,
  scope text not null default 'both' check (scope in ('both','particular','no_particular')),
  created_at timestamptz not null default now()
);

create index if not exists price_batch_rules_batch_id_idx
on public.price_batch_rules(batch_id);

-- 3) RLS
alter table public.price_batches enable row level security;
alter table public.price_batch_rules enable row level security;

drop policy if exists "price_batches admin all" on public.price_batches;
create policy "price_batches admin all"
on public.price_batches for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "price_batch_rules admin all" on public.price_batch_rules;
create policy "price_batch_rules admin all"
on public.price_batch_rules for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- 4) Helpers: normalizar mes (1er día) y regla efectiva
create or replace function public.month_start(d date)
returns date
language sql
immutable
as $$
  select date_trunc('month', d)::date;
$$;

-- Regla efectiva por plan (precedencia: plan_id > provider_id)
create or replace function public.get_effective_pct(
  batch uuid,
  provider uuid,
  plan uuid
)
returns numeric
language sql
stable
as $$
  select coalesce(
    (select r.pct from public.price_batch_rules r
     where r.batch_id = batch and r.plan_id = plan
     order by r.created_at desc
     limit 1),
    (select r.pct from public.price_batch_rules r
     where r.batch_id = batch and r.provider_id = provider and r.plan_id is null
     order by r.created_at desc
     limit 1),
    0
  );
$$;

create or replace function public.get_effective_scope(
  batch uuid,
  provider uuid,
  plan uuid
)
returns text
language sql
stable
as $$
  select coalesce(
    (select r.scope from public.price_batch_rules r
     where r.batch_id = batch and r.plan_id = plan
     order by r.created_at desc
     limit 1),
    (select r.scope from public.price_batch_rules r
     where r.batch_id = batch and r.provider_id = provider and r.plan_id is null
     order by r.created_at desc
     limit 1),
    'both'
  );
$$;

-- 5) Preview (muestra ejemplos + total)
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
  rows_out as (
    select
      plan_id,
      role,
      age_min,
      case when age_max_norm = -1 then null else age_max_norm end as age_max,
      is_particular,
      old_price,
      round(old_price * (1 + pct/100.0), 2) as new_price,
      pct,
      scope
    from scoped
    where scope_ok and pct <> 0
  ),
  counted as (
    select *, count(*) over() as total_rows
    from rows_out
    order by plan_id, role, age_min
  )
  select *
  from counted
  limit greatest(sample_limit, 0);
end;
$$;

-- 6) Apply (transaccional + idempotente)
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

  -- Insertar precios del target_month a partir del source_month aplicando reglas
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
      plan_id,
      role,
      age_min,
      age_max,
      is_particular,
      round(old_price * (1 + pct/100.0), 2) as price,
      public.month_start(b.target_month) as effective_month,
      now() as updated_at,
      auth.uid() as updated_by,
      batch as batch_id
    from scoped
    where scope_ok and pct <> 0
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

