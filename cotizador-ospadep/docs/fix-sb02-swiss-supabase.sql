-- Corrección Swiss Medical plan SB02 (solo este plan).
-- Si la app usa otra vigencia, reemplazá todas las fechas '2026-05-01' por tu `active_effective_month`.
-- Valores alineados al tarifario Excel (hoja SW SB02): Por cápita → 0-65, Mayor de 65 → 66+.
--
-- Si tu tabla `prices` NO tiene columna `effective_month`, ejecutá solo el DELETE y luego
-- los INSERT del archivo `supabase/seed.sql` (bloque SB02), o quitá `effective_month` de los INSERT siguientes.

begin;

delete from public.prices
where plan_id in (
  select pl.id
  from public.plans pl
  join public.providers p on p.id = pl.provider_id
  where p.slug = 'swiss-medical'
    and pl.name = 'SB02'
    and pl.type = 'SWISS'
);

insert into public.prices (plan_id, age_min, age_max, role, price, is_particular, effective_month)
select pl.id, 0, 65, 'conyuge'::public.price_role, 233737.00, false, '2026-05-01'::date
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical' and pl.name = 'SB02' and pl.type = 'SWISS';

insert into public.prices (plan_id, age_min, age_max, role, price, is_particular, effective_month)
select pl.id, 0, 65, 'familiar_cargo'::public.price_role, 233737.00, false, '2026-05-01'::date
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical' and pl.name = 'SB02' and pl.type = 'SWISS';

insert into public.prices (plan_id, age_min, age_max, role, price, is_particular, effective_month)
select pl.id, 0, 65, 'individual'::public.price_role, 233737.00, false, '2026-05-01'::date
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical' and pl.name = 'SB02' and pl.type = 'SWISS';

insert into public.prices (plan_id, age_min, age_max, role, price, is_particular, effective_month)
select pl.id, 0, 65, 'primer_hijo'::public.price_role, 233737.00, false, '2026-05-01'::date
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical' and pl.name = 'SB02' and pl.type = 'SWISS';

insert into public.prices (plan_id, age_min, age_max, role, price, is_particular, effective_month)
select pl.id, 66, null, 'conyuge'::public.price_role, 793078.00, false, '2026-05-01'::date
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical' and pl.name = 'SB02' and pl.type = 'SWISS';

insert into public.prices (plan_id, age_min, age_max, role, price, is_particular, effective_month)
select pl.id, 66, null, 'familiar_cargo'::public.price_role, 793078.00, false, '2026-05-01'::date
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical' and pl.name = 'SB02' and pl.type = 'SWISS';

insert into public.prices (plan_id, age_min, age_max, role, price, is_particular, effective_month)
select pl.id, 66, null, 'individual'::public.price_role, 793078.00, false, '2026-05-01'::date
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical' and pl.name = 'SB02' and pl.type = 'SWISS';

insert into public.prices (plan_id, age_min, age_max, role, price, is_particular, effective_month)
select pl.id, 66, null, 'primer_hijo'::public.price_role, 793078.00, false, '2026-05-01'::date
from public.plans pl
join public.providers p on p.id = pl.provider_id
where p.slug = 'swiss-medical' and pl.name = 'SB02' and pl.type = 'SWISS';

commit;
