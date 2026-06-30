"use client";

import * as React from "react";

import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { formatMoney } from "@/lib/money";
import { monthInputToMonthStartISO, nextMonthInput } from "@/lib/month";
import type { PriceRow } from "@/lib/engine/strategies";
import {
  buildBatchNotes,
  buildProviderPctMap,
  collectActiveProviderRules,
  collectPlanOverrideRules,
  initProviderPcts,
  parsePctText,
  validateBatchRules,
  type PlanOverrideInput,
} from "@/lib/prices/batch-update";
import {
  distinctMonthsDesc,
  isActiveSettingStale,
  monthYYYYMM,
  normalizeMonthISO,
  resolveEffectiveMonth,
} from "@/lib/prices/effective-month";

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

type ProviderPreviewRow = {
  provider_id: string;
  provider_name: string;
  pct: number;
  scope: string;
  rows_changed: number;
  rows_total: number;
};

type ApplyBatchResult = { status?: string; [k: string]: unknown } | null;
type AppSettingRow = { key: string; value_text: string | null };

function getErrorMessage(e: unknown, fallback: string): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "object" && e !== null && "message" in e) {
    const m = (e as { message?: unknown }).message;
    if (typeof m === "string" && m.trim() !== "") return m;
  }
  return fallback;
}

