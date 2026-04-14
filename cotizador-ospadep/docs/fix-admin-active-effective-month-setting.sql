-- Fix SB05: selector de vigencia activa (global)
-- Ejecutar en Supabase SQL Editor.

create table if not exists public.app_settings (
  key text primary key,
  value_text text,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

alter table public.app_settings enable row level security;

drop policy if exists "app_settings read" on public.app_settings;
create policy "app_settings read"
on public.app_settings for select
to authenticated
using (true);

drop policy if exists "app_settings admin write" on public.app_settings;
create policy "app_settings admin write"
on public.app_settings for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- valor inicial: última vigencia disponible en prices
insert into public.app_settings (key, value_text, updated_at, updated_by)
select
  'active_effective_month',
  max(p.effective_month)::text,
  now(),
  auth.uid()
from public.prices p
where p.effective_month is not null
on conflict (key) do nothing;
