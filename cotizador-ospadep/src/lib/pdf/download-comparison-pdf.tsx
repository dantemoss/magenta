import { pdf } from "@react-pdf/renderer";

import { formatMoney } from "@/lib/money";
import type { DetailedQuoteResult, Member } from "@/types/quotes";

import {
  ComparisonPdfDocument,
  type ComparisonPdfInput,
  type ComparisonPdfRowInput,
} from "./comparison-document";

export type PlanQuoteRowForPdf = {
  plan: { name: string; type: string };
  providerName: string;
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
      `${kids.length} menor${kids.length > 1 ? "es" : ""} (${kids.map((k) => k.age).join(", ")} años)`,
    );
  }
  return parts.join(" · ");
}

function friendlyPdfError(msg: string): string {
  if (msg.length > 120) {
    return `${msg.slice(0, 117)}…`;
  }
  return msg;
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
  const monthLabel = params.effectiveMonthISO.slice(0, 7);
  const now = new Date();
  const generatedAtLabel = now.toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  });

  const groupSummary = params.lastInputs
    ? memberSummary(params.lastInputs.members)
    : "—";

  const totalAportes = params.lastInputs
    ? params.lastInputs.holderAporte + params.lastInputs.spouseAporte
    : 0;
  const contributionsLine =
    totalAportes > 0
      ? `${formatMoney(totalAportes)} descontados de cada plan cotizado.`
      : "Sin aportes descontados.";

  const disc = params.commercialDiscounts.filter((d) => d.amount > 0);
  const commercialDiscountsLine =
    disc.length === 0
      ? "Ninguno."
      : disc.map((d) => `${d.label}: ${formatMoney(d.amount)}`).join(" · ");

  const pdfRows: ComparisonPdfRowInput[] = params.rows.map((row) => {
    const isBest =
      row.result != null &&
      params.bestTotal != null &&
      row.result.total === params.bestTotal;
    return {
      providerName: row.providerName,
      planName: row.plan.name,
      planType: row.plan.type,
      finalText: row.result ? formatMoney(row.result.total) : "—",
      isBest,
      errorNote: row.error ? friendlyPdfError(row.error) : undefined,
    };
  });

  const input: ComparisonPdfInput = {
    title: "Propuesta comercial — comparativa de planes",
    effectiveMonthLabel: monthLabel,
    generatedAtLabel,
    scopeLabel: params.scopeLabel,
    particularLabel: params.particular
      ? "Particular"
      : "Con aportes / relación de dependencia",
    groupSummary,
    contributionsLine,
    commercialDiscountsLine,
    rows: pdfRows,
    disclaimer:
      "Documento de uso comercial interno. Los importes son estimaciones según tarifario " +
      "vigente a la fecha indicada; no constituyen oferta vinculante. Verificar condiciones " +
      "de contratación, copagos y vigencia antes del cierre con el prestador.",
  };

  const blob = await pdf(<ComparisonPdfDocument {...input} />).toBlob();
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement("a");
    a.href = url;
    a.download = `comparativa-planes-${monthLabel}.pdf`;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}