function formatMonthText(monthYYYYMM: string): string {
  if (!/^\d{4}-\d{2}$/.test(monthYYYYMM)) return monthYYYYMM;
  const [y, m] = monthYYYYMM.split("-");
  const dt = new Date(Number(y), Number(m) - 1, 1);
  const raw = new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric" }).format(dt);
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function formatRoleText(role: string): string {
  const m: Record<string, string> = {
    individual: "Individual",
    conyuge: "Cónyuge",
    matrimonio: "Matrimonio",
    primer_hijo: "Primer hijo",
    segundo_hijo: "Segundo hijo",
    hijo_adulto: "Hijo adulto",
    familiar_cargo: "Familiar a cargo",
    adulto_conyugue: "Adulto / cónyuge",
    hijo_1_menor: "Hijo 1 menor",
    hijo_2_mas_menores: "Hijo 2+ menores",
  };
  return m[role] ?? role;
}

function historyStatusUi(status: BatchRow["status"]): { label: string; className: string } {
  if (status === "applied") {
    return {
      label: "Aprobado",
      className: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    };
  }
  if (status === "failed") {
    return {
      label: "Error",
      className: "bg-red-100 text-red-700 border border-red-200",
    };
  }
  return {
    label: "En preparación",
    className: "bg-amber-100 text-amber-700 border border-amber-200",
  };
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

  function handleSourceMonthChange(value: string) {
    setSourceMonth(value);
    setTargetMonth(nextMonthInput(value));
  }
  const [pricesMonthFilter, setPricesMonthFilter] = React.useState<string>(targetMonth);
  const [scope, setScope] = React.useState<"both" | "particular" | "no_particular">(
    "both",
  );
  const [providerPcts, setProviderPcts] = React.useState<Record<string, string>>({});
  const [planOverrides, setPlanOverrides] = React.useState<Record<string, string>>({});
  const [advancedPlanId, setAdvancedPlanId] = React.useState<string>("");
  const [advancedPlanPct, setAdvancedPlanPct] = React.useState<string>("");
  const [activateVigenciaOnApply, setActivateVigenciaOnApply] = React.useState(true);

  const [preview, setPreview] = React.useState<PreviewRow[] | null>(null);
  const [providerPreview, setProviderPreview] = React.useState<ProviderPreviewRow[] | null>(
    null,
  );
  const [lastBatchId, setLastBatchId] = React.useState<string | null>(null);
  const [activeMonth, setActiveMonth] = React.useState<string>("");
  const [savingActiveMonth, setSavingActiveMonth] = React.useState(false);
  const [deleteMonth, setDeleteMonth] = React.useState<string>("");
  const [deletingMonth, setDeletingMonth] = React.useState(false);

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
          { data: st, error: stErr },
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
          supabase
            .from("app_settings")
            .select("key,value_text")
            .eq("key", "active_effective_month")
            .maybeSingle(),
        ]);
        if (provErr) throw provErr;
        if (planErr) throw planErr;
        if (prErr) throw prErr;
        if (btErr) throw btErr;
        if (
          stErr &&
          !["PGRST116", "PGRST205", "42P01"].includes((stErr as { code?: string }).code ?? "")
        ) {
          throw stErr;
        }
        if (!alive) return;
        const pricesRows = (prs ?? []) as PriceRow[];
        const provRows = (provs ?? []) as ProviderRow[];
        setProviders(provRows);
        setProviderPcts((cur) => {
          const next = { ...cur };
          for (const p of provRows) {
            if (next[p.id] === undefined) next[p.id] = "";
          }
          return next;
        });
        setPlans((pls ?? []) as PlanRow[]);
        setPrices(pricesRows);
        setBatches((bts ?? []) as BatchRow[]);
        const availableISO = distinctMonthsDesc(pricesRows);
        const available = availableISO.map(monthYYYYMM);
        const settingISO = normalizeMonthISO((st as AppSettingRow | null)?.value_text);
        const resolvedISO = resolveEffectiveMonth({
          activeSetting: settingISO,
          availableMonthsISO: availableISO,
        });
        const resolvedMonth = monthYYYYMM(resolvedISO);
        setActiveMonth(resolvedMonth);
        if (
          supabase &&
          isActiveSettingStale(settingISO, availableISO) &&
          availableISO.length > 0
        ) {
          await supabase.from("app_settings").upsert(
            {
              key: "active_effective_month",
              value_text: resolvedISO,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "key" },
          );
        }
        if (available.length > 0) {
          const latest = available[0]!;
          setSourceMonth(latest);
          setTargetMonth(nextMonthInput(latest));
          setPricesMonthFilter((cur) => (cur === "all" || available.includes(cur) ? cur : latest));
        }
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
    return distinctMonthsDesc(prices).map(monthYYYYMM);
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

  const planOverrideRows = React.useMemo((): PlanOverrideInput[] => {
    return Object.entries(planOverrides)
      .map(([planId, pctText]) => {
        const pl = planById.get(planId);
        if (!pl) return null;
        const prov = providerById.get(pl.provider_id);
        return {
          planId,
          planName: pl.name,
          providerName: prov?.name ?? "Prestador",
          pctText,
        };
      })
      .filter((x): x is PlanOverrideInput => x != null);
  }, [planOverrides, planById, providerById]);

  function setProviderPct(providerId: string, value: string) {
    setProviderPcts((cur) => ({ ...cur, [providerId]: value }));
  }

  function addPlanOverride() {
    if (!advancedPlanId) {
      setError("Elegí un plan para el ajuste avanzado.");
      return;
    }
    const pct = parsePctText(advancedPlanPct);
    if (pct == null || pct === 0) {
      setError("El % del plan debe ser distinto de 0.");
      return;
    }
    setError(null);
    setPlanOverrides((cur) => ({ ...cur, [advancedPlanId]: advancedPlanPct }));
    setAdvancedPlanPct("");
  }

  function removePlanOverride(planId: string) {
    setPlanOverrides((cur) => {
      const next = { ...cur };
      delete next[planId];
      return next;
    });
  }

  async function createBatchAndPreview() {
    setError(null);
    if (!supabase) return;
    setSaving(true);
    try {
      const source = monthInputToMonthStartISO(sourceMonth);
      const target = monthInputToMonthStartISO(targetMonth);

      const providerInputs = buildProviderPctMap(providers, providerPcts);
      for (const row of providerInputs) {
        const raw = row.pctText.trim();
        if (raw !== "" && parsePctText(raw) == null) {
          throw new Error(`Porcentaje inválido para ${row.providerName}.`);
        }
      }
      for (const row of planOverrideRows) {
        const raw = row.pctText.trim();
        if (raw !== "" && parsePctText(raw) == null) {
          throw new Error(`Porcentaje inválido para el plan ${row.planName}.`);
        }
      }

      const { data: batch, error: batchErr } = await supabase
        .from("price_batches")
        .insert({
          source_month: source,
          target_month: target,
          notes: "Pendiente de revisión",
        })
        .select("id,created_at,source_month,target_month,status,notes")
        .single();
      if (batchErr) throw batchErr;
      if (!batch) throw new Error("No se pudo crear el batch");

      const providerRules = collectActiveProviderRules(providerInputs, batch.id, scope);
      const planRules = collectPlanOverrideRules(planOverrideRows, batch.id, scope);
      const allRules = [...providerRules, ...planRules];
      const validationError = validateBatchRules(allRules);
      if (validationError) throw new Error(validationError);

      const { error: ruleErr } = await supabase.from("price_batch_rules").insert(allRules);
      if (ruleErr) throw ruleErr;

      const notes = buildBatchNotes(sourceMonth, targetMonth, providerRules, planRules);
      await supabase.from("price_batches").update({ notes }).eq("id", batch.id);

      const [prevRes, provRes] = await Promise.all([
        supabase.rpc("preview_price_batch", { batch: batch.id, sample_limit: 30 }),
        supabase.rpc("preview_price_batch_by_provider", { batch: batch.id }),
      ]);
      if (prevRes.error) throw prevRes.error;
      if (provRes.error) {
        if ((provRes.error as { code?: string }).code === "PGRST202") {
          throw new Error(
            "Falta la función preview_price_batch_by_provider en Supabase. Ejecutá docs/fix-preview-price-batch-b-record-plan-id.sql",
          );
        }
        throw provRes.error;
      }

      setPreview((prevRes.data ?? []) as PreviewRow[]);
      setProviderPreview((provRes.data ?? []) as ProviderPreviewRow[]);
      setLastBatchId(batch.id);

      const batchWithNotes = { ...(batch as BatchRow), notes };
      setBatches((cur) => [batchWithNotes, ...cur].slice(0, 10));
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
        const pricesRows = (prs ?? []) as PriceRow[];
        const availableISO = distinctMonthsDesc(pricesRows);
        const appliedMonthISO = monthInputToMonthStartISO(targetMonth);
        const resolvedISO = availableISO.includes(appliedMonthISO)
          ? appliedMonthISO
          : resolveEffectiveMonth({
              activeSetting: activateVigenciaOnApply ? appliedMonthISO : null,
              availableMonthsISO: availableISO,
            });
        if (activateVigenciaOnApply && /^\d{4}-\d{2}$/.test(targetMonth)) {
          const { error: vigErr } = await supabase
            .from("app_settings")
            .upsert(
              {
                key: "active_effective_month",
                value_text: resolvedISO,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "key" },
            );
          if (vigErr) throw vigErr;
          setActiveMonth(monthYYYYMM(resolvedISO));
        }
        setPricesMonthFilter(monthYYYYMM(resolvedISO));
        setPreview(null);
        setProviderPreview(null);
        setLastBatchId(null);
        setProviderPcts(initProviderPcts(providers.map((p) => p.id)));
        setPlanOverrides({});
      }
    } catch (e) {
      setError(getErrorMessage(e, "No se pudo aplicar la actualización"));
    } finally {
      setSaving(false);
    }
  }

  async function saveActiveMonth() {
    setError(null);
    if (!supabase) return;
    if (!activeMonth || !/^\d{4}-\d{2}$/.test(activeMonth)) {
      setError("Elegí un período válido para la vigencia activa.");
      return;
    }
    if (!availablePriceMonths.includes(activeMonth)) {
      setError("Ese mes no tiene precios cargados. Aplicá una actualización primero.");
      return;
    }
    setSavingActiveMonth(true);
    try {
      const { error: upsertErr } = await supabase
        .from("app_settings")
        .upsert(
          {
            key: "active_effective_month",
            value_text: `${activeMonth}-01`,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "key" },
        );
      if (upsertErr) throw upsertErr;
    } catch (e) {
      setError(getErrorMessage(e, "No se pudo guardar la vigencia activa"));
    } finally {
      setSavingActiveMonth(false);
    }
  }

  async function deleteEffectiveMonth() {
    setError(null);
    if (!supabase) return;
    if (!deleteMonth || !/^\d{4}-\d{2}$/.test(deleteMonth)) {
      setError("Elegí una vigencia válida para eliminar.");
      return;
    }
    const label = formatMonthText(deleteMonth);
    const ok = window.confirm(
      `Vas a eliminar todos los precios de la vigencia ${label}. Esta acción no se puede deshacer. ¿Continuar?`,
    );
    if (!ok) return;

    setDeletingMonth(true);
    try {
      const { error: delErr } = await supabase
        .from("prices")
        .delete()
        .eq("effective_month", `${deleteMonth}-01`);
      if (delErr) throw delErr;

      const { data: prs, error: prErr } = await supabase
        .from("prices")
        .select("plan_id,age_min,age_max,role,price,is_particular,effective_month")
        .order("effective_month", { ascending: false })
        .order("plan_id")
        .order("role")
        .order("age_min");
      if (prErr) throw prErr;

      const pricesRows = (prs ?? []) as PriceRow[];
      setPrices(pricesRows);
      const months = [...new Set(pricesRows.map((r) => (r.effective_month ?? "").slice(0, 7)).filter(Boolean))]
        .sort((a, b) => b.localeCompare(a));
      const fallbackMonth = months[0] ?? "";
      if (!months.includes(activeMonth)) {
        setActiveMonth(fallbackMonth);
        if (fallbackMonth) {
          await supabase
            .from("app_settings")
            .upsert(
              {
                key: "active_effective_month",
                value_text: `${fallbackMonth}-01`,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "key" },
            );
        }
      }
      if (pricesMonthFilter !== "all" && !months.includes(pricesMonthFilter)) {
        setPricesMonthFilter("all");
      }
      setDeleteMonth("");
    } catch (e) {
      setError(getErrorMessage(e, "No se pudo eliminar la vigencia"));
    } finally {
      setDeletingMonth(false);
    }
  }

  return (
    <main className="relative flex-1 overflow-hidden bg-muted px-4 py-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <section className="relative overflow-hidden rounded-2xl bg-card px-6 py-6 shadow-[0_0_0_1px_hsl(var(--primary)/0.07),0_12px_24px_-16px_rgba(0,0,0,0.14)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                Panel interno
              </p>
              <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
                Administración de precios
              </h1>
              <p className="text-sm text-muted-foreground">
                Definí % por prestador, revisá el resumen y aplicá una sola actualización mensual.
              </p>
            </div>
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              Acceso administrador
            </Badge>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-muted px-4 py-3">
              <p className="text-xs text-muted-foreground">Prestadores cargados</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">{providers.length}</p>
            </div>
            <div className="rounded-xl bg-muted px-4 py-3">
              <p className="text-xs text-muted-foreground">Planes disponibles</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">{plans.length}</p>
            </div>
            <div className="rounded-xl bg-muted px-4 py-3">
              <p className="text-xs text-muted-foreground">Registros de precios</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">{prices.length}</p>
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
                <CardTitle className="text-lg">Actualización mensual</CardTitle>
                <CardDescription>
                  Definí la nueva vigencia y el % de cada prestador. Al aplicar, todos los planes quedan
                  cargados en el mismo mes. Los prestadores sin % mantienen el precio del mes base.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-2 rounded-xl bg-muted p-3 text-xs text-muted-foreground sm:grid-cols-3">
                  <p><span className="font-semibold text-foreground">1.</span> Mes base y nueva vigencia</p>
                  <p><span className="font-semibold text-foreground">2.</span> % por prestador</p>
                  <p><span className="font-semibold text-foreground">3.</span> Revisá y aplicá una sola vez</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Mes base</Label>
                    <Input
                      type="month"
                      value={sourceMonth}
                      onChange={(e) => handleSourceMonthChange(e.target.value)}
                      className="h-10 rounded-lg"
                    />
                    <p className="text-xs text-muted-foreground">Vigencia de referencia con precios actuales.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Nueva vigencia</Label>
                    <Input
                      type="month"
                      value={targetMonth}
                      onChange={(e) => setTargetMonth(e.target.value)}
                      className="h-10 rounded-lg"
                    />
                    <p className="text-xs text-muted-foreground">Mes destino común para todos los prestadores.</p>
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
                    <p className="text-xs text-muted-foreground">Aplica a todos los aumentos de esta actualización.</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>Ajuste por prestador (%)</Label>
                  <div className="overflow-hidden rounded-xl border border-border bg-white">
                    <div className="grid grid-cols-[1fr_140px] gap-2 border-b border-border bg-muted px-3 py-2 text-xs font-medium text-muted-foreground">
                      <div>Prestador</div>
                      <div className="text-right">Aumento %</div>
                    </div>
                    <div className="max-h-[280px] overflow-y-auto">
                      {providers.map((p) => (
                        <div
                          key={p.id}
                          className="grid grid-cols-[1fr_140px] gap-2 border-b border-border px-3 py-2 last:border-b-0"
                        >
                          <div className="flex items-center text-sm font-medium">{p.name}</div>
                          <Input
                            inputMode="decimal"
                            value={providerPcts[p.id] ?? ""}
                            onChange={(e) => setProviderPct(p.id, e.target.value)}
                            placeholder="0 = sin cambio"
                            className="h-9 rounded-lg text-right tabular-nums"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Dejá vacío o en 0 los prestadores que solo deben copiar el precio del mes base.
                  </p>
                </div>

                <details className="rounded-xl border border-border bg-muted/40 px-4 py-3">
                  <summary className="cursor-pointer text-sm font-medium text-foreground">
                    Ajuste por plan (avanzado)
                  </summary>
                  <div className="mt-4 space-y-4">
                    <p className="text-xs text-muted-foreground">
                      Si un plan necesita un % distinto al del prestador, agregalo acá. Tiene prioridad sobre
                      la regla del prestador.
                    </p>
                    <div className="grid gap-3 sm:grid-cols-[1fr_140px_auto]">
                      <Select value={advancedPlanId} onValueChange={setAdvancedPlanId}>
                        <SelectTrigger className="h-10 rounded-lg">
                          <SelectValue placeholder="Elegí un plan" />
                        </SelectTrigger>
                        <SelectContent>
                          {plans.map((pl) => {
                            const prov = providerById.get(pl.provider_id);
                            return (
                              <SelectItem key={pl.id} value={pl.id}>
                                {prov?.name ?? "Prestador"} · {pl.name} ({pl.type})
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <Input
                        inputMode="decimal"
                        value={advancedPlanPct}
                        onChange={(e) => setAdvancedPlanPct(e.target.value)}
                        placeholder="%"
                        className="h-10 rounded-lg text-right tabular-nums"
                      />
                      <Button type="button" variant="outline" onClick={addPlanOverride}>
                        Agregar
                      </Button>
                    </div>
                    {planOverrideRows.length > 0 ? (
                      <div className="space-y-2">
                        {planOverrideRows.map((row) => (
                          <div
                            key={row.planId}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm"
                          >
                            <span>
                              {row.providerName} · {row.planName} — {row.pctText}%
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => removePlanOverride(row.planId)}
                            >
                              Quitar
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </details>

                <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={activateVigenciaOnApply}
                    onChange={(e) => setActivateVigenciaOnApply(e.target.checked)}
                    className="size-4 rounded border-border"
                  />
                  Activar la nueva vigencia en el cotizador al aplicar
                </label>

                <div className="flex flex-wrap items-center gap-2">
                  <Button onClick={() => void createBatchAndPreview()} disabled={loading || saving} className="min-w-40">
                    {saving ? "Calculando…" : "Revisar cambios"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => void applyBatch()}
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

            {providerPreview && providerPreview.length > 0 ? (
              <Card className="overflow-hidden rounded-2xl border-0 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.08)]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Resumen por prestador</CardTitle>
                  <CardDescription>
                    Vista rápida del impacto antes de aplicar. Total de filas en el mes destino:{" "}
                    <span className="font-medium tabular-nums">
                      {preview?.[0]?.total_rows ?? "—"}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-hidden rounded-xl border border-border bg-white">
                    <div className="grid grid-cols-[1fr_90px_110px_110px] gap-2 border-b border-border bg-muted px-3 py-2 text-xs font-medium text-muted-foreground">
                      <div>Prestador</div>
                      <div className="text-right">%</div>
                      <div className="text-right">Con cambio</div>
                      <div className="text-right">Total filas</div>
                    </div>
                    {providerPreview.map((r) => (
                      <div
                        key={r.provider_id}
                        className="grid grid-cols-[1fr_90px_110px_110px] gap-2 border-b border-border px-3 py-2 text-sm last:border-b-0"
                      >
                        <div className="font-medium">{r.provider_name}</div>
                        <div className="text-right tabular-nums">{r.pct}%</div>
                        <div className="text-right tabular-nums">{r.rows_changed}</div>
                        <div className="text-right tabular-nums">{r.rows_total}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {preview && preview.length > 0 ? (
              <Card className="overflow-hidden rounded-2xl border-0 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.08)]">
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg">Detalle de ejemplo</CardTitle>
                      <CardDescription>
                        Muestra hasta 30 filas con mayor cambio de precio. Total a materializar:{" "}
                        <span className="font-medium tabular-nums">
                          {preview[0]?.total_rows ?? preview.length}
                        </span>
                        .
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">Antes → Después</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-hidden rounded-xl border border-border bg-white">
                    <div className="grid grid-cols-[1fr_190px_120px_120px] gap-2 border-b border-border bg-muted px-3 py-2 text-xs font-medium text-muted-foreground">
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
                            {formatMonthText(m)}
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
                    <div className="grid grid-cols-[1fr_220px_140px] gap-2 border-b border-border bg-muted px-3 py-2 text-xs font-medium text-muted-foreground">
                      <div>Plan</div>
                      <div>Detalle</div>
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
                            className="grid grid-cols-[1fr_220px_140px] gap-2 border-b border-border px-3 py-2 text-sm last:border-b-0"
                          >
                            <div className="min-w-0">
                              <div className="truncate font-medium">
                                {prov?.name ?? "Prestador"} · {pl?.name ?? r.plan_id}
                              </div>
                              <div className="truncate text-xs text-muted-foreground">
                                {pl?.type ?? ""} {r.is_particular ? "· Particular" : "· Obra social"}
                              </div>
                            </div>
                            <div className="space-y-0.5 text-xs text-muted-foreground">
                              <p className="font-medium text-foreground">{formatRoleText(String(r.role))}</p>
                              <p>Edad {r.age_min} a {r.age_max ?? "∞"}</p>
                              <p>{formatMonthText((r.effective_month ?? "").slice(0, 7))}</p>
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
                <div className="rounded-xl bg-muted px-3 py-2">
                  <p className="text-xs text-muted-foreground">Batch en preparación</p>
                  <p className="mt-0.5 font-medium text-foreground">{lastBatchId ?? "Sin batch activo"}</p>
                </div>
                <div className="rounded-xl bg-muted px-3 py-2">
                  <p className="text-xs text-muted-foreground">Meses seleccionados</p>
                  <p className="mt-0.5 font-medium tabular-nums text-foreground">
                    {sourceMonth || "—"} → {targetMonth || "—"}
                  </p>
                </div>
                <div className="rounded-xl bg-muted px-3 py-2">
                  <p className="text-xs text-muted-foreground">Estado</p>
                  <Badge variant={lastBatchId ? "outline" : "secondary"} className="mt-1 rounded-full">
                    {lastBatchId ? "Listo para aplicar" : "Pendiente de revisión"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-0 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.08)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Vigencia activa</CardTitle>
                <CardDescription>
                  Período global que usará el cotizador para traer precios.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label>Período</Label>
                  <Select value={activeMonth} onValueChange={setActiveMonth}>
                    <SelectTrigger className="h-10 rounded-lg">
                      <SelectValue placeholder="Elegí una vigencia" />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePriceMonths.map((m) => (
                        <SelectItem key={m} value={m}>
                          {formatMonthText(m)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  onClick={() => void saveActiveMonth()}
                  disabled={!activeMonth || savingActiveMonth}
                  className="w-full"
                >
                  {savingActiveMonth ? "Guardando…" : "Guardar vigencia activa"}
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-0 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.08)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Eliminar vigencia</CardTitle>
                <CardDescription>
                  Eliminá un período completo si una actualización fue de prueba o inválida.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Select value={deleteMonth} onValueChange={setDeleteMonth}>
                  <SelectTrigger className="h-10 rounded-lg">
                    <SelectValue placeholder="Elegí una vigencia a eliminar" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePriceMonths.map((m) => (
                      <SelectItem key={m} value={m}>
                        {formatMonthText(m)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-red-200 text-red-700 hover:bg-red-50"
                  disabled={!deleteMonth || deletingMonth}
                  onClick={() => void deleteEffectiveMonth()}
                >
                  {deletingMonth ? "Eliminando…" : "Eliminar vigencia seleccionada"}
                </Button>
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
                      <p className="text-sm font-medium tabular-nums text-foreground">
                        {b.source_month.slice(0, 7)} → {b.target_month.slice(0, 7)}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{b.notes ?? "-"}</p>
                      <Badge className={`mt-2 rounded-full ${historyStatusUi(b.status).className}`}>
                        {historyStatusUi(b.status).label}
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

