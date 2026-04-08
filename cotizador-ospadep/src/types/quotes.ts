export interface Member {
  role: "holder" | "spouse" | "child" | "other";
  age: number;
}

export interface QuoteRequest {
  members: Member[];
  isParticular: boolean;
  contributions: number;
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

