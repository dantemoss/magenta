import type { PriceRow } from "@/lib/engine/strategies";

/**
 * Si en `prices` quedaron filas duplicadas con la misma clave lógica (mismo plan, rol,
 * rango etario, particular y mes) pero distinto importe — p. ej. tras un import sin
 * índice único alineado — nos quedamos con la de mayor tarifario (corrige glitches tipo 4647).
 */
export function dedupePriceRowsPreferHigherTariff(rows: PriceRow[]): PriceRow[] {
  const map = new Map<string, PriceRow>();
  for (const r of rows) {
    const eff = r.effective_month ?? "";
    const maxKey =
      r.age_max === null || r.age_max === undefined ? "\0open" : String(r.age_max);
    const k = `${r.plan_id}|${r.role}|${r.age_min}|${maxKey}|${String(r.is_particular)}|${eff}`;
    const prev = map.get(k);
    if (!prev || Number(r.price) > Number(prev.price)) map.set(k, r);
  }
  return [...map.values()];
}
