-- Auth + Roles (Vendedor / Supervisor / Admin) + RLS base
-- Ejecutar en Supabase SQL Editor.

-- 1) Tabla perfiles con rol
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null check (role in ('vendedor', 'supervisor', 'admin')),
  created_at timestamptz not null default now()
);

-- 2) Auto-crear perfil al registrar usuario (default: vendedor)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'vendedor')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3) Helper: es admin
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = uid and p.role = 'admin'
  );
$$;

-- 4) Activar RLS
alter table public.profiles enable row level security;
alter table public.providers enable row level security;
alter table public.plans enable row level security;
alter table public.prices enable row level security;

-- 5) Policies (lectura: vendedor/supervisor/admin)
drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read"
on public.profiles for select
to authenticated
using (id = auth.uid());

drop policy if exists "providers read" on public.providers;
create policy "providers read"
on public.providers for select
to authenticated
using (true);

drop policy if exists "plans read" on public.plans;
create policy "plans read"
on public.plans for select
to authenticated
using (true);

drop policy if exists "prices read" on public.prices;
create policy "prices read"
on public.prices for select
to authenticated
using (true);

-- 6) Policies admin (CRUD total)
drop policy if exists "providers admin write" on public.providers;
create policy "providers admin write"
on public.providers for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "plans admin write" on public.plans;
create policy "plans admin write"
on public.plans for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "prices admin write" on public.prices;
create policy "prices admin write"
on public.prices for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- 7) Recomendación: asegurar upsert en prices
-- Si todavía no existe un identificador único por fila de price,
-- crear una PK o unique (ejemplo):
-- alter table public.prices
--   add column if not exists id bigserial primary key;
-- o bien un unique compuesto (si aplica a tu modelo):
-- create unique index if not exists prices_unique
-- on public.prices(plan_id, role, age_min, age_max, is_particular);

