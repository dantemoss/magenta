-- Import generado desde Excel (MAYO 2026)
-- Vigencia: effective_month = 2026-05-01
-- Ejecutar en Supabase SQL Editor. Requiere índice único prices_unique_month
--   (plan_id, role, age_min, age_max, is_particular, effective_month).
begin;

-- Providers
insert into public.providers (name, slug)
values
  ('OSPADEP', 'ospadep'),
  ('Medife', 'medife'),
  ('Omint', 'omint'),
  ('Swiss Medical', 'swiss-medical')
on conflict (slug) do nothing;

-- Plans
insert into public.plans (provider_id, name, type)
select p.id, 'BRONCE', 'OPCION MEDIFE'
from public.providers p
where p.slug = 'medife'
on conflict (provider_id, name, type) do nothing;
insert into public.plans (provider_id, name, type)
select p.id, 'ORO', 'OPCION MEDIFE'
from public.providers p
where p.slug = 'medife'
on conflict (provider_id, name, type) do nothing;
insert into public.plans (provider_id, name, type)
select p.id, 'PLATA', 'OPCION MEDIFE'
from public.providers p
where p.slug = 'medife'
on conflict (provider_id, name, type) do nothing;
insert into public.plans (provider_id, name, type)
select p.id, 'PLAN 2500', 'OMINT'
from public.providers p
where p.slug = 'omint'
on conflict (provider_id, name, type) do nothing;
insert into public.plans (provider_id, name, type)
select p.id, 'PLAN 4500', 'OMINT'
from public.providers p
where p.slug = 'omint'
on conflict (provider_id, name, type) do nothing;
insert into public.plans (provider_id, name, type)
select p.id, 'PLAN 6500', 'OMINT'
from public.providers p
where p.slug = 'omint'
on conflict (provider_id, name, type) do nothing;
insert into public.plans (provider_id, name, type)
select p.id, 'PLAN 8500', 'OMINT'
from public.providers p
where p.slug = 'omint'
on conflict (provider_id, name, type) do nothing;
insert into public.plans (provider_id, name, type)
select p.id, 'PLAN COMUNIDAD SIN COPAGO', 'OMINT'
from public.providers p
where p.slug = 'omint'
on conflict (provider_id, name, type) do nothing;
insert into public.plans (provider_id, name, type)
select p.id, 'OS 25', 'OSPADEP SALUD'
from public.providers p
where p.slug = 'ospadep'
on conflict (provider_id, name, type) do nothing;
insert into public.plans (provider_id, name, type)
select p.id, 'OS 300', 'OSPADEP SALUD'
from public.providers p
where p.slug = 'ospadep'
on conflict (provider_id, name, type) do nothing;
insert into public.plans (provider_id, name, type)
select p.id, 'OS 900', 'OSPADEP SALUD'
from public.providers p
where p.slug = 'ospadep'
on conflict (provider_id, name, type) do nothing;
insert into public.plans (provider_id, name, type)
select p.id, 'MS', 'SWISS'
from public.providers p
where p.slug = 'swiss-medical'
on conflict (provider_id, name, type) do nothing;
insert into public.plans (provider_id, name, type)
select p.id, 'PO62', 'SWISS'
from public.providers p
where p.slug = 'swiss-medical'
on conflict (provider_id, name, type) do nothing;
insert into public.plans (provider_id, name, type)
select p.id, 'PO64', 'SWISS'
from public.providers p
where p.slug = 'swiss-medical'
on conflict (provider_id, name, type) do nothing;
insert into public.plans (provider_id, name, type)
select p.id, 'SB02', 'SWISS'
from public.providers p
where p.slug = 'swiss-medical'
on conflict (provider_id, name, type) do nothing;
insert into public.plans (provider_id, name, type)
select p.id, 'SB04', 'SWISS'
from public.providers p
where p.slug = 'swiss-medical'
on conflict (provider_id, name, type) do nothing;

