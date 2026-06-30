export type PriceBatchScope = "both" | "particular" | "no_particular";

export type ProviderPctInput = {
  providerId: string;
  providerName: string;
  pctText: string;
};

export type PlanOverrideInput = {
  planId: string;
  planName: string;
  providerName: string;
  pctText: string;
};

export type PriceBatchRuleInsert = {
  batch_id: string;
  provider_id: string | null;
  plan_id: string | null;
  pct: number;
  scope: PriceBatchScope;
};

export function parsePctText(text: string): number | null {
  const trimmed = text.trim();
  if (trimmed === "") return null;
  const n = Number(trimmed.replace(",", "."));
  if (!Number.isFinite(n)) return null;
  return n;
}

export function buildProviderPctMap(
  providers: { id: string; name: string }[],
  providerPcts: Record<string, string>,
): ProviderPctInput[] {
  return providers.map((p) => ({
    providerId: p.id,
    providerName: p.name,
    pctText: providerPcts[p.id] ?? "",
  }));
}

export function collectActiveProviderRules(
  inputs: ProviderPctInput[],
  batchId: string,
  scope: PriceBatchScope,
): PriceBatchRuleInsert[] {
  const rules: PriceBatchRuleInsert[] = [];
  for (const row of inputs) {
    const pct = parsePctText(row.pctText);
    if (pct == null || pct === 0) continue;
    rules.push({
      batch_id: batchId,
      provider_id: row.providerId,
      plan_id: null,
      pct,
      scope,
    });
  }
  return rules;
}

export function collectPlanOverrideRules(
  overrides: PlanOverrideInput[],
  batchId: string,
  scope: PriceBatchScope,
): PriceBatchRuleInsert[] {
  const rules: PriceBatchRuleInsert[] = [];
  for (const row of overrides) {
    const pct = parsePctText(row.pctText);
    if (pct == null || pct === 0) continue;
    rules.push({
      batch_id: batchId,
      provider_id: null,
      plan_id: row.planId,
      pct,
      scope,
    });
  }
  return rules;
}

export function validateBatchRules(rules: PriceBatchRuleInsert[]): string | null {
  if (rules.length === 0) {
    return "Indicá al menos un prestador o plan con % distinto de 0.";
  }
  for (const r of rules) {
    if (!Number.isFinite(r.pct)) {
      return "Hay un porcentaje inválido en las reglas.";
    }
  }
  return null;
}

export function buildBatchNotes(
  sourceMonth: string,
  targetMonth: string,
  providerRules: PriceBatchRuleInsert[],
  planRules: PriceBatchRuleInsert[],
): string {
  const providerParts = providerRules.map((r) => `prov:${r.provider_id}=${r.pct}%`);
  const planParts = planRules.map((r) => `plan:${r.plan_id}=${r.pct}%`);
  const summary = [...providerParts, ...planParts].join(", ");
  return `Mensual ${sourceMonth}→${targetMonth}${summary ? ` [${summary}]` : ""}`;
}

export function initProviderPcts(providerIds: string[]): Record<string, string> {
  return Object.fromEntries(providerIds.map((id) => [id, ""]));
}
