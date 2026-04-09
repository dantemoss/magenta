export type MoneyFormatOptions = {
  currency?: string;
  locale?: string;
  maximumFractionDigits?: number;
  minimumFractionDigits?: number;
};

const defaultLocale = "es-AR";
const defaultCurrency = "ARS";

export function formatMoney(
  value: number,
  opts: MoneyFormatOptions = {},
): string {
  const {
    locale = defaultLocale,
    currency = defaultCurrency,
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
  } = opts;

  const n = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "symbol",
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(n);
}

export function formatMoneyCompact(
  value: number,
  opts: MoneyFormatOptions = {},
): string {
  const { locale = defaultLocale, currency = defaultCurrency } = opts;
  const n = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(n);
}