-- Prices (upsert por vigencia mensual)
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'familiar_cargo'::public.price_role, 0, null, false, 353252.53, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'BRONCE'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'hijo_adulto'::public.price_role, 0, 29, false, 136761.88, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'BRONCE'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'hijo_adulto'::public.price_role, 30, 39, false, 171907.41, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'BRONCE'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'hijo_adulto'::public.price_role, 40, 49, false, 223550.20, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'BRONCE'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'hijo_adulto'::public.price_role, 50, 59, false, 324277.89, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'BRONCE'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'hijo_adulto'::public.price_role, 60, null, false, 353252.53, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'BRONCE'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 0, 29, false, 136761.88, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'BRONCE'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 30, 39, false, 171907.41, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'BRONCE'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 40, 49, false, 223550.20, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'BRONCE'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 50, 59, false, 324277.89, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'BRONCE'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 60, null, false, 353252.53, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'BRONCE'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'matrimonio'::public.price_role, 0, 29, false, 255381.32, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'BRONCE'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'matrimonio'::public.price_role, 30, 39, false, 310173.48, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'BRONCE'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'matrimonio'::public.price_role, 40, 49, false, 387364.27, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'BRONCE'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'matrimonio'::public.price_role, 50, 59, false, 497590.35, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'BRONCE'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'matrimonio'::public.price_role, 60, null, false, 539504.30, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'BRONCE'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'primer_hijo'::public.price_role, 0, 20, false, 111415.76, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'BRONCE'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'segundo_hijo'::public.price_role, 0, 20, false, 92048.48, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'BRONCE'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'familiar_cargo'::public.price_role, 0, null, false, 515193.02, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'ORO'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'hijo_adulto'::public.price_role, 0, 29, false, 187342.92, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'ORO'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'hijo_adulto'::public.price_role, 30, 39, false, 241146.67, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'ORO'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'hijo_adulto'::public.price_role, 40, 49, false, 304388.14, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'ORO'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'hijo_adulto'::public.price_role, 50, 59, false, 467891.93, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'ORO'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'hijo_adulto'::public.price_role, 60, null, false, 515193.02, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'ORO'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 0, 29, false, 187342.92, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'ORO'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 30, 39, false, 241146.67, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'ORO'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 40, 49, false, 304388.14, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'ORO'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 50, 59, false, 467891.93, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'ORO'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 60, null, false, 515193.02, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'ORO'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'matrimonio'::public.price_role, 0, 29, false, 355021.72, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'ORO'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'matrimonio'::public.price_role, 30, 39, false, 448006.71, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'ORO'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'matrimonio'::public.price_role, 40, 49, false, 573948.56, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'ORO'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'matrimonio'::public.price_role, 50, 59, false, 699957.07, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'ORO'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'matrimonio'::public.price_role, 60, null, false, 759501.60, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'ORO'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'primer_hijo'::public.price_role, 0, 20, false, 161902.58, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'ORO'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'segundo_hijo'::public.price_role, 0, 20, false, 130906.59, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'ORO'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'familiar_cargo'::public.price_role, 0, null, false, 448335.24, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'PLATA'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'hijo_adulto'::public.price_role, 0, 29, false, 164851.18, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'PLATA'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'hijo_adulto'::public.price_role, 30, 39, false, 208688.01, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'PLATA'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'hijo_adulto'::public.price_role, 40, 49, false, 263241.49, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'PLATA'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'hijo_adulto'::public.price_role, 50, 59, false, 412348.46, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'PLATA'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'hijo_adulto'::public.price_role, 60, null, false, 448335.24, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'PLATA'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 0, 29, false, 164851.18, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'PLATA'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 30, 39, false, 208688.01, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'PLATA'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 40, 49, false, 263241.49, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'PLATA'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 50, 59, false, 412348.46, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'PLATA'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 60, null, false, 448335.24, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'PLATA'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'matrimonio'::public.price_role, 0, 29, false, 308841.61, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'PLATA'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'matrimonio'::public.price_role, 30, 39, false, 381081.36, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'PLATA'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'matrimonio'::public.price_role, 40, 49, false, 496318.60, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'PLATA'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'matrimonio'::public.price_role, 50, 59, false, 651594.21, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'PLATA'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'matrimonio'::public.price_role, 60, null, false, 710134.94, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'PLATA'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'primer_hijo'::public.price_role, 0, 20, false, 140110.27, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'PLATA'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'segundo_hijo'::public.price_role, 0, 20, false, 102407.29, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'PLATA'
  and pl.type = 'OPCION MEDIFE'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'adulto_conyugue'::public.price_role, 0, 25, false, 101765.00, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 2500'
  and pl.type = 'OMINT'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'adulto_conyugue'::public.price_role, 26, 35, false, 145822.10, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 2500'
  and pl.type = 'OMINT'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'adulto_conyugue'::public.price_role, 36, 54, false, 172139.00, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 2500'
  and pl.type = 'OMINT'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'adulto_conyugue'::public.price_role, 55, 59, false, 293220.76, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 2500'
  and pl.type = 'OMINT'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'adulto_conyugue'::public.price_role, 60, null, false, 453376.08, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 2500'
  and pl.type = 'OMINT'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'hijo_1_menor'::public.price_role, 0, 25, false, 88633.33, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 2500'
  and pl.type = 'OMINT'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'hijo_2_mas_menores'::public.price_role, 0, 25, false, 76638.17, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 2500'
  and pl.type = 'OMINT'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'adulto_conyugue'::public.price_role, 0, 25, false, 137031.09, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 4500'
  and pl.type = 'OMINT'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'adulto_conyugue'::public.price_role, 26, 35, false, 198647.24, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 4500'
  and pl.type = 'OMINT'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'adulto_conyugue'::public.price_role, 36, 54, false, 233199.02, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 4500'
  and pl.type = 'OMINT'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'adulto_conyugue'::public.price_role, 55, 59, false, 402028.00, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 4500'
  and pl.type = 'OMINT'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'adulto_conyugue'::public.price_role, 60, null, false, 610139.74, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 4500'
  and pl.type = 'OMINT'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'hijo_1_menor'::public.price_role, 0, 25, false, 119303.65, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 4500'
  and pl.type = 'OMINT'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'hijo_2_mas_menores'::public.price_role, 0, 25, false, 102966.56, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 4500'
  and pl.type = 'OMINT'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'adulto_conyugue'::public.price_role, 0, 25, false, 173984.71, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 6500'
  and pl.type = 'OMINT'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'adulto_conyugue'::public.price_role, 26, 35, false, 248969.78, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 6500'
  and pl.type = 'OMINT'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'adulto_conyugue'::public.price_role, 36, 54, false, 291567.66, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 6500'
  and pl.type = 'OMINT'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'adulto_conyugue'::public.price_role, 55, 59, false, 488709.76, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 6500'
  and pl.type = 'OMINT'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'adulto_conyugue'::public.price_role, 60, null, false, 727789.02, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 6500'
  and pl.type = 'OMINT'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'hijo_1_menor'::public.price_role, 0, 25, false, 152095.19, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 6500'
  and pl.type = 'OMINT'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'hijo_2_mas_menores'::public.price_role, 0, 25, false, 132071.79, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 6500'
  and pl.type = 'OMINT'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'adulto_conyugue'::public.price_role, 0, 25, false, 299177.52, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 8500'
  and pl.type = 'OMINT'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'adulto_conyugue'::public.price_role, 26, 35, false, 398794.51, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 8500'
  and pl.type = 'OMINT'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'adulto_conyugue'::public.price_role, 36, 54, false, 524951.64, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 8500'
  and pl.type = 'OMINT'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'adulto_conyugue'::public.price_role, 55, 59, false, 731531.45, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 8500'
  and pl.type = 'OMINT'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'adulto_conyugue'::public.price_role, 60, null, false, 997166.14, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 8500'
  and pl.type = 'OMINT'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'hijo_1_menor'::public.price_role, 0, 25, false, 262323.39, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 8500'
  and pl.type = 'OMINT'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'hijo_2_mas_menores'::public.price_role, 0, 25, false, 228809.90, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 8500'
  and pl.type = 'OMINT'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'adulto_conyugue'::public.price_role, 0, 25, false, 103257.38, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN COMUNIDAD SIN COPAGO'
  and pl.type = 'OMINT'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'adulto_conyugue'::public.price_role, 26, 35, false, 147595.09, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN COMUNIDAD SIN COPAGO'
  and pl.type = 'OMINT'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'adulto_conyugue'::public.price_role, 36, 54, false, 174420.94, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN COMUNIDAD SIN COPAGO'
  and pl.type = 'OMINT'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'adulto_conyugue'::public.price_role, 55, 59, false, 295506.52, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN COMUNIDAD SIN COPAGO'
  and pl.type = 'OMINT'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'adulto_conyugue'::public.price_role, 60, null, false, 459117.27, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN COMUNIDAD SIN COPAGO'
  and pl.type = 'OMINT'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'hijo_1_menor'::public.price_role, 0, 25, false, 89777.49, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN COMUNIDAD SIN COPAGO'
  and pl.type = 'OMINT'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'hijo_2_mas_menores'::public.price_role, 0, 25, false, 77518.29, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN COMUNIDAD SIN COPAGO'
  and pl.type = 'OMINT'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 18, 27, false, 81113.16, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 28, 35, false, 81113.16, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 36, 40, false, 81113.16, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 41, 45, false, 85169.55, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 46, 50, false, 94092.97, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 51, 55, false, 121670.78, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 56, 64, false, 181694.48, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 65, null, false, 243341.56, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 18, 27, true, 89630.05, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 28, 35, true, 89630.05, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 36, 40, true, 89630.05, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 41, 45, true, 94112.35, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 46, 50, true, 103972.73, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 51, 55, true, 134446.21, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 56, 64, true, 200772.40, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 65, null, true, 268892.42, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 18, 27, false, 81113.16, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 28, 35, false, 81113.16, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 36, 40, false, 81113.16, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 41, 45, false, 85169.55, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 46, 50, false, 94092.97, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 51, 55, false, 121670.78, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 56, 64, false, 181694.48, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 65, null, false, 243341.56, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 18, 27, true, 89630.05, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 28, 35, true, 89630.05, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 36, 40, true, 89630.05, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 41, 45, true, 94112.35, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 46, 50, true, 103972.73, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 51, 55, true, 134446.21, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 56, 64, true, 200772.40, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 65, null, true, 268892.42, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'primer_hijo'::public.price_role, 0, null, false, 49478.97, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'primer_hijo'::public.price_role, 0, null, true, 54674.26, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 18, 27, false, 102645.34, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 28, 35, false, 102645.34, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 36, 40, false, 102645.34, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 41, 45, false, 107777.61, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 46, 50, false, 119068.60, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 51, 55, false, 153968.01, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 56, 64, false, 229925.56, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 65, null, false, 307936.02, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 18, 27, true, 113423.10, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 28, 35, true, 113423.10, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 36, 40, true, 113423.10, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 41, 45, true, 119094.26, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 46, 50, true, 131570.80, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 51, 55, true, 170134.65, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 56, 64, true, 254067.75, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 65, null, true, 340269.30, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 18, 27, false, 102645.34, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 28, 35, false, 102645.34, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 36, 40, false, 102645.34, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 41, 45, false, 107777.61, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 46, 50, false, 119068.60, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 51, 55, false, 153968.01, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 56, 64, false, 229925.56, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 65, null, false, 307936.02, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 18, 27, true, 113423.10, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 28, 35, true, 113423.10, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 36, 40, true, 113423.10, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 41, 45, true, 119094.26, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 46, 50, true, 131570.80, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 51, 55, true, 170134.65, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 56, 64, true, 254067.75, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 65, null, true, 340269.30, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'primer_hijo'::public.price_role, 0, null, false, 62613.66, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'primer_hijo'::public.price_role, 0, null, true, 69188.09, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 18, 27, false, 122285.27, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 28, 35, false, 122285.27, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 36, 40, false, 122285.27, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 41, 45, false, 127653.89, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 46, 50, false, 141850.91, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 51, 55, false, 182533.13, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 56, 64, false, 271175.03, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 65, null, false, 362680.20, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 18, 27, true, 135125.22, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 28, 35, true, 135125.22, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 36, 40, true, 135125.22, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 41, 45, true, 141057.55, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 46, 50, true, 156745.25, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 51, 55, true, 201699.11, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 56, 64, true, 299648.41, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 65, null, true, 400761.63, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 18, 27, false, 122285.27, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 28, 35, false, 122285.27, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 36, 40, false, 122285.27, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 41, 45, false, 127653.89, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 46, 50, false, 141850.91, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 51, 55, false, 182533.13, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 56, 64, false, 271175.03, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 65, null, false, 362680.20, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 18, 27, true, 135125.22, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 28, 35, true, 135125.22, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 36, 40, true, 135125.22, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 41, 45, true, 141057.55, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 46, 50, true, 156745.25, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 51, 55, true, 201699.11, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 56, 64, true, 299648.41, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 65, null, true, 400761.63, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'primer_hijo'::public.price_role, 0, null, false, 74444.88, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'primer_hijo'::public.price_role, 0, null, true, 82261.60, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 0, 65, false, 201088.00, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'MS'
  and pl.type = 'SWISS'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 66, null, false, 571266.00, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'MS'
  and pl.type = 'SWISS'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'familiar_cargo'::public.price_role, 0, 65, false, 201088.00, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'MS'
  and pl.type = 'SWISS'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'familiar_cargo'::public.price_role, 66, null, false, 571266.00, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'MS'
  and pl.type = 'SWISS'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 0, 65, false, 201088.00, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'MS'
  and pl.type = 'SWISS'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 66, null, false, 571266.00, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'MS'
  and pl.type = 'SWISS'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'primer_hijo'::public.price_role, 0, 65, false, 201088.00, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'MS'
  and pl.type = 'SWISS'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'primer_hijo'::public.price_role, 66, null, false, 571266.00, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'MS'
  and pl.type = 'SWISS'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 0, 65, false, 303773.26, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'PO62'
  and pl.type = 'SWISS'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 66, null, false, 882693.12, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'PO62'
  and pl.type = 'SWISS'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'familiar_cargo'::public.price_role, 0, 65, false, 303773.26, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'PO62'
  and pl.type = 'SWISS'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'familiar_cargo'::public.price_role, 66, null, false, 882693.12, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'PO62'
  and pl.type = 'SWISS'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 0, 65, false, 303773.26, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'PO62'
  and pl.type = 'SWISS'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 66, null, false, 882693.12, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'PO62'
  and pl.type = 'SWISS'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'primer_hijo'::public.price_role, 0, 65, false, 303773.26, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'PO62'
  and pl.type = 'SWISS'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'primer_hijo'::public.price_role, 66, null, false, 882693.12, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'PO62'
  and pl.type = 'SWISS'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 0, 65, false, 364258.36, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'PO64'
  and pl.type = 'SWISS'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 66, null, false, 1056970.39, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'PO64'
  and pl.type = 'SWISS'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'familiar_cargo'::public.price_role, 0, 65, false, 364258.36, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'PO64'
  and pl.type = 'SWISS'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'familiar_cargo'::public.price_role, 66, null, false, 1056970.39, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'PO64'
  and pl.type = 'SWISS'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 0, 65, false, 364258.36, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'PO64'
  and pl.type = 'SWISS'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 66, null, false, 1056970.39, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'PO64'
  and pl.type = 'SWISS'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'primer_hijo'::public.price_role, 0, 65, false, 364258.36, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'PO64'
  and pl.type = 'SWISS'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'primer_hijo'::public.price_role, 66, null, false, 1056970.39, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'PO64'
  and pl.type = 'SWISS'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 66, null, false, 4647.00, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'SB02'
  and pl.type = 'SWISS'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'familiar_cargo'::public.price_role, 66, null, false, 4647.00, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'SB02'
  and pl.type = 'SWISS'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 66, null, false, 4647.00, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'SB02'
  and pl.type = 'SWISS'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'primer_hijo'::public.price_role, 66, null, false, 4647.00, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'SB02'
  and pl.type = 'SWISS'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 0, 65, false, 239564.75, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'SB04'
  and pl.type = 'SWISS'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'conyuge'::public.price_role, 66, null, false, 655116.91, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'SB04'
  and pl.type = 'SWISS'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'familiar_cargo'::public.price_role, 0, 65, false, 239564.75, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'SB04'
  and pl.type = 'SWISS'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'familiar_cargo'::public.price_role, 66, null, false, 655116.91, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'SB04'
  and pl.type = 'SWISS'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 0, 65, false, 239564.75, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'SB04'
  and pl.type = 'SWISS'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'individual'::public.price_role, 66, null, false, 655116.91, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'SB04'
  and pl.type = 'SWISS'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'primer_hijo'::public.price_role, 0, 65, false, 239564.75, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'SB04'
  and pl.type = 'SWISS'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;
insert into public.prices (plan_id, role, age_min, age_max, is_particular, price, effective_month, updated_at)
select pl.id, 'primer_hijo'::public.price_role, 66, null, false, 655116.91, '2026-05-01'::date, now()
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'SB04'
  and pl.type = 'SWISS'
on conflict (plan_id, role, age_min, age_max, is_particular, effective_month)
do update set
  price = excluded.price,
  updated_at = excluded.updated_at;

-- Cotizador: vigencia activa global
insert into public.app_settings (key, value_text, updated_at)
values ('active_effective_month', '2026-05-01', now())
on conflict (key) do update set
  value_text = excluded.value_text,
  updated_at = excluded.updated_at;

commit;
