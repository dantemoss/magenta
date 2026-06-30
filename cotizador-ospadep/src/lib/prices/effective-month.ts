import { monthStartISO } from "@/lib/month";

/** Normaliza a YYYY-MM-01. */
export function normalizeMonthISO(value: unknown): string | null {
  const s = String(value ?? "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  if (/^\d{4}-\d{2}$/.test(s)) return `${s}-01`;
  return null;
}

export function monthYYYYMM(iso: string): string {
  return iso.slice(0, 7);
}

export function distinctMonthsDesc(
  rows: { effective_month?: string | null }[],
): string[] {
  const set = new Set<string>();
  for (const r of rows) {
    const n = normalizeMonthISO(r.effective_month);
    if (n) set.add(n);
  }
  return [...set].sort((a, b) => b.localeCompare(a));
}

/**
 * Elige la vigencia a usar en el cotizador.
 * Prioridad: setting activo solo si hay precios cargados para ese mes; si no, el mes más reciente con datos.
 */
export function resolveEffectiveMonth(params: {
  activeSetting: string | null | undefined;
  availableMonthsISO: string[];
  calendarFallback?: string;
}): string {
  const available = params.availableMonthsISO.filter(Boolean);
  const active = normalizeMonthISO(params.activeSetting);
  if (active && available.includes(active)) return active;
  if (available.length > 0) return available[0]!;
  return params.calendarFallback ?? monthStartISO();
}

export function isActiveSettingStale(
  activeSetting: string | null | undefined,
  availableMonthsISO: string[],
): boolean {
  const active = normalizeMonthISO(activeSetting);
  if (!active) return false;
  if (availableMonthsISO.length === 0) return false;
  return !availableMonthsISO.includes(active);
}
