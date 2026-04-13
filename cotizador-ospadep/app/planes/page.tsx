"use client";

import * as React from "react";
import Image from "next/image";

import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import { formatMoney } from "@/lib/money";
import { monthStartISO } from "@/lib/month";
import type { PriceRole, PriceRow } from "@/lib/engine/strategies";
import { providerLogoSrc } from "@/lib/provider-logos";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

type ProviderRow = { id: string; name: string; slug: string };
type PlanRow = { id: string; provider_id: string; name: string; type: string };

function roleLabel(role: PriceRole): string {
  const map: Record<PriceRole, string> = {
    individual: "Individual",
    conyuge: "Cónyuge",
    matrimonio: "Matrimonio",
    primer_hijo: "Primer hijo",
    segundo_hijo: "Segundo hijo",
    hijo_adulto: "Hijo adulto",
    familiar_cargo: "Familiar a cargo",
    adulto_conyugue: "Adulto / Cónyuge",
    hijo_1_menor: "Hijo 1 (menor)",
    hijo_2_mas_menores: "Hijo 2+ (menores)",
  };
  return map[role] ?? role;
}

function ageLabel(min: number, max: number | null): string {
  if (max === null) return `${min}+`;
  if (min === max) return `${min}`;
  return `${min}–${max}`;
}

function getErrorMessage(e: unknown, fallback: string): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "object" && e !== null && "message" in e) {
    const m = (e as { message?: unknown }).message;
    if (typeof m === "string" && m.trim() !== "") return m;
  }
  return fallback;
}

