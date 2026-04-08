-- Cotizador OSPADEP - Esquema para Supabase (Postgres)
-- Tablas: providers, plans, prices

begin;

-- Extensiones opcionales (si ya existen, Supabase las ignora con IF NOT EXISTS)
create extension if not exists pgcrypto;

-- Proveedores (Medife, Omint, OSPADEP, Swiss Medical, etc.)
create table if not exists public.providers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- Planes por proveedor
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  name text not null,
  type text not null,
  created_at timestamptz not null default now(),
  unique (provider_id, name, type)
);

-- Roles/categorías de precio (según tu especificación)
do $$
begin
  if not exists (select 1 from pg_type where typname = 'price_role') then
    create type public.price_role as enum (
      'individual',
      'conyuge',
      'matrimonio',
      'primer_hijo',
      'segundo_hijo',
      'hijo_adulto',
      'familiar_cargo',
      'adulto_conyugue',
      'hijo_1_menor',
      'hijo_2_mas_menores'
    );
  end if;
end $$;

-- Precios por plan, rango etario y categoría
create table if not exists public.prices (
  plan_id uuid not null references public.plans(id) on delete cascade,
  age_min integer not null,
  age_max integer, -- null = sin tope superior
  role public.price_role not null,
  price numeric(12,2) not null,
  is_particular boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (plan_id, role, age_min, is_particular),
  constraint prices_age_min_non_negative check (age_min >= 0),
  constraint prices_age_max_valid check (age_max is null or age_max >= age_min),
  constraint prices_price_non_negative check (price >= 0)
);

-- Índices para lookup del motor de cálculo
create index if not exists idx_plans_provider_id on public.plans(provider_id);
create index if not exists idx_prices_lookup
  on public.prices(plan_id, role, is_particular, age_min, age_max);

commit;

