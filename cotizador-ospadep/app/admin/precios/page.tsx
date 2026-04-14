"use client";

import * as React from "react";

import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { formatMoney } from "@/lib/money";
import { monthInputToMonthStartISO, nextMonthInput } from "@/lib/month";
import type { PriceRow } from "@/lib/engine/strategies";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HexagonPattern } from "@/components/ui/hexagon-pattern";
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

type BatchRow = {
  id: string;
  created_at: string;
  source_month: string;
  target_month: string;
  status: "draft" | "previewed" | "applied" | "failed";
  notes: string | null;
};

type PreviewRow = {
  plan_id: string;
  role: string;
  age_min: number;
  age_max: number | null;
  is_particular: boolean;
  old_price: number;
  new_price: number;
  pct: number;
  scope: string;
  total_rows: number;
};

type ApplyBatchResult = { status?: string; [k: string]: unknown } | null;

function getErrorMessage(e: unknown, fallback: string): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "object" && e !== null && "message" in e) {
    const m = (e as { message?: unknown }).message;
    if (typeof m === "string" && m.trim() !== "") return m;
  }
  return fallback;
}

export default function AdminPricesPage() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const [providers, setProviders] = React.useState<ProviderRow[]>([]);
  const [plans, setPlans] = React.useState<PlanRow[]>([]);
  const [prices, setPrices] = React.useState<PriceRow[]>([]);
  const [batches, setBatches] = React.useState<BatchRow[]>([]);

  const [filter, setFilter] = React.useState<string>("");

  const [sourceMonth, setSourceMonth] = React.useState<string>(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  });
  const [targetMonth, setTargetMonth] = React.useState<string>(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return nextMonthInput(`${y}-${m}`);
  });
  const [pricesMonthFilter, setPricesMonthFilter] = React.useState<string>(targetMonth);
  const [pct, setPct] = React.useState<string>("0");
  const [scope, setScope] = React.useState<"both" | "particular" | "no_particular">(
    "both",
  );
  const [providerId, setProviderId] = React.useState<string>("all");
  const [planId, setPlanId] = React.useState<string>("all");

  const [preview, setPreview] = React.useState<PreviewRow[] | null>(null);
  const [lastBatchId, setLastBatchId] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setError(null);
      if (!isSupabaseConfigured() || !supabase) {
        setError("Falta configurar Supabase (.env.local).");
        setLoading(false);
        return;
      }
      try {
        const [
          { data: provs, error: provErr },
          { data: pls, error: planErr },
          { data: prs, error: prErr },
          { data: bts, error: btErr },
        ] = await Promise.all([
          supabase.from("providers").select("id,name,slug").order("name"),
          supabase.from("plans").select("id,provider_id,name,type").order("name"),
          supabase
            .from("prices")
            .select("plan_id,age_min,age_max,role,price,is_particular,effective_month")
            .order("effective_month", { ascending: false })
            .order("plan_id")
            .order("role")
            .order("age_min"),
          supabase
            .from("price_batches")
            .select("id,created_at,source_month,target_month,status,notes")
            .order("created_at", { ascending: false })
            .limit(10),
        ]);
        if (provErr) throw provErr;
        if (planErr) throw planErr;
        if (prErr) throw prErr;
        if (btErr) throw btErr;
        if (!alive) return;
        setProviders((provs ?? []) as ProviderRow[]);
        setPlans((pls ?? []) as PlanRow[]);
        setPrices((prs ?? []) as PriceRow[]);
        setBatches((bts ?? []) as BatchRow[]);
      } catch (e) {
        if (!alive) return;
        setError(getErrorMessage(e, "Error cargando datos"));
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }
    void load();
    return () => {
      alive = false;
    };
  }, []);

  const planById = React.useMemo(() => new Map(plans.map((p) => [p.id, p])), [plans]);
  const providerById = React.useMemo(
    () => new Map(providers.map((p) => [p.id, p])),
    [providers],
  );

  const filteredPrices = React.useMemo(() => {
    const q = filter.trim().toLowerCase();
    const monthFiltered =
      pricesMonthFilter === "all"
        ? prices
        : prices.filter((r) => (r.effective_month ?? "").slice(0, 7) === pricesMonthFilter);
    if (!q) return monthFiltered;
    return monthFiltered.filter((r) => {
      const pl = planById.get(r.plan_id);
      const prov = pl ? providerById.get(pl.provider_id) : null;
      const hay = `${prov?.name ?? ""} ${pl?.name ?? ""} ${pl?.type ?? ""} ${r.role}`.toLowerCase();
      return hay.includes(q);
    });
  }, [prices, pricesMonthFilter, filter, planById, providerById]);

  const availablePriceMonths = React.useMemo(() => {
    return [...new Set(prices.map((r) => (r.effective_month ?? "").slice(0, 7)).filter(Boolean))]
      .sort((a, b) => b.localeCompare(a));
  }, [prices]);

  const duplicatedRowsInSameMonth = React.useMemo(() => {
    const counter = new Map<string, number>();
    for (const r of prices) {
      const k = [
        r.plan_id,
        String(r.role),
        String(r.age_min),
        r.age_max == null ? "null" : String(r.age_max),
        r.is_particular ? "1" : "0",
        (r.effective_month ?? "").slice(0, 7),
      ].join("|");
      counter.set(k, (counter.get(k) ?? 0) + 1);
    }
    let duplicates = 0;
    for (const n of counter.values()) {
      if (n > 1) duplicates += n - 1;
    }
    return duplicates;
  }, [prices]);

  const plansForSelectedProvider = React.useMemo(() => {
    if (providerId === "all") return plans;
    return plans.filter((p) => p.provider_id === providerId);
  }, [plans, providerId]);

  async function createBatchAndPreview() {
    setError(null);
    if (!supabase) return;
    setSaving(true);
    try {
      const pctNum = Number(pct);
      if (!Number.isFinite(pctNum)) throw new Error("Porcentaje inválido");
      if (pctNum === 0) throw new Error("El % no puede ser 0");

      const source = monthInputToMonthStartISO(sourceMonth);
      const target = monthInputToMonthStartISO(targetMonth);

      const { data: batch, error: batchErr } = await supabase
        .from("price_batches")
        .insert({
          source_month: source,
          target_month: target,
          notes:
            planId !== "all"
              ? `Plan:${planId} pct:${pctNum} scope:${scope}`
              : providerId !== "all"
                ? `Provider:${providerId} pct:${pctNum} scope:${scope}`
                : `Global pct:${pctNum} scope:${scope}`,
        })
        .select("id,created_at,source_month,target_month,status,notes")
        .single();
      if (batchErr) throw batchErr;
      if (!batch) throw new Error("No se pudo crear el batch");

      const rule = {
        batch_id: batch.id,
        provider_id: providerId === "all" ? null : providerId,
        plan_id: planId === "all" ? null : planId,
        pct: pctNum,
        scope,
      };
      const { error: ruleErr } = await supabase.from("price_batch_rules").insert(rule);
      if (ruleErr) throw ruleErr;

      const { data: prev, error: prevErr } = await supabase.rpc("preview_price_batch", {
        batch: batch.id,
        sample_limit: 30,
      });
      if (prevErr) throw prevErr;

      setPreview((prev ?? []) as PreviewRow[]);
      setLastBatchId(batch.id);

      setBatches((cur) => [batch as BatchRow, ...cur].slice(0, 10));
    } catch (e) {
      setError(getErrorMessage(e, "No se pudo preparar la actualización"));
    } finally {
      setSaving(false);
    }
  }

  async function applyBatch() {
    setError(null);
    if (!supabase) return;
    if (!lastBatchId) {
      setError("Primero revisá los cambios.");
      return;
    }
    setSaving(true);
    try {
      const { data, error: rpcErr } = await supabase.rpc("apply_price_batch", {
        batch: lastBatchId,
      });
      if (rpcErr) throw rpcErr;

      // refrescar lista de batches (estado)
      const { data: bts, error: btErr } = await supabase
        .from("price_batches")
        .select("id,created_at,source_month,target_month,status,notes")
        .order("created_at", { ascending: false })
        .limit(10);
      if (btErr) throw btErr;
      setBatches((bts ?? []) as BatchRow[]);

      // refrescar precios en memoria (para vista)
      const { data: prs, error: prErr } = await supabase
        .from("prices")
        .select("plan_id,age_min,age_max,role,price,is_particular,effective_month")
        .order("effective_month", { ascending: false })
        .order("plan_id")
        .order("role")
        .order("age_min");
      if (prErr) throw prErr;
      setPrices((prs ?? []) as PriceRow[]);

      // limpiar preview solo si se aplicó
      const status = (data as ApplyBatchResult)?.status;
      if (status === "applied" || status === "already_applied") {
        setPreview(null);
        setLastBatchId(null);
      }
    } catch (e) {
      setError(getErrorMessage(e, "No se pudo aplicar la actualización"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="relative flex-1 overflow-hidden bg-[#f6f7f9] px-4 py-8">
      <HexagonPattern className="pointer-events-none absolute inset-0 text-neutral-300/35 [mask-image:radial-gradient(85%_60%_at_50%_15%,white,transparent)]" />
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <section className="relative overflow-hidden rounded-2xl bg-white px-6 py-6 shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_12px_24px_-16px_rgba(0,0,0,0.18)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#7a7a7a]">
                Panel interno
              </p>
              <h1 className="text-2xl font-semibold tracking-tight text-[#171717]">
                Administración de precios
              </h1>
              <p className="text-sm text-[#5c5c5c]">
                Prepará un lote, revisá el impacto y aplicá solo cuando esté validado.
              </p>
            </div>
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              Acceso administrador
            </Badge>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-[#fafafa] px-4 py-3">
              <p className="text-xs text-[#7a7a7a]">Prestadores cargados</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-[#171717]">{providers.length}</p>
            </div>
            <div className="rounded-xl bg-[#fafafa] px-4 py-3">
              <p className="text-xs text-[#7a7a7a]">Planes disponibles</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-[#171717]">{plans.length}</p>
            </div>
            <div className="rounded-xl bg-[#fafafa] px-4 py-3">
              <p className="text-xs text-[#7a7a7a]">Registros de precios</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-[#171717]">{prices.length}</p>
            </div>
          </div>
        </section>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-12">
          <section className="space-y-6 xl:col-span-8">
            <Card className="rounded-2xl border-0 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.08)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Nueva actualización</CardTitle>
                <CardDescription>
                  Definí alcance y porcentaje para calcular una propuesta de actualización.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Mes base</Label>
                    <Input
                      type="month"
                      value={sourceMonth}
                      onChange={(e) => setSourceMonth(e.target.value)}
                      className="h-10 rounded-lg"
                    />
                    <p className="text-xs text-muted-foreground">Tomamos precios desde este período.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Mes destino</Label>
                    <Input
                      type="month"
                      value={targetMonth}
                      onChange={(e) => setTargetMonth(e.target.value)}
                      className="h-10 rounded-lg"
                    />
                    <p className="text-xs text-muted-foreground">Se crea una nueva vigencia para este mes.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Ajuste (%)</Label>
                    <Input
                      inputMode="decimal"
                      value={pct}
                      onChange={(e) => setPct(e.target.value)}
                      placeholder="Ej: 7.5 o -3"
                      className="h-10 rounded-lg"
                    />
                    <p className="text-xs text-muted-foreground">Positivo aumenta, negativo descuenta.</p>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Prestador</Label>
                    <Select
                      value={providerId}
                      onValueChange={(v) => {
                        setProviderId(v);
                        setPlanId("all");
                      }}
                    >
                      <SelectTrigger className="h-10 rounded-lg">
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
                    <p className="text-xs text-muted-foreground">Filtrá por una entidad específica si hace falta.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Plan (opcional)</Label>
                    <Select value={planId} onValueChange={setPlanId}>
                      <SelectTrigger className="h-10 rounded-lg">
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {plansForSelectedProvider.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} ({p.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Si elegís plan, actualiza solo esa combinación.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Modalidad</Label>
                    <Select
                      value={scope}
                      onValueChange={(v) =>
                        setScope(v as "both" | "particular" | "no_particular")
                      }
                    >
                      <SelectTrigger className="h-10 rounded-lg">
                        <SelectValue placeholder="Ambos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="both">Ambos</SelectItem>
                        <SelectItem value="no_particular">Obra social</SelectItem>
                        <SelectItem value="particular">Particular</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Limitá por tipo de tarifario.</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button onClick={createBatchAndPreview} disabled={loading || saving} className="min-w-40">
                    {saving ? "Calculando…" : "Revisar cambios"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={applyBatch}
                    disabled={loading || saving || !lastBatchId}
                    className="min-w-40"
                  >
                    {saving ? "Aplicando…" : "Aplicar actualización"}
                  </Button>
                  <Badge variant={lastBatchId ? "outline" : "secondary"} className="rounded-full">
                    {lastBatchId ? "Cambios listos para aplicar" : "Primero revisá los cambios"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {preview && preview.length > 0 ? (
              <Card className="overflow-hidden rounded-2xl border-0 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.08)]">
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg">Previsualización del batch</CardTitle>
                      <CardDescription>
                        Muestra de cambios a aplicar. Total impactado:{" "}
                        <span className="font-medium tabular-nums">
                          {preview[0]?.total_rows ?? preview.length}
                        </span>
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">Antes → Después</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-hidden rounded-xl border border-border bg-white">
                    <div className="grid grid-cols-[1fr_190px_120px_120px] gap-2 border-b border-border bg-[#fafafa] px-3 py-2 text-xs font-medium text-muted-foreground">
                      <div>Plan</div>
                      <div className="text-right">Detalle</div>
                      <div className="text-right">Antes</div>
                      <div className="text-right">Después</div>
                    </div>
                    <div className="max-h-[460px] overflow-y-auto">
                      {preview.map((r, idx) => {
                        const pl = planById.get(r.plan_id);
                        const prov = pl ? providerById.get(pl.provider_id) : null;
                        return (
                          <div
                            key={`${idx}-${r.plan_id}-${r.role}-${r.age_min}-${String(r.age_max)}-${String(
                              r.is_particular,
                            )}`}
                            className="grid grid-cols-[1fr_190px_120px_120px] gap-2 border-b border-border px-3 py-2 text-sm last:border-b-0"
                          >
                            <div className="min-w-0">
                              <div className="truncate font-medium">
                                {prov?.name ?? "Prestador"} · {pl?.name ?? r.plan_id}
                              </div>
                              <div className="truncate text-xs text-muted-foreground">
                                {pl?.type ?? ""} · Ajuste {r.pct}%
                              </div>
                            </div>
                            <div className="text-right text-xs text-muted-foreground tabular-nums">
                              {r.role} · {r.age_min}–{r.age_max ?? "∞"}{" "}
                              {r.is_particular ? "· Particular" : "· Obra social"}
                            </div>
                            <div className="text-right tabular-nums">{formatMoney(r.old_price)}</div>
                            <div className="text-right font-medium tabular-nums">
                              {formatMoney(r.new_price)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            <Card className="overflow-hidden rounded-2xl border-0 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.08)]">
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">Buscador de precios</CardTitle>
                    <CardDescription>Filtrá por prestador, plan, tipo o rol etario.</CardDescription>
                  </div>
                  <Badge variant="outline">{filteredPrices.length} resultados</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Ej: OSPADEP, plan joven, cónyuge..."
                  className="h-10 rounded-lg"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Label className="text-xs text-muted-foreground">Vigencia</Label>
                  <Select value={pricesMonthFilter} onValueChange={setPricesMonthFilter}>
                    <SelectTrigger className="h-9 w-[220px] rounded-lg">
                      <SelectValue placeholder="Todas las vigencias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las vigencias</SelectItem>
                      {availablePriceMonths.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {duplicatedRowsInSameMonth > 0 ? (
                  <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    Se detectaron {duplicatedRowsInSameMonth} filas duplicadas en la misma vigencia.
                    Revisá la base con un chequeo de duplicados antes de cotizar.
                  </div>
                ) : null}
                {loading ? (
                  <p className="text-sm text-muted-foreground">Cargando lista de precios…</p>
                ) : filteredPrices.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin resultados con ese filtro.</p>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-border bg-white">
                    <div className="grid grid-cols-[1fr_170px_140px] gap-2 border-b border-border bg-[#fafafa] px-3 py-2 text-xs font-medium text-muted-foreground">
                      <div>Plan</div>
                      <div className="text-right">Detalle</div>
                      <div className="text-right">Precio</div>
                    </div>
                    <div className="max-h-[520px] overflow-y-auto">
                      {filteredPrices.slice(0, 300).map((r, idx) => {
                        const pl = planById.get(r.plan_id);
                        const prov = pl ? providerById.get(pl.provider_id) : null;
                        return (
                          <div
                            key={`${r.plan_id}-${idx}-${r.role}-${r.age_min}-${String(r.age_max)}-${String(
                              r.is_particular,
                            )}`}
                            className="grid grid-cols-[1fr_170px_140px] gap-2 border-b border-border px-3 py-2 text-sm last:border-b-0"
                          >
                            <div className="min-w-0">
                              <div className="truncate font-medium">
                                {prov?.name ?? "Prestador"} · {pl?.name ?? r.plan_id}
                              </div>
                              <div className="truncate text-xs text-muted-foreground">
                                {pl?.type ?? ""} {r.is_particular ? "· Particular" : "· Obra social"}
                              </div>
                            </div>
                            <div className="text-right text-xs text-muted-foreground tabular-nums">
                              {String(r.role)} · {r.age_min}–{r.age_max ?? "∞"} ·{" "}
                              {(r.effective_month ?? "").slice(0, 7) || "sin mes"}
                            </div>
                            <div className="text-right font-medium tabular-nums">{formatMoney(r.price)}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Consejo: siempre corré una revisión antes de aplicar para evitar ajustes erróneos.
                </p>
              </CardContent>
            </Card>
          </section>

          <aside className="space-y-6 xl:col-span-4">
            <Card className="rounded-2xl border-0 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.08)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Estado del proceso</CardTitle>
                <CardDescription>Resumen rápido del batch actual.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-xl bg-[#fafafa] px-3 py-2">
                  <p className="text-xs text-[#7a7a7a]">Batch en preparación</p>
                  <p className="mt-0.5 font-medium text-[#171717]">{lastBatchId ?? "Sin batch activo"}</p>
                </div>
                <div className="rounded-xl bg-[#fafafa] px-3 py-2">
                  <p className="text-xs text-[#7a7a7a]">Meses seleccionados</p>
                  <p className="mt-0.5 font-medium tabular-nums text-[#171717]">
                    {sourceMonth || "—"} → {targetMonth || "—"}
                  </p>
                </div>
                <div className="rounded-xl bg-[#fafafa] px-3 py-2">
                  <p className="text-xs text-[#7a7a7a]">Estado</p>
                  <Badge variant={lastBatchId ? "outline" : "secondary"} className="mt-1 rounded-full">
                    {lastBatchId ? "Listo para aplicar" : "Pendiente de revisión"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-0 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.08)]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-lg">Historial reciente</CardTitle>
                  <Badge variant="outline">{batches.length}</Badge>
                </div>
                <CardDescription>Últimos lotes creados y su estado.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {batches.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin movimientos todavía.</p>
                ) : (
                  batches.map((b) => (
                    <div
                      key={b.id}
                      className="rounded-xl border border-border bg-white px-3 py-2.5"
                    >
                      <p className="text-sm font-medium tabular-nums text-[#171717]">
                        {b.source_month.slice(0, 7)} → {b.target_month.slice(0, 7)}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{b.notes ?? "-"}</p>
                      <Badge
                        variant={
                          b.status === "applied"
                            ? "default"
                            : b.status === "failed"
                              ? "destructive"
                              : "secondary"
                        }
                        className="mt-2 rounded-full"
                      >
                        {b.status === "applied"
                          ? "Aplicado"
                          : b.status === "failed"
                            ? "Falló"
                            : "En preparación"}
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}