export default function PlanPricesPage() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const effectiveMonth = React.useMemo(() => monthStartISO(), []);

  const [providers, setProviders] = React.useState<ProviderRow[]>([]);
  const [plans, setPlans] = React.useState<PlanRow[]>([]);
  const [prices, setPrices] = React.useState<PriceRow[]>([]);

  const [providerFilter, setProviderFilter] = React.useState<string>("all");
  const [query, setQuery] = React.useState("");
  const [isParticular, setIsParticular] = React.useState<"all" | "particular" | "no_particular">(
    "all",
  );

  React.useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setError(null);

      if (!isSupabaseConfigured() || !supabase) {
        setError(
          "Falta configurar Supabase para ver precios base. Creá `cotizador-ospadep/.env.local` con NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.",
        );
        setLoading(false);
        return;
      }

      try {
        const { data: provs, error: provErr } = await supabase
          .from("providers")
          .select("id,name,slug")
          .order("name");
        if (provErr) throw provErr;

        const { data: pls, error: planErr } = await supabase
          .from("plans")
          .select("id,provider_id,name,type")
          .order("name");
        if (planErr) throw planErr;

        const { data: prs, error: prErr } = await supabase
          .from("prices")
          .select("plan_id,age_min,age_max,role,price,is_particular,effective_month")
          .eq("effective_month", effectiveMonth)
          .order("plan_id")
          .order("role")
          .order("age_min");
        if (prErr) throw prErr;

        if (!alive) return;
        setProviders((provs ?? []) as ProviderRow[]);
        setPlans((pls ?? []) as PlanRow[]);
        setPrices((prs ?? []) as PriceRow[]);
      } catch (e) {
        if (!alive) return;
        setError(getErrorMessage(e, "Error cargando precios base"));
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }
    void load();
    return () => {
      alive = false;
    };
  }, [effectiveMonth]);

  const providerById = React.useMemo(
    () => new Map(providers.map((p) => [p.id, p])),
    [providers],
  );

  const pricesByPlanId = React.useMemo(() => {
    const grouped: Record<string, PriceRow[]> = {};
    for (const row of prices) {
      if (isParticular !== "all") {
        const want = isParticular === "particular";
        if (row.is_particular !== want) continue;
      }
      (grouped[row.plan_id] ??= []).push(row);
    }
    return grouped;
  }, [prices, isParticular]);

  const filteredPlans = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return plans.filter((pl) => {
      if (providerFilter !== "all" && pl.provider_id !== providerFilter) return false;
      if (!q) return true;
      const prov = providerById.get(pl.provider_id);
      const haystack = `${prov?.name ?? ""} ${pl.name} ${pl.type}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [plans, providerFilter, query, providerById]);

  return (
    <main className="flex-1 bg-zinc-50 px-4 py-10 dark:bg-black">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Lista de precios</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Buscá un plan y mirá los valores por edad. Mes: {effectiveMonth.slice(0, 7)}.
            </p>
          </div>
          <Badge variant="secondary">Precios del mes</Badge>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Buscar y filtrar</CardTitle>
            <CardDescription>Encontrá un plan rápido.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Prestador</Label>
              <Select value={providerFilter} onValueChange={setProviderFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {providers.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Buscar</Label>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ej: Medife, Plan 310…"
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={isParticular}
                onValueChange={(v) =>
                  setIsParticular(v as "all" | "particular" | "no_particular")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="no_particular">Obra social</SelectItem>
                  <SelectItem value="particular">Particular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 space-y-4">
          {loading ? (
            <Card>
              <CardContent className="p-4 text-sm text-muted-foreground">
                Cargando…
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="p-4 text-sm text-destructive">
                {error}
              </CardContent>
            </Card>
          ) : filteredPlans.length === 0 ? (
            <Card>
              <CardContent className="p-4 text-sm text-muted-foreground">
                No hay planes que coincidan con los filtros.
              </CardContent>
            </Card>
          ) : (
            filteredPlans.map((pl) => {
              const prov = providerById.get(pl.provider_id);
              const logoSrc = prov ? providerLogoSrc(prov.slug) : null;
              const rows = pricesByPlanId[pl.id] ?? [];

              return (
                <Card key={pl.id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          {logoSrc ? (
                            <Image
                              src={logoSrc}
                              alt={`${prov?.name ?? "Prestador"} logo`}
                              width={28}
                              height={28}
                              className="h-7 w-7 rounded-md border border-border bg-white object-contain p-1"
                            />
                          ) : null}
                          <CardTitle className="truncate">
                            {prov?.name ?? "Prestador"} · {pl.name}
                          </CardTitle>
                        </div>
                        <CardDescription className="truncate">
                          {pl.type}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">{rows.length} filas</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {rows.length === 0 ? (
                      <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
                        Sin precios cargados para este plan (con el filtro actual).
                      </div>
                    ) : (
                      <div className="overflow-hidden rounded-lg border border-border bg-card">
                        <div className="grid grid-cols-[1fr_110px_140px] gap-2 border-b border-border px-3 py-2 text-xs font-medium text-muted-foreground">
                          <div>Detalle</div>
                          <div className="text-right">Edad</div>
                          <div className="text-right">Precio / mes</div>
                        </div>
                        {rows.map((r, idx) => (
                          <div
                            key={`${pl.id}-${idx}-${r.role}-${r.age_min}-${String(r.age_max)}-${String(
                              r.is_particular,
                            )}`}
                            className="grid grid-cols-[1fr_110px_140px] gap-2 px-3 py-2 text-sm"
                          >
                            <div className="min-w-0">
                              <div className="truncate font-medium">
                                {roleLabel(r.role)}
                              </div>
                              <div className="truncate text-xs text-muted-foreground">
                                {r.is_particular ? "Particular" : "Obra social"}
                              </div>
                            </div>
                            <div className="text-right tabular-nums text-muted-foreground">
                              {ageLabel(r.age_min, r.age_max)}
                            </div>
                            <div className="text-right tabular-nums font-medium">
                              {formatMoney(r.price)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <Separator />
                    <p className="text-xs text-muted-foreground">
                      Nota: valores por persona y edad. El total puede variar según el grupo familiar.
                    </p>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}

