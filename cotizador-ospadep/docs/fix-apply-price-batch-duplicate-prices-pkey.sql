-- Fix SB04: apply_price_batch falla con
-- "duplicate key value violates unique constraint prices_pkey"
--
-- Causa: la PK vieja de `prices` no contempla `effective_month`.
-- Este fix migra a PK por `id` y mantiene unicidad por fila+mes.
-- Ejecutar en Supabase SQL Editor.

create extension if not exists pgcrypto;

alter table public.prices
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists effective_month date;

update public.prices
set id = gen_random_uuid()
where id is null;

update public.prices
set effective_month = date_trunc('month', now())::date
where effective_month is null;

alter table public.prices
  alter column id set not null,
  alter column effective_month set not null;

do $$
begin
  if exists (
    select 1
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'prices'
      and c.conname = 'prices_pkey'
  ) then
    alter table public.prices drop constraint prices_pkey;
  end if;
end $$;

alter table public.prices
  add constraint prices_pkey primary key (id);

create unique index if not exists prices_unique_month
on public.prices(plan_id, role, age_min, age_max, is_particular, effective_month);
