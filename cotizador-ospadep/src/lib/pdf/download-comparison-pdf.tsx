import { pdf } from "@react-pdf/renderer";

import { formatMoney } from "@/lib/money";
import { providerLogoSrc } from "@/lib/provider-logos";
import type { DetailedQuoteResult, Member } from "@/types/quotes";

import {
  ComparisonPdfDocument,
  ensureComparisonPdfFonts,
  type ComparisonPdfFeature,
  type ComparisonPdfInput,
  type ComparisonPdfRowInput,
  type ComparisonPdfSummaryItem,
} from "./comparison-document";

export type PlanQuoteRowForPdf = {
  plan: { name: string; type: string };
  providerName: string;
  providerSlug: string;
  result: DetailedQuoteResult | null;
  error?: string;
};

function memberSummary(members: Member[]): string {
  const holder = members.find((x) => x.role === "holder");
  const spouse = members.find((x) => x.role === "spouse");
  const kids = members.filter((x) => x.role === "child");
  const parts: string[] = [];
  if (holder) parts.push(`Titular ${holder.age} años`);
  if (spouse) parts.push(`Cónyuge ${spouse.age} años`);
  if (kids.length > 0) {
    parts.push(
      `${kids.length} menor${kids.length > 1 ? "es" : ""} (${kids
        .map((k) => k.age)
        .join(", ")} años)`,
    );
  }
  return parts.join(" · ") || "—";
}

function membersCount(members: Member[]): number {
  return members.length;
}

function friendlyPdfError(msg: string): string {
  if (msg.length > 140) {
    return `${msg.slice(0, 137)}…`;
  }
  return msg;
}

function contributionsAppliedAmount(result: DetailedQuoteResult): number {
  const line = result.discounts.find((d) => d.label === "Aportes");
  return line != null && line.value > 0 ? line.value : 0;
}

