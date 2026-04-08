-- Políticas RLS (solo lectura) para cotizador público
-- Ejecutar en Supabase luego de crear las tablas.

begin;

alter table public.providers enable row level security;
alter table public.plans enable row level security;
alter table public.prices enable row level security;

drop policy if exists "providers_read_anon" on public.providers;
create policy "providers_read_anon"
on public.providers
for select
to anon
using (true);

drop policy if exists "plans_read_anon" on public.plans;
create policy "plans_read_anon"
on public.plans
for select
to anon
using (true);

drop policy if exists "prices_read_anon" on public.prices;
create policy "prices_read_anon"
on public.prices
for select
to anon
using (true);

commit;

