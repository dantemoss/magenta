-- Deja una sola fila por plan, rol, edad, particular y mes.
-- Se queda con la más nueva. Después el índice evita que un aumento vuelva a duplicar.
-- Ejecutar en el SQL Editor de Supabase, una sola vez, antes de aplicar el 2,2%.

begin;

delete from public.prices p
using (
  select id
  from (
    select
      id,
      row_number() over (
        partition by plan_id, role, age_min, age_max, is_particular, effective_month
        order by updated_at desc nulls last, price desc, id
      ) as rn
    from public.prices
  ) ranked
  where ranked.rn > 1
) dup
where p.id = dup.id;

drop index if exists public.prices_unique_month;

create unique index prices_unique_month
  on public.prices (plan_id, role, age_min, age_max, is_particular, effective_month)
  nulls not distinct;

commit;
