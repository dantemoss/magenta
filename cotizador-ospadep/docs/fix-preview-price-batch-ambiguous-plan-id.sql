-- Fix SB03: preview_price_batch falla por "plan_id is ambiguous"
-- Ejecutar en Supabase SQL Editor.

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
      s.plan_id,
      s.role,
      s.age_min,
      case when s.age_max_norm = -1 then null else s.age_max_norm end as age_max,
      s.is_particular,
      s.old_price,
      round(s.old_price * (1 + s.pct/100.0), 2) as new_price,
      s.pct,
      s.scope
    from scoped s
    where s.scope_ok and s.pct <> 0
  ),
  counted as (
    select ro.*, count(*) over() as total_rows
    from rows_out ro
    order by ro.plan_id, ro.role, ro.age_min
  )
  select *
  from counted
  limit greatest(sample_limit, 0);
end;
$$;
