import { normalizeMonthISO } from "@/lib/prices/effective-month";
import { supabase } from "@/lib/supabase/client";

function shiftMonth(iso: string, delta: number): string {
  const [y, m] = iso.slice(0, 7).split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  const yy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${yy}-${mm}-01`;
}

/** Pregunta mes por mes. No recorre todas las filas: eso dejaba el panel colgado. */
export async function fetchDistinctPriceMonths(): Promise<string[]> {
  if (!supabase) return [];
  const { data: newest, error } = await supabase
    .from("prices")
    .select("effective_month")
    .order("effective_month", { ascending: false })
    .limit(1);
  if (error) throw error;
  const latest = normalizeMonthISO(String(newest?.[0]?.effective_month ?? "").slice(0, 10));
  if (!latest) return [];

  const checks = Array.from({ length: 36 }, (_, i) => shiftMonth(latest, -i));
  const found = await Promise.all(
    checks.map(async (month) => {
      const { data, error: monthError } = await supabase!
        .from("prices")
        .select("effective_month")
        .eq("effective_month", month)
        .limit(1);
      if (monthError) throw monthError;
      return data && data.length > 0 ? month : null;
    }),
  );
  return found.filter((month): month is string => Boolean(month)).sort((a, b) => b.localeCompare(a));
}
