-- Swiss Medical: SB04, PO62 y PO64 quedan suspendidos por resolución.
-- Siguen en la base y entran en los aumentos mensuales; el cotizador no permite seleccionarlos.
-- Para reactivar: update public.plans set suspended = false where id = '...';

begin;

alter table public.plans
  add column if not exists suspended boolean not null default false;

update public.plans pl
set suspended = true
from public.providers p
where pl.provider_id = p.id
  and p.slug = 'swiss-medical'
  and pl.name in ('SB04', 'PO62', 'PO64');

commit;
