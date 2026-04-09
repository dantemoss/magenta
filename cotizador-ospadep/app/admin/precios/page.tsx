"use client";

import * as React from "react";

import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { formatMoney } from "@/lib/money";
import { monthInputToMonthStartISO, nextMonthInput } from "@/lib/month";
import type { PriceRow } from "@/lib/engine/strategies";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    if (!q) return prices;
    return prices.filter((r) => {
      const pl = planById.get(r.plan_id);
      const prov = pl ? providerById.get(pl.provider_id) : null;
      const hay = `${prov?.name ?? ""} ${pl?.name ?? ""} ${pl?.type ?? ""} ${r.role}`.toLowerCase();
      return hay.includes(q);
    });
  }, [prices, filter, planById, providerById]);

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
    <main className="flex-1 bg-zinc-50 px-4 py-10 dark:bg-black">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Administración · Precios</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Actualizá precios por mes, rápido y sin errores.
            </p>
          </div>
          <Badge variant="secondary">Acceso administrador</Badge>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Actualizar precios</CardTitle>
            <CardDescription>
              Elegí de qué mes copiar los valores, definí el % y aplicalo al mes siguiente.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Mes base</Label>
              <Input
                type="month"
                value={sourceMonth}
                onChange={(e) => setSourceMonth(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">De acá se toman los valores.</p>
            </div>
            <div className="space-y-2">
              <Label>Mes a actualizar</Label>
              <Input
                type="month"
                value={targetMonth}
                onChange={(e) => setTargetMonth(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Se crean los precios para este mes.</p>
            </div>
            <div className="space-y-2">
              <Label>Ajuste (%)</Label>
              <Input
                inputMode="decimal"
                value={pct}
                onChange={(e) => setPct(e.target.value)}
                placeholder="Ej: 7,5"
              />
              <p className="text-xs text-muted-foreground">
                Usá negativo si es descuento. Ej: -3.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Elegir prestador</Label>
              <Select
                value={providerId}
                onValueChange={(v) => {
                  setProviderId(v);
                  setPlanId("all");
                }}
              >
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
              <p className="text-xs text-muted-foreground">
                Si elegís un plan, se actualiza solo ese plan.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Elegir plan (opcional)</Label>
              <Select value={planId} onValueChange={setPlanId}>
                <SelectTrigger>
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
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={scope}
                onValueChange={(v) =>
                  setScope(v as "both" | "particular" | "no_particular")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ambos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">Ambos</SelectItem>
                  <SelectItem value="no_particular">Obra social</SelectItem>
                  <SelectItem value="particular">Particular</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:col-span-3">
              <Button onClick={createBatchAndPreview} disabled={loading || saving}>
                {saving ? "Calculando…" : "Revisar cambios"}
              </Button>
              <Button
                variant="outline"
                onClick={applyBatch}
                disabled={loading || saving || !lastBatchId}
              >
                {saving ? "Aplicando…" : "Aplicar actualización"}
              </Button>
              <Badge variant={lastBatchId ? "outline" : "secondary"}>
                {lastBatchId ? "Cambios listos para aplicar" : "Primero revisá los cambios"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {preview && preview.length > 0 ? (
          <Card className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>Revisión</CardTitle>
                  <CardDescription>
                    Ejemplos de cambios. Cantidad de precios a actualizar:{" "}
                    <span className="font-medium tabular-nums">
                      {preview[0]?.total_rows ?? preview.length}
                    </span>
                  </CardDescription>
                </div>
                <Badge variant="secondary">Antes → Después</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-lg border border-border bg-card">
                <div className="grid grid-cols-[1fr_160px_120px_120px] gap-2 border-b border-border px-3 py-2 text-xs font-medium text-muted-foreground">
                  <div>Plan</div>
                  <div className="text-right">Detalle</div>
                  <div className="text-right">Antes</div>
                  <div className="text-right">Después</div>
                </div>
                {preview.map((r, idx) => {
                  const pl = planById.get(r.plan_id);
                  const prov = pl ? providerById.get(pl.provider_id) : null;
                  return (
                    <div
                      key={`${idx}-${r.plan_id}-${r.role}-${r.age_min}-${String(r.age_max)}-${String(
                        r.is_particular,
                      )}`}
                      className="grid grid-cols-[1fr_160px_120px_120px] gap-2 px-3 py-2 text-sm"
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
                      <div className="text-right tabular-nums font-medium">
                        {formatMoney(r.new_price)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>Historial</CardTitle>
              <Badge variant="outline">{batches.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {batches.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin movimientos aún.</p>
            ) : (
              <div className="grid gap-2">
                {batches.map((b) => (
                  <div
                    key={b.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm"
                  >
                    <div className="min-w-0">
                      <div className="font-medium tabular-nums">
                        {b.source_month.slice(0, 7)} → {b.target_month.slice(0, 7)}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">{b.notes ?? "-"}</div>
                    </div>
                    <Badge
                      variant={
                        b.status === "applied"
                          ? "default"
                          : b.status === "failed"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {b.status === "applied"
                        ? "Aplicado"
                        : b.status === "failed"
                          ? "Falló"
                          : "En preparación"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Buscar</CardTitle>
            <CardDescription>Filtrá por prestador, plan o tipo.</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Ej: OSPADEP, Plan Joven…"
            />
          </CardContent>
        </Card>

        {error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <Card className="overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>Lista de precios</CardTitle>
              <Badge variant="outline">{filteredPrices.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-sm text-muted-foreground">Cargando…</p>
            ) : filteredPrices.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin resultados.</p>
            ) : (
              <div className="overflow-hidden rounded-lg border border-border bg-card">
                <div className="grid grid-cols-[1fr_160px_140px] gap-2 border-b border-border px-3 py-2 text-xs font-medium text-muted-foreground">
                  <div>Plan</div>
                  <div className="text-right">Detalle</div>
                  <div className="text-right">Precio</div>
                </div>
                {filteredPrices.slice(0, 200).map((r, idx) => {
                  const pl = planById.get(r.plan_id);
                  const prov = pl ? providerById.get(pl.provider_id) : null;
                  return (
                    <div
                      key={`${r.plan_id}-${idx}-${r.role}-${r.age_min}-${String(r.age_max)}-${String(
                        r.is_particular,
                      )}`}
                      className="grid grid-cols-[1fr_160px_140px] gap-2 px-3 py-2 text-sm"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-medium">
                          {prov?.name ?? "Prestador"} · {pl?.name ?? r.plan_id}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {pl?.type ?? ""} {r.is_particular ? "· Particular" : ""}
                        </div>
                      </div>
                      <div className="text-right text-xs text-muted-foreground tabular-nums">
                        {String(r.role)} · {r.age_min}–{r.age_max ?? "∞"}
                      </div>
                      <div className="text-right font-medium tabular-nums">
                        {formatMoney(r.price)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <Separator />
            <p className="text-xs text-muted-foreground">
              Tip: usá “Revisar cambios” antes de aplicar, para evitar errores.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

