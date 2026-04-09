export function monthStartISO(date: Date = new Date()): string {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  // YYYY-MM-01
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}

export function monthInputToMonthStartISO(monthInput: string): string {
  // Espera "YYYY-MM"
  const s = monthInput.trim();
  if (!/^\d{4}-\d{2}$/.test(s)) {
    throw new Error("Mes inválido. Usá formato YYYY-MM.");
  }
  return `${s}-01`;
}

export function nextMonthInput(monthInput: string): string {
  const [yStr, mStr] = monthInput.split("-");
  const y = Number(yStr);
  const m = Number(mStr);
  if (!Number.isFinite(y) || !Number.isFinite(m) || m < 1 || m > 12) {
    throw new Error("Mes inválido.");
  }
  const d = new Date(y, m - 1, 1);
  d.setMonth(d.getMonth() + 1);
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${yy}-${mm}`;
}

