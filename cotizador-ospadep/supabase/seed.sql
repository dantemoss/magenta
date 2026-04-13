-- Seed generado desde Excel (MARZO 2026)
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

-- Prices
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, null, 'familiar_cargo'::public.price_role, 325674.42, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'BRONCE'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, 29, 'hijo_adulto'::public.price_role, 126085.01, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'BRONCE'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 30, 39, 'hijo_adulto'::public.price_role, 158486.75, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'BRONCE'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 40, 49, 'hijo_adulto'::public.price_role, 206097.83, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'BRONCE'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 50, 59, 'hijo_adulto'::public.price_role, 298961.80, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'BRONCE'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 60, null, 'hijo_adulto'::public.price_role, 325674.42, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'BRONCE'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, 29, 'individual'::public.price_role, 126085.01, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'BRONCE'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 30, 39, 'individual'::public.price_role, 158486.75, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'BRONCE'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 40, 49, 'individual'::public.price_role, 206097.83, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'BRONCE'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 50, 59, 'individual'::public.price_role, 298961.80, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'BRONCE'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 60, null, 'individual'::public.price_role, 325674.42, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'BRONCE'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, 29, 'matrimonio'::public.price_role, 235443.92, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'BRONCE'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 30, 39, 'matrimonio'::public.price_role, 285958.51, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'BRONCE'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 40, 49, 'matrimonio'::public.price_role, 357123.09, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'BRONCE'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 50, 59, 'matrimonio'::public.price_role, 458743.91, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'BRONCE'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 60, null, 'matrimonio'::public.price_role, 497385.68, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'BRONCE'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, 20, 'primer_hijo'::public.price_role, 102717.63, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'BRONCE'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, 20, 'segundo_hijo'::public.price_role, 84862.34, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'BRONCE'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, null, 'familiar_cargo'::public.price_role, 474972.36, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'ORO'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, 29, 'hijo_adulto'::public.price_role, 172717.22, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'ORO'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 30, 39, 'hijo_adulto'::public.price_role, 222320.57, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'ORO'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 40, 49, 'hijo_adulto'::public.price_role, 280624.83, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'ORO'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 50, 59, 'hijo_adulto'::public.price_role, 431364.02, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'ORO'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 60, null, 'hijo_adulto'::public.price_role, 474972.36, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'ORO'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, 29, 'individual'::public.price_role, 172717.22, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'ORO'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 30, 39, 'individual'::public.price_role, 222320.57, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'ORO'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 40, 49, 'individual'::public.price_role, 280624.83, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'ORO'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 50, 59, 'individual'::public.price_role, 431364.02, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'ORO'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 60, null, 'individual'::public.price_role, 474972.36, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'ORO'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, 29, 'matrimonio'::public.price_role, 327305.49, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'ORO'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 30, 39, 'matrimonio'::public.price_role, 413031.23, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'ORO'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 40, 49, 'matrimonio'::public.price_role, 529140.91, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'ORO'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 50, 59, 'matrimonio'::public.price_role, 645312.04, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'ORO'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 60, null, 'matrimonio'::public.price_role, 700207.99, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'ORO'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, 20, 'primer_hijo'::public.price_role, 149262.99, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'ORO'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, 20, 'segundo_hijo'::public.price_role, 120686.83, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'ORO'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, null, 'familiar_cargo'::public.price_role, 413334.11, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'PLATA'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, 29, 'hijo_adulto'::public.price_role, 151981.40, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'PLATA'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 30, 39, 'hijo_adulto'::public.price_role, 192395.93, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'PLATA'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 40, 49, 'hijo_adulto'::public.price_role, 242690.47, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'PLATA'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 50, 59, 'hijo_adulto'::public.price_role, 380156.79, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'PLATA'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 60, null, 'hijo_adulto'::public.price_role, 413334.11, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'PLATA'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, 29, 'individual'::public.price_role, 151981.40, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'PLATA'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 30, 39, 'individual'::public.price_role, 192395.93, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'PLATA'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 40, 49, 'individual'::public.price_role, 242690.47, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'PLATA'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 50, 59, 'individual'::public.price_role, 380156.79, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'PLATA'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 60, null, 'individual'::public.price_role, 413334.11, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'PLATA'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, 29, 'matrimonio'::public.price_role, 284730.62, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'PLATA'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 30, 39, 'matrimonio'::public.price_role, 351330.68, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'PLATA'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 40, 49, 'matrimonio'::public.price_role, 457571.45, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'PLATA'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 50, 59, 'matrimonio'::public.price_role, 600724.83, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'PLATA'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 60, null, 'matrimonio'::public.price_role, 654695.34, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'PLATA'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, 20, 'primer_hijo'::public.price_role, 129171.99, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'PLATA'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, 20, 'segundo_hijo'::public.price_role, 94412.44, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'medife'
  and pl.name = 'PLATA'
  and pl.type = 'OPCION MEDIFE'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, 25, 'adulto_conyugue'::public.price_role, 95552.40, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 2500'
  and pl.type = 'OMINT'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 26, 35, 'adulto_conyugue'::public.price_role, 136919.87, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 2500'
  and pl.type = 'OMINT'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 36, 54, 'adulto_conyugue'::public.price_role, 161630.17, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 2500'
  and pl.type = 'OMINT'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 55, 59, 'adulto_conyugue'::public.price_role, 275320.07, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 2500'
  and pl.type = 'OMINT'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 60, null, 'adulto_conyugue'::public.price_role, 425698.14, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 2500'
  and pl.type = 'OMINT'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, 25, 'hijo_1_menor'::public.price_role, 83222.40, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 2500'
  and pl.type = 'OMINT'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, 25, 'hijo_2_mas_menores'::public.price_role, 71959.52, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 2500'
  and pl.type = 'OMINT'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, 25, 'adulto_conyugue'::public.price_role, 128665.54, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 4500'
  and pl.type = 'OMINT'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 26, 35, 'adulto_conyugue'::public.price_role, 186520.12, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 4500'
  and pl.type = 'OMINT'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 36, 54, 'adulto_conyugue'::public.price_role, 218962.57, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 4500'
  and pl.type = 'OMINT'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 55, 59, 'adulto_conyugue'::public.price_role, 377484.79, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 4500'
  and pl.type = 'OMINT'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 60, null, 'adulto_conyugue'::public.price_role, 572891.62, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 4500'
  and pl.type = 'OMINT'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, 25, 'hijo_1_menor'::public.price_role, 112020.34, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 4500'
  and pl.type = 'OMINT'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, 25, 'hijo_2_mas_menores'::public.price_role, 96680.60, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 4500'
  and pl.type = 'OMINT'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, 25, 'adulto_conyugue'::public.price_role, 163363.20, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 6500'
  and pl.type = 'OMINT'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 26, 35, 'adulto_conyugue'::public.price_role, 233770.55, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 6500'
  and pl.type = 'OMINT'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 36, 54, 'adulto_conyugue'::public.price_role, 273767.89, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 6500'
  and pl.type = 'OMINT'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 55, 59, 'adulto_conyugue'::public.price_role, 458874.76, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 6500'
  and pl.type = 'OMINT'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 60, null, 'adulto_conyugue'::public.price_role, 683358.58, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 6500'
  and pl.type = 'OMINT'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, 25, 'hijo_1_menor'::public.price_role, 142810.01, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 6500'
  and pl.type = 'OMINT'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, 25, 'hijo_2_mas_menores'::public.price_role, 124009.01, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 6500'
  and pl.type = 'OMINT'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, 25, 'adulto_conyugue'::public.price_role, 280913.18, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 8500'
  and pl.type = 'OMINT'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 26, 35, 'adulto_conyugue'::public.price_role, 374448.70, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 8500'
  and pl.type = 'OMINT'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 36, 54, 'adulto_conyugue'::public.price_role, 492904.12, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 8500'
  and pl.type = 'OMINT'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 55, 59, 'adulto_conyugue'::public.price_role, 686872.54, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 8500'
  and pl.type = 'OMINT'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 60, null, 'adulto_conyugue'::public.price_role, 936290.63, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 8500'
  and pl.type = 'OMINT'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, 25, 'hijo_1_menor'::public.price_role, 246308.94, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 8500'
  and pl.type = 'OMINT'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, 25, 'hijo_2_mas_menores'::public.price_role, 214841.39, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN 8500'
  and pl.type = 'OMINT'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, 25, 'adulto_conyugue'::public.price_role, 96953.67, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN COMUNIDAD SIN COPAGO'
  and pl.type = 'OMINT'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 26, 35, 'adulto_conyugue'::public.price_role, 138584.63, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN COMUNIDAD SIN COPAGO'
  and pl.type = 'OMINT'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 36, 54, 'adulto_conyugue'::public.price_role, 163772.80, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN COMUNIDAD SIN COPAGO'
  and pl.type = 'OMINT'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 55, 59, 'adulto_conyugue'::public.price_role, 277466.29, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN COMUNIDAD SIN COPAGO'
  and pl.type = 'OMINT'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 60, null, 'adulto_conyugue'::public.price_role, 431088.85, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN COMUNIDAD SIN COPAGO'
  and pl.type = 'OMINT'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, 25, 'hijo_1_menor'::public.price_role, 84296.71, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN COMUNIDAD SIN COPAGO'
  and pl.type = 'OMINT'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, 25, 'hijo_2_mas_menores'::public.price_role, 72785.92, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'omint'
  and pl.name = 'PLAN COMUNIDAD SIN COPAGO'
  and pl.type = 'OMINT'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 18, 27, 'conyuge'::public.price_role, 114931.27, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 28, 35, 'conyuge'::public.price_role, 114931.27, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 36, 40, 'conyuge'::public.price_role, 114931.27, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 41, 45, 'conyuge'::public.price_role, 119977.04, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 46, 50, 'conyuge'::public.price_role, 133320.28, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 51, 55, 'conyuge'::public.price_role, 171555.95, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 56, 64, 'conyuge'::public.price_role, 254867.11, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 65, null, 'conyuge'::public.price_role, 340869.34, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 18, 27, 'conyuge'::public.price_role, 126999.06, true
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 28, 35, 'conyuge'::public.price_role, 126999.06, true
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 36, 40, 'conyuge'::public.price_role, 126999.06, true
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 41, 45, 'conyuge'::public.price_role, 132574.63, true
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 46, 50, 'conyuge'::public.price_role, 147318.91, true
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 51, 55, 'conyuge'::public.price_role, 189569.32, true
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 56, 64, 'conyuge'::public.price_role, 281628.15, true
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 65, null, 'conyuge'::public.price_role, 376660.62, true
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 18, 27, 'individual'::public.price_role, 114931.27, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 28, 35, 'individual'::public.price_role, 114931.27, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 36, 40, 'individual'::public.price_role, 114931.27, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 41, 45, 'individual'::public.price_role, 119977.04, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 46, 50, 'individual'::public.price_role, 133320.28, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 51, 55, 'individual'::public.price_role, 171555.95, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 56, 64, 'individual'::public.price_role, 254867.11, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 65, null, 'individual'::public.price_role, 340869.34, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 18, 27, 'individual'::public.price_role, 126999.06, true
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 28, 35, 'individual'::public.price_role, 126999.06, true
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 36, 40, 'individual'::public.price_role, 126999.06, true
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 41, 45, 'individual'::public.price_role, 132574.63, true
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 46, 50, 'individual'::public.price_role, 147318.91, true
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 51, 55, 'individual'::public.price_role, 189569.32, true
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 56, 64, 'individual'::public.price_role, 281628.15, true
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 65, null, 'individual'::public.price_role, 376660.62, true
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, null, 'primer_hijo'::public.price_role, 69967.92, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, null, 'primer_hijo'::public.price_role, 77314.55, true
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 25'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 18, 27, 'conyuge'::public.price_role, 96472.45, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 28, 35, 'conyuge'::public.price_role, 96472.45, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 36, 40, 'conyuge'::public.price_role, 96472.45, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 41, 45, 'conyuge'::public.price_role, 101296.08, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 46, 50, 'conyuge'::public.price_role, 111908.05, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 51, 55, 'conyuge'::public.price_role, 144708.68, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 56, 64, 'conyuge'::public.price_role, 216098.30, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 65, null, 'conyuge'::public.price_role, 289417.36, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 18, 27, 'conyuge'::public.price_role, 106602.06, true
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 28, 35, 'conyuge'::public.price_role, 106602.06, true
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 36, 40, 'conyuge'::public.price_role, 106602.06, true
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 41, 45, 'conyuge'::public.price_role, 111932.17, true
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 46, 50, 'conyuge'::public.price_role, 123658.39, true
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 51, 55, 'conyuge'::public.price_role, 159903.09, true
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 56, 64, 'conyuge'::public.price_role, 238788.62, true
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 65, null, 'conyuge'::public.price_role, 319806.19, true
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 18, 27, 'individual'::public.price_role, 96472.45, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 28, 35, 'individual'::public.price_role, 96472.45, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 36, 40, 'individual'::public.price_role, 96472.45, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 41, 45, 'individual'::public.price_role, 101296.08, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 46, 50, 'individual'::public.price_role, 111908.05, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 51, 55, 'individual'::public.price_role, 144708.68, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 56, 64, 'individual'::public.price_role, 216098.30, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 65, null, 'individual'::public.price_role, 289417.36, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 18, 27, 'individual'::public.price_role, 106602.06, true
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 28, 35, 'individual'::public.price_role, 106602.06, true
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 36, 40, 'individual'::public.price_role, 106602.06, true
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 41, 45, 'individual'::public.price_role, 111932.17, true
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 46, 50, 'individual'::public.price_role, 123658.39, true
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 51, 55, 'individual'::public.price_role, 159903.09, true
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 56, 64, 'individual'::public.price_role, 238788.62, true
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 65, null, 'individual'::public.price_role, 319806.19, true
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, null, 'primer_hijo'::public.price_role, 58848.20, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, null, 'primer_hijo'::public.price_role, 65027.26, true
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 300'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 18, 27, 'conyuge'::public.price_role, 114931.27, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 28, 35, 'conyuge'::public.price_role, 114931.27, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 36, 40, 'conyuge'::public.price_role, 114931.27, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 41, 45, 'conyuge'::public.price_role, 119977.04, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 46, 50, 'conyuge'::public.price_role, 133320.28, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 51, 55, 'conyuge'::public.price_role, 171555.95, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 56, 64, 'conyuge'::public.price_role, 254867.11, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 65, null, 'conyuge'::public.price_role, 340869.34, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 18, 27, 'conyuge'::public.price_role, 126999.06, true
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 28, 35, 'conyuge'::public.price_role, 126999.06, true
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 36, 40, 'conyuge'::public.price_role, 126999.06, true
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 41, 45, 'conyuge'::public.price_role, 132574.63, true
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 46, 50, 'conyuge'::public.price_role, 147318.91, true
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 51, 55, 'conyuge'::public.price_role, 189569.32, true
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 56, 64, 'conyuge'::public.price_role, 281628.15, true
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 65, null, 'conyuge'::public.price_role, 376660.62, true
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 18, 27, 'individual'::public.price_role, 114931.27, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 28, 35, 'individual'::public.price_role, 114931.27, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 36, 40, 'individual'::public.price_role, 114931.27, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 41, 45, 'individual'::public.price_role, 119977.04, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 46, 50, 'individual'::public.price_role, 133320.28, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 51, 55, 'individual'::public.price_role, 171555.95, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 56, 64, 'individual'::public.price_role, 254867.11, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 65, null, 'individual'::public.price_role, 340869.34, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 18, 27, 'individual'::public.price_role, 126999.06, true
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 28, 35, 'individual'::public.price_role, 126999.06, true
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 36, 40, 'individual'::public.price_role, 126999.06, true
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 41, 45, 'individual'::public.price_role, 132574.63, true
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 46, 50, 'individual'::public.price_role, 147318.91, true
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 51, 55, 'individual'::public.price_role, 189569.32, true
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 56, 64, 'individual'::public.price_role, 281628.15, true
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 65, null, 'individual'::public.price_role, 376660.62, true
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, null, 'primer_hijo'::public.price_role, 69967.92, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, null, 'primer_hijo'::public.price_role, 77314.55, true
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'ospadep'
  and pl.name = 'OS 900'
  and pl.type = 'OSPADEP SALUD'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, 65, 'conyuge'::public.price_role, 188995.00, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'MS'
  and pl.type = 'SWISS'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 66, null, 'conyuge'::public.price_role, 536912.00, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'MS'
  and pl.type = 'SWISS'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, 65, 'familiar_cargo'::public.price_role, 188995.00, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'MS'
  and pl.type = 'SWISS'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 66, null, 'familiar_cargo'::public.price_role, 536912.00, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'MS'
  and pl.type = 'SWISS'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, 65, 'individual'::public.price_role, 188995.00, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'MS'
  and pl.type = 'SWISS'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 66, null, 'individual'::public.price_role, 536912.00, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'MS'
  and pl.type = 'SWISS'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, 65, 'primer_hijo'::public.price_role, 188995.00, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'MS'
  and pl.type = 'SWISS'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 66, null, 'primer_hijo'::public.price_role, 536912.00, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'MS'
  and pl.type = 'SWISS'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, 65, 'conyuge'::public.price_role, 285504.94, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'PO62'
  and pl.type = 'SWISS'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 66, null, 'conyuge'::public.price_role, 829609.71, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'PO62'
  and pl.type = 'SWISS'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, 65, 'familiar_cargo'::public.price_role, 285504.94, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'PO62'
  and pl.type = 'SWISS'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 66, null, 'familiar_cargo'::public.price_role, 829609.71, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'PO62'
  and pl.type = 'SWISS'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, 65, 'individual'::public.price_role, 285504.94, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'PO62'
  and pl.type = 'SWISS'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 66, null, 'individual'::public.price_role, 829609.71, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'PO62'
  and pl.type = 'SWISS'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, 65, 'primer_hijo'::public.price_role, 285504.94, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'PO62'
  and pl.type = 'SWISS'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 66, null, 'primer_hijo'::public.price_role, 829609.71, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'PO62'
  and pl.type = 'SWISS'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, 65, 'conyuge'::public.price_role, 342352.58, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'PO64'
  and pl.type = 'SWISS'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 66, null, 'conyuge'::public.price_role, 993406.30, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'PO64'
  and pl.type = 'SWISS'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, 65, 'familiar_cargo'::public.price_role, 342352.58, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'PO64'
  and pl.type = 'SWISS'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 66, null, 'familiar_cargo'::public.price_role, 993406.30, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'PO64'
  and pl.type = 'SWISS'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, 65, 'individual'::public.price_role, 342352.58, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'PO64'
  and pl.type = 'SWISS'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 66, null, 'individual'::public.price_role, 993406.30, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'PO64'
  and pl.type = 'SWISS'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, 65, 'primer_hijo'::public.price_role, 342352.58, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'PO64'
  and pl.type = 'SWISS'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 66, null, 'primer_hijo'::public.price_role, 993406.30, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'PO64'
  and pl.type = 'SWISS'
