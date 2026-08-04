export interface Member {
  role: "holder" | "spouse" | "child" | "other";
  age: number;
}

export interface PlanDiscountLine {
  label: string;
  value: number;
}

/** Descuento comercial ingresado como % (0–100) en el cotizador. */
export interface CommercialDiscountInput {
  label: string;
  percent: number;
}

export interface QuoteRequest {
  members: Member[];
  isParticular: boolean;
  contributions: number;
  /**
   * Descuentos comerciales en % sobre el subtotal del plan (después de
   * descuentos automáticos del prestador). Se aplican antes de restar aportes.
   */
  commercialDiscounts?: CommercialDiscountInput[];
  /**
   * Plan Joven (OSPADEP): 25% a titular/cónyuge menores de 35.
   * Default true cuando corresponde; el vendedor puede desactivarlo.
   */
  applyPlanJoven?: boolean;
}

export interface QuoteResult {
  basePrice: number;
  discounts: { label: string; value: number }[];
  total: number;
  providerName: string;
}

export interface QuoteLineItem {
  memberRole: Member["role"];
  memberAge: number;
  category: string;
  price: number;
}

export interface DetailedQuoteResult extends QuoteResult {
  lineItems: QuoteLineItem[];
}

