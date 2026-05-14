-- Elimina filas SB02 obra social 66+ con importes erróneos (~4647) que quedaron al lado
-- de las filas correctas cuando el ON CONFLICT no coincidió con el índice único real.
-- Ajustá effective_month si tu vigencia no es 2026-05-01.
begin;

delete from public.prices pr
using public.plans pl
join public.providers p on p.id = pl.provider_id
where pr.plan_id = pl.id
  and p.slug = 'swiss-medical'
  and pl.name = 'SB02'
  and pl.type = 'SWISS'
  and pr.is_particular = false
  and pr.age_min >= 66
  and pr.effective_month = '2026-05-01'::date
  and pr.price < 500000;

commit;
