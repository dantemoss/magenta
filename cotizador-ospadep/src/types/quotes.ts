export interface Member {
  role: "holder" | "spouse" | "child" | "other";
  age: number;
}

export interface PlanDiscountLine {
  label: string;
  value: number;
}

export interface QuoteRequest {
  members: Member[];
  isParticular: boolean;
  contributions: number;
  /**
   * Descuentos comerciales sobre el subtotal del plan (tarifario + descuentos
   * automáticos del prestador). Se aplican antes de restar aportes.
   */
  commercialDiscounts?: PlanDiscountLine[];
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