on conflict do nothing;
-- Swiss SB02: se agrega banda 0-65 (faltaba → error titular <66). Banda 66+ reemplaza importes erróneos del parse (~78% de SB04; validar en tarifario).
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, 65, 'conyuge'::public.price_role, 175623.09, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'SB02'
  and pl.type = 'SWISS'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, 65, 'familiar_cargo'::public.price_role, 175623.09, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'SB02'
  and pl.type = 'SWISS'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, 65, 'individual'::public.price_role, 175623.09, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'SB02'
  and pl.type = 'SWISS'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, 65, 'primer_hijo'::public.price_role, 175623.09, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'SB02'
  and pl.type = 'SWISS'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 66, null, 'conyuge'::public.price_role, 480261.19, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'SB02'
  and pl.type = 'SWISS'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 66, null, 'familiar_cargo'::public.price_role, 480261.19, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'SB02'
  and pl.type = 'SWISS'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 66, null, 'individual'::public.price_role, 480261.19, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'SB02'
  and pl.type = 'SWISS'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 66, null, 'primer_hijo'::public.price_role, 480261.19, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'SB02'
  and pl.type = 'SWISS'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, 65, 'conyuge'::public.price_role, 225157.81, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'SB04'
  and pl.type = 'SWISS'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 66, null, 'conyuge'::public.price_role, 615719.48, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'SB04'
  and pl.type = 'SWISS'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, 65, 'familiar_cargo'::public.price_role, 225157.81, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'SB04'
  and pl.type = 'SWISS'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 66, null, 'familiar_cargo'::public.price_role, 615719.48, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'SB04'
  and pl.type = 'SWISS'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, 65, 'individual'::public.price_role, 225157.81, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'SB04'
  and pl.type = 'SWISS'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 66, null, 'individual'::public.price_role, 615719.48, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'SB04'
  and pl.type = 'SWISS'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 0, 65, 'primer_hijo'::public.price_role, 225157.81, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'SB04'
  and pl.type = 'SWISS'
on conflict do nothing;
insert into public.prices (plan_id, age_min, age_max, role, price, is_particular)
select pl.id, 66, null, 'primer_hijo'::public.price_role, 615719.48, false
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical'
  and pl.name = 'SB04'
  and pl.type = 'SWISS'
on conflict do nothing;

commit;
