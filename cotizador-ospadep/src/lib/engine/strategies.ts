import type {
  DetailedQuoteResult,
  Member,
  QuoteLineItem,
  QuoteRequest,
  QuoteResult,
} from "@/types/quotes";

export type PriceRole =
  | "individual"
  | "conyuge"
  | "matrimonio"
  | "primer_hijo"
  | "segundo_hijo"
  | "hijo_adulto"
  | "familiar_cargo"
  | "adulto_conyugue"
  | "hijo_1_menor"
  | "hijo_2_mas_menores";

export interface PriceRow {
  plan_id: string;
  age_min: number;
  age_max: number | null;
  role: PriceRole;
  price: number;
  is_particular: boolean;
  // Para histórico mensual (cuando se selecciona por `effective_month`)
  effective_month?: string;
}

export interface QuoteStrategyContext {
  providerName: string;
  prices: PriceRow[];
  planId: string;
}

export interface QuoteStrategy {
  readonly providerName: string;
  quote(ctx: QuoteStrategyContext, req: QuoteRequest): QuoteResult;
}

export interface DetailedQuoteStrategy extends QuoteStrategy {
  quoteDetailed(ctx: QuoteStrategyContext, req: QuoteRequest): DetailedQuoteResult;
}

function assertNonNegativeNumber(name: string, value: number): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${name} debe ser un número finito >= 0`);
  }
}

function assertValidAge(age: number): void {
  if (!Number.isInteger(age) || age < 0 || age > 120) {
    throw new Error(`Edad inválida: ${age}`);
  }
}

function clampMoney(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100) / 100;
}

function getMembersByRole(members: Member[], role: Member["role"]): Member[] {
  return members.filter((m) => m.role === role);
}

function getSingleMemberOrNull(
  members: Member[],
  role: Member["role"],
): Member | null {
  const list = getMembersByRole(members, role);
  if (list.length === 0) return null;
  if (list.length > 1) {
    throw new Error(`Solo se admite un integrante con rol '${role}'`);
  }
  return list[0] ?? null;
}

function selectPriceRow(
  prices: PriceRow[],
  planId: string,
  role: PriceRole,
  age: number,
  isParticular: boolean,
): PriceRow {
  assertValidAge(age);
  const matches = prices.filter((p) => {
    if (p.plan_id !== planId) return false;
    if (p.role !== role) return false;
    if (p.is_particular !== isParticular) return false;
    const minOk = age >= p.age_min;
    const maxOk = p.age_max === null ? true : age <= p.age_max;
    return minOk && maxOk;
  });

  if (matches.length === 0) {
    throw new Error(
      `No hay precio para plan_id='${planId}', role='${role}', age=${age}, is_particular=${String(
        isParticular,
      )}`,
    );
  }
  if (matches.length > 1) {
    throw new Error(
      `Precio ambiguo para plan_id='${planId}', role='${role}', age=${age}, is_particular=${String(
        isParticular,
      )}`,
    );
  }
  return matches[0]!;
}

function sum(values: number[]): number {
  return values.reduce((acc, v) => acc + v, 0);
}

function buildResult(params: {
  providerName: string;
  basePrice: number;
  discounts: { label: string; value: number }[];
  contributions: number;
}): QuoteResult {
  assertNonNegativeNumber("basePrice", params.basePrice);
  assertNonNegativeNumber("contributions", params.contributions);
  for (const d of params.discounts) {
    assertNonNegativeNumber(`discount '${d.label}'`, d.value);
  }

  const discountsTotal = sum(params.discounts.map((d) => d.value));
  const subtotalAfterDiscounts = Math.max(0, params.basePrice - discountsTotal);
  const totalAfterContributions = Math.max(
    0,
    subtotalAfterDiscounts - params.contributions,
  );

  const discounts = [...params.discounts];
  if (params.contributions > 0) {
    discounts.push({ label: "Aportes", value: params.contributions });
  }

  return {
    providerName: params.providerName,
    basePrice: clampMoney(params.basePrice),
    discounts: discounts.map((d) => ({ ...d, value: clampMoney(d.value) })),
    total: clampMoney(totalAfterContributions),
  };
}

function buildDetailedResult(params: {
  providerName: string;
  lineItems: QuoteLineItem[];
  discounts: { label: string; value: number }[];
  contributions: number;
}): DetailedQuoteResult {
  const basePrice = sum(params.lineItems.map((i) => i.price));
  const base = buildResult({
    providerName: params.providerName,
    basePrice,
    discounts: params.discounts,
    contributions: params.contributions,
  });
  return {
    ...base,
    lineItems: params.lineItems.map((i) => ({
      ...i,
      price: clampMoney(i.price),
    })),
  };
}

function validateRequest(req: QuoteRequest): void {
  assertNonNegativeNumber("contributions", req.contributions);
  if (!Array.isArray(req.members) || req.members.length === 0) {
    throw new Error("Debe existir al menos un integrante");
  }
  for (const m of req.members) {
    assertValidAge(m.age);
  }
  const holder = getMembersByRole(req.members, "holder");
  if (holder.length !== 1) {
    throw new Error("Debe existir exactamente un Titular (role='holder')");
  }
}

export class MedifeStrategy implements DetailedQuoteStrategy {
  public readonly providerName = "Medife";

  quote(ctx: QuoteStrategyContext, req: QuoteRequest): QuoteResult {
    return this.quoteDetailed(ctx, req);
  }

  quoteDetailed(ctx: QuoteStrategyContext, req: QuoteRequest): DetailedQuoteResult {
    validateRequest(req);

    const holder = getSingleMemberOrNull(req.members, "holder")!;
    const spouse = getSingleMemberOrNull(req.members, "spouse");
    const children = getMembersByRole(req.members, "child").slice();
    const others = getMembersByRole(req.members, "other").slice();

    const lineItems: QuoteLineItem[] = [];

    if (spouse) {
      const olderAge = Math.max(holder.age, spouse.age);
      const row = selectPriceRow(
        ctx.prices,
        ctx.planId,
        "matrimonio",
        olderAge,
        req.isParticular,
      );
      lineItems.push({
        memberRole: "holder",
        memberAge: holder.age,
        category: "matrimonio (Titular + Cónyuge)",
        price: row.price,
      });
      lineItems.push({
        memberRole: "spouse",
        memberAge: spouse.age,
        category: "incluido en matrimonio",
        price: 0,
      });
    } else {
      const row = selectPriceRow(
        ctx.prices,
        ctx.planId,
        "individual",
        holder.age,
        req.isParticular,
      );
      lineItems.push({
        memberRole: "holder",
        memberAge: holder.age,
        category: "individual",
        price: row.price,
      });
    }

    let childIndex = 0;
    for (const child of children) {
      childIndex += 1;
      let role: PriceRole;
      if (child.age >= 21) {
        role = "hijo_adulto";
      } else if (childIndex === 1) {
        role = "primer_hijo";
      } else if (childIndex === 2) {
        role = "segundo_hijo";
      } else {
        role = "hijo_adulto";
      }
      const row = selectPriceRow(
        ctx.prices,
        ctx.planId,
        role,
        child.age,
        req.isParticular,
      );
      lineItems.push({
        memberRole: "child",
        memberAge: child.age,
        category: role,
        price: row.price,
      });
    }

    for (const other of others) {
      const row = selectPriceRow(
        ctx.prices,
        ctx.planId,
        "familiar_cargo",
        other.age,
        req.isParticular,
      );
      lineItems.push({
        memberRole: "other",
        memberAge: other.age,
        category: "familiar_cargo",
        price: row.price,
      });
    }

    return buildDetailedResult({
      providerName: ctx.providerName,
      lineItems,
      discounts: [],
      contributions: req.contributions,
    });
  }
}

export class OmintStrategy implements DetailedQuoteStrategy {
  public readonly providerName = "Omint";

  quote(ctx: QuoteStrategyContext, req: QuoteRequest): QuoteResult {
    return this.quoteDetailed(ctx, req);
  }

  quoteDetailed(ctx: QuoteStrategyContext, req: QuoteRequest): DetailedQuoteResult {
    validateRequest(req);

    const holder = getSingleMemberOrNull(req.members, "holder")!;
    const spouse = getSingleMemberOrNull(req.members, "spouse");
    const children = getMembersByRole(req.members, "child").slice();
    const others = getMembersByRole(req.members, "other").slice();

    const lineItems: QuoteLineItem[] = [];

    const holderRow = selectPriceRow(
      ctx.prices,
      ctx.planId,
      "adulto_conyugue",
      holder.age,
      req.isParticular,
    );
    lineItems.push({
      memberRole: "holder",
      memberAge: holder.age,
      category: "adulto_conyugue",
      price: holderRow.price,
    });

    if (spouse) {
      const spouseRow = selectPriceRow(
        ctx.prices,
        ctx.planId,
        "adulto_conyugue",
        spouse.age,
        req.isParticular,
      );
      lineItems.push({
        memberRole: "spouse",
        memberAge: spouse.age,
        category: "adulto_conyugue",
        price: spouseRow.price,
      });
    }

    let minorChildCount = 0;
    for (const child of children) {
      if (child.age >= 25) {
        const row = selectPriceRow(
          ctx.prices,
          ctx.planId,
          "adulto_conyugue",
          child.age,
          req.isParticular,
        );
        lineItems.push({
          memberRole: "child",
          memberAge: child.age,
          category: "adulto_conyugue",
          price: row.price,
        });
      } else {
        minorChildCount += 1;
        const role: PriceRole =
          minorChildCount === 1 ? "hijo_1_menor" : "hijo_2_mas_menores";
        const row = selectPriceRow(
          ctx.prices,
          ctx.planId,
          role,
          child.age,
          req.isParticular,
        );
        lineItems.push({
          memberRole: "child",
          memberAge: child.age,
          category: role,
          price: row.price,
        });
      }
    }

    for (const other of others) {
      const row = selectPriceRow(
        ctx.prices,
        ctx.planId,
        "adulto_conyugue",
        other.age,
        req.isParticular,
      );
      lineItems.push({
        memberRole: "other",
        memberAge: other.age,
        category: "adulto_conyugue",
        price: row.price,
      });
    }

    return buildDetailedResult({
      providerName: ctx.providerName,
      lineItems,
      discounts: [],
      contributions: req.contributions,
    });
  }
}

export class OspadepStrategy implements DetailedQuoteStrategy {
  public readonly providerName = "OSPADEP";

  quote(ctx: QuoteStrategyContext, req: QuoteRequest): QuoteResult {
    return this.quoteDetailed(ctx, req);
  }

  quoteDetailed(ctx: QuoteStrategyContext, req: QuoteRequest): DetailedQuoteResult {
    validateRequest(req);

    const holder = getSingleMemberOrNull(req.members, "holder")!;
    const spouse = getSingleMemberOrNull(req.members, "spouse");
    const children = getMembersByRole(req.members, "child").slice();
    const others = getMembersByRole(req.members, "other").slice();

    const items: { member: Member; role: PriceRole; price: number }[] = [];

    const holderRow = selectPriceRow(
      ctx.prices,
      ctx.planId,
      "individual",
      holder.age,
      req.isParticular,
    );
    items.push({ member: holder, role: "individual", price: holderRow.price });

    if (spouse) {
      const spouseRow = selectPriceRow(
        ctx.prices,
        ctx.planId,
        "conyuge",
        spouse.age,
        req.isParticular,
      );
      items.push({ member: spouse, role: "conyuge", price: spouseRow.price });
    }

    for (const child of children) {
      const row = selectPriceRow(
        ctx.prices,
        ctx.planId,
        "primer_hijo",
        child.age,
        req.isParticular,
      );
      items.push({ member: child, role: "primer_hijo", price: row.price });
    }

    for (const other of others) {
      const row = selectPriceRow(
        ctx.prices,
        ctx.planId,
        "familiar_cargo",
        other.age,
        req.isParticular,
      );
      items.push({ member: other, role: "familiar_cargo", price: row.price });
    }

    const lineItems: QuoteLineItem[] = items.map((i) => ({
      memberRole: i.member.role,
      memberAge: i.member.age,
      category: i.role,
      price: i.price,
    }));

    const discounts: { label: string; value: number }[] = [];
    if (!req.isParticular) {
      let planJovenDiscount = 0;
      for (const it of items) {
        const isAdultoTitularOConyuge =
          it.member.role === "holder" || it.member.role === "spouse";
        if (isAdultoTitularOConyuge && it.member.age < 35) {
          planJovenDiscount += it.price * 0.25;
        }
      }
      if (planJovenDiscount > 0) {
        discounts.push({ label: "Plan Joven", value: planJovenDiscount });
      }
    }

    return buildDetailedResult({
      providerName: ctx.providerName,
      lineItems,
      discounts,
      contributions: req.contributions,
    });
  }
}

export class SwissStrategy implements DetailedQuoteStrategy {
  public readonly providerName = "Swiss Medical";

  quote(ctx: QuoteStrategyContext, req: QuoteRequest): QuoteResult {
    return this.quoteDetailed(ctx, req);
  }

  quoteDetailed(ctx: QuoteStrategyContext, req: QuoteRequest): DetailedQuoteResult {
    validateRequest(req);

    const lineItems: QuoteLineItem[] = [];
    for (const m of req.members) {
      let role: PriceRole;
      if (m.role === "holder") role = "individual";
      else if (m.role === "spouse") role = "conyuge";
      else if (m.role === "child") role = "primer_hijo";
      else role = "familiar_cargo";

      const row = selectPriceRow(
        ctx.prices,
        ctx.planId,
        role,
        m.age,
        req.isParticular,
      );
      lineItems.push({
        memberRole: m.role,
        memberAge: m.age,
        category: role,
        price: row.price,
      });
    }

    return buildDetailedResult({
      providerName: ctx.providerName,
      lineItems,
      discounts: [],
      contributions: req.contributions,
    });
  }
}