function formatEffectiveMonth(iso: string): string {
  const ymd = iso.slice(0, 10);
  const [y, m] = ymd.split("-");
  const year = Number(y);
  const monthIdx = Number(m) - 1;
  if (!Number.isFinite(year) || !Number.isFinite(monthIdx)) return iso;
  const date = new Date(year, monthIdx, 1);
  const label = date.toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatQuoteDate(now: Date): string {
  return now.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function resolveLogoUrl(slug: string): string | undefined {
  const path = providerLogoSrc(slug);
  if (!path) return undefined;
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${encodeURI(path)}`;
}

export async function downloadComparisonPdf(params: {
  rows: PlanQuoteRowForPdf[];
  effectiveMonthISO: string;
  scopeLabel: string;
  particular: boolean;
  lastInputs: {
    holderAporte: number;
    spouseAporte: number;
    members: Member[];
  } | null;
  commercialDiscounts: { label: string; amount: number }[];
  bestTotal: number | null;
}): Promise<void> {
  if (typeof window !== "undefined") {
    ensureComparisonPdfFonts(window.location.origin);
  }
  const now = new Date();
  const quoteDateLabel = formatQuoteDate(now);
  const effectiveMonthLabel = formatEffectiveMonth(params.effectiveMonthISO);
  const monthSlug = params.effectiveMonthISO.slice(0, 7);
  const quoteRef = `COT-${monthSlug}-${now.getTime().toString(36).slice(-5).toUpperCase()}`;

  const ospadepLogoSrc =
    typeof window !== "undefined"
      ? `${window.location.origin}/LOGO%20OSPADEP_04.png`
      : undefined;

  const groupSummary = params.lastInputs
    ? memberSummary(params.lastInputs.members)
    : "—";
  const groupCount = params.lastInputs
    ? membersCount(params.lastInputs.members)
    : 0;

  const totalAportes = params.lastInputs
    ? params.lastInputs.holderAporte + params.lastInputs.spouseAporte
    : 0;
  const contributionsLine =
    totalAportes > 0
      ? `${formatMoney(totalAportes)} descontados`
      : "Sin aportes";

  const activeDiscounts = params.commercialDiscounts.filter(
    (d) => d.amount > 0,
  );
  const totalCommercialDiscounts = activeDiscounts.reduce(
    (acc, d) => acc + d.amount,
    0,
  );
  const commercialDiscountsLine =
    activeDiscounts.length === 0
      ? "Ninguno"
      : activeDiscounts
          .map((d) => `${d.label} (${formatMoney(d.amount)})`)
          .join(" · ");

  const modalityLabel = params.particular
    ? "Particular"
    : "Con aportes / relación de dependencia";

  const quotedCount = params.rows.length;

  const summaryItems: ComparisonPdfSummaryItem[] = [
    { label: "Alcance", value: params.scopeLabel },
    { label: "Modalidad", value: modalityLabel },
    {
      label: "Grupo familiar",
      value:
        groupCount > 0
          ? `${groupSummary} — ${groupCount} integrante${groupCount > 1 ? "s" : ""}`
          : groupSummary,
    },
    { label: "Aportes mensuales", value: contributionsLine },
    { label: "Descuentos comerciales", value: commercialDiscountsLine },
    {
      label: "Planes cotizados",
      value: `${quotedCount} plan${quotedCount === 1 ? "" : "es"}`,
    },
  ];

  function buildFeatures(row: PlanQuoteRowForPdf): ComparisonPdfFeature[] {
    const features: ComparisonPdfFeature[] = [];
    const result = row.result;
    if (!result) {
      features.push({
        label: "No fue posible calcular la cuota con los datos actuales.",
      });
      return features;
    }

    features.push({
      label: `Precio de tarifario ${formatMoney(result.basePrice)}`,
      emphasis: true,
    });

    const appliedDiscounts = result.discounts.filter((d) => d.value > 0);
    for (const d of appliedDiscounts) {
      features.push({
        label: `${d.label}: -${formatMoney(d.value)}`,
      });
    }

    if (appliedDiscounts.length === 0) {
      features.push({ label: "Sin descuentos ni aportes aplicados." });
    }

    if (totalCommercialDiscounts > 0) {
      const hasCommercialInResult = appliedDiscounts.some((d) =>
        activeDiscounts.some((ad) => ad.label === d.label),
      );
      if (!hasCommercialInResult) {
        features.push({
          label: `Incluye descuentos comerciales por ${formatMoney(totalCommercialDiscounts)}`,
        });
      }
    }

    features.push({
      label: `Vigencia tarifaria: ${effectiveMonthLabel}`,
    });

    return features;
  }

  const pdfRows: ComparisonPdfRowInput[] = params.rows.map((row) => {
    const isBest =
      row.result != null &&
      params.bestTotal != null &&
      row.result.total === params.bestTotal;
    const contribAmt = row.result ? contributionsAppliedAmount(row.result) : 0;
    const strikeThroughPrice =
      contribAmt > 0 && row.result
        ? formatMoney(row.result.total + contribAmt)
        : undefined;
    return {
      providerName: row.providerName,
      providerSlug: row.providerSlug,
      logoSrc: resolveLogoUrl(row.providerSlug),
      planName: row.plan.name,
      planType: row.plan.type || "Plan",
      finalText: row.result ? formatMoney(row.result.total) : "Sin tarifa",
      strikeThroughPrice,
      hasContributionDiscount: contribAmt > 0,
      isBest,
      features: buildFeatures(row),
      errorNote: row.error ? friendlyPdfError(row.error) : undefined,
    };
  });

  const input: ComparisonPdfInput = {
    documentLabel: "COTIZACIÓN",
    quoteRef,
    heroTitle: "Elegí el plan de salud que mejor se adapta a vos",
    heroSubtitle:
      "Compará prestadores, montos estimados y vigencia tarifaria. Los valores reflejan la simulación realizada en el cotizador OSPADEP.",
    tagline:
      "Obra Social del Personal de Aeronavegación de Entes Privados (OSPADEP).",
    title: "Cotización de planes de salud — OSPADEP",
    logoSrc: ospadepLogoSrc,
    quoteDateLabel,
    effectiveMonthLabel,
    summaryItems,
    rows: pdfRows,
    bestPriceLabel: "MÁS CONVENIENTE",
    regularPriceLabel: "OPCIÓN COTIZADA",
    disclaimer:
      "Los importes son estimaciones según tarifario e ítems aplicados en esta simulación; no incluyen IVA ni constituyen oferta vinculante. " +
      "Verificá copagos, carencias, prestadores y condiciones de contratación con cada entidad antes del cierre.",
    footerPhoneLine: "Información institucional y canales de contacto",
    footerWebLine: "www.ospadep.com",
  };

  const blob = await pdf(<ComparisonPdfDocument {...input} />).toBlob();
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement("a");
    a.href = url;
    a.download = `cotizacion-planes-${monthSlug}.pdf`;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}
