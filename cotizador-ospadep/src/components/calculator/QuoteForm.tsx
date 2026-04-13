"use client";

import * as React from "react";
import Image from "next/image";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";

import type {
  DetailedQuoteResult,
  QuoteLineItem,
  QuoteRequest,
  QuoteResult,
} from "@/types/quotes";
import {
  MedifeStrategy,
  OmintStrategy,
  OspadepStrategy,
  SwissStrategy,
  type PriceRow,
  type QuoteStrategy,
} from "@/lib/engine/strategies";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { formatMoney, formatMoneyCompact } from "@/lib/money";
import { monthStartISO } from "@/lib/month";
import { providerLogoSrc } from "@/lib/provider-logos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

// ─── Schema ───────────────────────────────────────────────────────────────────

const formSchema = z
  .object({
    holderAge: z.coerce.number().int().min(0).max(120),
    hasSpouse: z.boolean(),
    spouseAge: z.coerce.number().int().min(0).max(120).optional(),
    children: z.array(z.object({ age: z.coerce.number().int().min(0).max(120) })),
    isParticular: z.boolean(),
    holderUsesGross: z.boolean(),
    holderContribution: z.coerce.number().min(0),
    holderGross: z.coerce.number().min(0),
    spouseUsesGross: z.boolean(),
    spouseContribution: z.coerce.number().min(0),
    spouseGross: z.coerce.number().min(0),
    commercialDiscounts: z.array(
      z.object({ label: z.string(), amount: z.coerce.number().min(0) }),
    ),
  })
  .superRefine((val, ctx) => {
    if (val.hasSpouse && typeof val.spouseAge !== "number") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["spouseAge"],
        message: "Ingresá la edad de la pareja",
      });
    }
    if (!val.holderUsesGross && val.holderContribution < 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["holderContribution"], message: "Aportes inválidos" });
    }
    if (val.holderUsesGross && val.holderGross < 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["holderGross"], message: "Sueldo bruto inválido" });
    }
    if (val.hasSpouse) {
      if (val.spouseUsesGross && val.spouseGross < 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["spouseGross"], message: "Sueldo bruto inválido" });
      }
      if (!val.spouseUsesGross && val.spouseContribution < 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["spouseContribution"], message: "Aportes inválidos" });
      }
    }
  });

type FormValues = z.infer<typeof formSchema>;
type FormInput = z.input<typeof formSchema>;
type FormOutput = z.output<typeof formSchema>;

type ProviderRow = { id: string; name: string; slug: string };
type PlanRow = { id: string; provider_id: string; name: string; type: string };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getErrorMessage(e: unknown, fallback: string): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "object" && e !== null && "message" in e) {
    const m = (e as { message?: unknown }).message;
    if (typeof m === "string" && m.trim() !== "") return m;
  }
  return fallback;
}

function friendlyQuoteError(msg: string): string {
  if (msg.includes("No hay precio para plan_id")) {
    return "Falta tarifa en la vigencia para esta edad y modalidad. Revisá la carga de precios del plan.";
  }
  return msg;
}

function strategyForProviderSlug(slug: string): QuoteStrategy {
  const s = slug.toLowerCase();
  if (s === "medife") return new MedifeStrategy();
  if (s === "omint") return new OmintStrategy();
  if (s === "ospadep") return new OspadepStrategy();
  if (s === "swiss-medical") return new SwissStrategy();
  throw new Error(`No hay estrategia implementada para provider slug='${slug}'`);
}

function buildQuoteRequest(values: FormValues): QuoteRequest {
  const holderAporte = values.holderUsesGross
    ? values.holderGross * 0.0765
    : values.holderContribution;
  const spouseAporte =
    values.hasSpouse && typeof values.spouseAge === "number"
      ? values.spouseUsesGross
        ? values.spouseGross * 0.0765
        : values.spouseContribution
      : 0;

  const members: QuoteRequest["members"] = [{ role: "holder", age: values.holderAge }];
  if (values.hasSpouse && typeof values.spouseAge === "number") {
    members.push({ role: "spouse", age: values.spouseAge });
  }
  for (const c of values.children) {
    members.push({ role: "child", age: c.age });
  }
  const commercialDiscounts = (values.commercialDiscounts ?? [])
    .filter((d) => d.amount > 0)
    .map((d) => ({ label: d.label.trim() || "Descuento comercial", value: d.amount }));

  return {
    members,
    isParticular: values.isParticular,
    contributions: holderAporte + spouseAporte,
    commercialDiscounts: commercialDiscounts.length > 0 ? commercialDiscounts : undefined,
  };
}

function isDetailedQuoteResult(res: QuoteResult): res is DetailedQuoteResult {
  return "lineItems" in res;
}

type PlanQuoteRow = {
  plan: PlanRow;
  providerName: string;
  providerSlug: string;
  result: DetailedQuoteResult | null;
  error?: string;
};

function togglePlanId(ids: string[], planId: string, on: boolean): string[] {
  const set = new Set(ids);
  if (on) set.add(planId);
  else set.delete(planId);
  return [...set];
}

// ─── Wizard steps definition ──────────────────────────────────────────────────

const STEPS = [
  {
    title: "Prestador",
    description: "Elegí el modo de cotización, prestador y planes a comparar.",
  },
  {
    title: "Grupo familiar",
    description: "Edades del titular, cónyuge e hijos a incluir.",
  },
  {
    title: "Aportes",
    description: "Sueldo bruto o aportes directos a descontar del total.",
  },
  {
    title: "Resultados",
    description: "Comparación de planes ordenada por valor final.",
  },
] as const;

// ─── Design tokens ────────────────────────────────────────────────────────────

const shadowBorder = "0px 0px 0px 1px rgba(0,0,0,0.08)";
const shadowCard = "rgba(0,0,0,0.08) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 2px";
const shadowInput = "0px 0px 0px 1px rgba(0,0,0,0.10)";

// ─── Animation variants ───────────────────────────────────────────────────────

const stepVariants = {
  enter: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? 24 : -24,
  }),
  center: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.22, ease: "easeOut" as const },
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? -24 : 24,
    transition: { duration: 0.18, ease: "easeIn" as const },
  }),
};

const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.2, ease: "easeOut" as const },
  }),
};

// ─── Component ───────────────────────────────────────────────────────────────

export function QuoteForm() {
  const [planCompareRows, setPlanCompareRows] = React.useState<PlanQuoteRow[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [loadingPrices, setLoadingPrices] = React.useState(false);
  const [pdfExporting, setPdfExporting] = React.useState(false);
  const [expandedPlanId, setExpandedPlanId] = React.useState<string | null>(null);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [stepDir, setStepDir] = React.useState(1);
  const effectiveMonth = React.useMemo(() => monthStartISO(), []);

  const [providers, setProviders] = React.useState<ProviderRow[]>([]);
  const [plans, setPlans] = React.useState<PlanRow[]>([]);
  const [selectedProviderId, setSelectedProviderId] = React.useState<string>("");
  const [selectedPlanIds, setSelectedPlanIds] = React.useState<string[]>([]);
  const [compareAllProviders, setCompareAllProviders] = React.useState(false);
  const [pricesByPlan, setPricesByPlan] = React.useState<Record<string, PriceRow[]>>({});
  const [lastInputs, setLastInputs] = React.useState<{
    holderAporte: number;
    spouseAporte: number;
    members: QuoteRequest["members"];
  } | null>(null);

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      holderAge: 30,
      hasSpouse: false,
      spouseAge: undefined,
      children: [],
      isParticular: false,
      holderUsesGross: true,
      holderContribution: 0,
      holderGross: 0,
      spouseUsesGross: true,
      spouseContribution: 0,
      spouseGross: 0,
      commercialDiscounts: [],
    },
  });

  const childrenArray = useFieldArray({ control: form.control, name: "children" });
  const commercialDiscountsArray = useFieldArray({ control: form.control, name: "commercialDiscounts" });

  const hasSpouse = useWatch({ control: form.control, name: "hasSpouse" });
  const isParticular = useWatch({ control: form.control, name: "isParticular" });
  const holderUsesGross = useWatch({ control: form.control, name: "holderUsesGross" });
  const spouseUsesGross = useWatch({ control: form.control, name: "spouseUsesGross" });

  const selectedProvider = React.useMemo(
    () => providers.find((p) => p.id === selectedProviderId) ?? null,
    [providers, selectedProviderId],
  );

  const providerPlans = React.useMemo(
    () => plans.filter((p) => p.provider_id === selectedProviderId),
    [plans, selectedProviderId],
  );

  const providerById = React.useMemo(() => {
    const m = new Map<string, ProviderRow>();
    for (const p of providers) m.set(p.id, p);
    return m;
  }, [providers]);

  const planIdsForPrices = React.useMemo(
    () => (compareAllProviders ? plans.map((p) => p.id) : selectedPlanIds),
    [compareAllProviders, plans, selectedPlanIds],
  );

  // Load providers and plans
  React.useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setError(null);
      if (!isSupabaseConfigured() || !supabase) {
        setError(
          "Falta configurar Supabase. Creá `cotizador-ospadep/.env.local` con NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.",
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

        if (!alive) return;
        const provList = (provs ?? []) as ProviderRow[];
        const planList = (pls ?? []) as PlanRow[];

        setProviders(provList);
        setPlans(planList);

        const initialProviderId = provList[0]?.id ?? "";
        setSelectedProviderId(initialProviderId);
        setSelectedPlanIds(planList.filter((p) => p.provider_id === initialProviderId).map((p) => p.id));
      } catch (e) {
        if (!alive) return;
        setError(getErrorMessage(e, "Error cargando datos"));
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }
    void load();
    return () => { alive = false; };
  }, []);

  // Load prices for selected plans
  React.useEffect(() => {
    let alive = true;
    async function loadPrices() {
      setPricesByPlan({});
      if (planIdsForPrices.length === 0) { setLoadingPrices(false); return; }
      if (!supabase) return;
      setLoadingPrices(true);
      try {
        const { data, error: prErr } = await supabase
          .from("prices")
          .select("plan_id,age_min,age_max,role,price,is_particular,effective_month")
          .in("plan_id", planIdsForPrices)
          .eq("effective_month", effectiveMonth)
          .order("plan_id")
          .order("role")
          .order("age_min");
        if (prErr) throw prErr;
        if (!alive) return;
        const rows = (data ?? []) as PriceRow[];
        const byPlan: Record<string, PriceRow[]> = {};
        for (const r of rows) {
          const id = r.plan_id;
          if (!byPlan[id]) byPlan[id] = [];
          byPlan[id].push(r);
        }
        setPricesByPlan(byPlan);
      } catch (e) {
        if (!alive) return;
        setError(getErrorMessage(e, "Error cargando precios"));
      } finally {
        if (alive) setLoadingPrices(false);
      }
    }
    void loadPrices();
    return () => { alive = false; };
  }, [planIdsForPrices, effectiveMonth]);

  function onSubmit(values: FormValues) {
    setError(null);
    setExpandedPlanId(null);
    try {
      const idsToQuote = compareAllProviders ? plans.map((p) => p.id) : selectedPlanIds;
      if (idsToQuote.length === 0) {
        throw new Error(compareAllProviders ? "No hay planes cargados" : "Marcá al menos un plan");
      }
      const holderAporte = values.holderUsesGross ? values.holderGross * 0.0765 : values.holderContribution;
      const spouseAporte =
        values.hasSpouse && typeof values.spouseAge === "number"
          ? values.spouseUsesGross ? values.spouseGross * 0.0765 : values.spouseContribution
          : 0;
      const req = buildQuoteRequest(values);
      setLastInputs({ holderAporte, spouseAporte, members: req.members });

      const rows: PlanQuoteRow[] = [];
      for (const planId of idsToQuote) {
        const plan = plans.find((p) => p.id === planId);
        if (!plan) continue;
        const prov = providerById.get(plan.provider_id);
        if (!prov) {
          rows.push({ plan, providerName: "—", providerSlug: "", result: null, error: "Prestador no encontrado" });
          continue;
        }
        const planPrices = pricesByPlan[planId] ?? [];
        try {
          if (planPrices.length === 0) throw new Error("No hay tarifas cargadas para este plan en el mes vigente");
          const strat = strategyForProviderSlug(prov.slug);
          const res = strat.quote({ providerName: prov.name, prices: planPrices, planId: plan.id }, req);
          if (!isDetailedQuoteResult(res)) throw new Error("Cálculo incompleto para este plan");
          rows.push({ plan, providerName: prov.name, providerSlug: prov.slug, result: res });
        } catch (e) {
          rows.push({
            plan,
            providerName: prov.name,
            providerSlug: prov.slug,
            result: null,
            error: friendlyQuoteError(getErrorMessage(e, "No se pudo cotizar este plan")),
          });
        }
      }

      rows.sort((a, b) => {
        const ta = a.result?.total;
        const tb = b.result?.total;
        if (ta != null && tb != null) {
          const byTotal = ta - tb;
          if (byTotal !== 0) return byTotal;
          return a.providerName.localeCompare(b.providerName, "es");
        }
        if (ta != null) return -1;
        if (tb != null) return 1;
        return a.providerName.localeCompare(b.providerName, "es");
      });

      setPlanCompareRows(rows);
    } catch (e) {
      setPlanCompareRows([]);
      setError(getErrorMessage(e, "Error desconocido"));
    }
  }

  const successfulQuotes = React.useMemo(() => planCompareRows.filter((r) => r.result != null), [planCompareRows]);
  const bestTotal = successfulQuotes[0]?.result?.total ?? null;

  async function handleDownloadPdf() {
    if (planCompareRows.length === 0) return;
    setPdfExporting(true);
    setError(null);
    try {
      const { downloadComparisonPdf } = await import("@/lib/pdf/download-comparison-pdf");
      const fv = form.getValues() as FormValues;
      await downloadComparisonPdf({
        rows: planCompareRows.map((r) => ({
          plan: { name: r.plan.name, type: r.plan.type },
          providerName: r.providerName,
          result: r.result,
          error: r.error,
        })),
        effectiveMonthISO: effectiveMonth,
        scopeLabel: compareAllProviders ? "Todos los prestadores" : (selectedProvider?.name ?? "—"),
        particular: fv.isParticular,
        lastInputs,
        commercialDiscounts: fv.commercialDiscounts ?? [],
        bestTotal,
      });
    } catch (e) {
      setError(getErrorMessage(e, "No se pudo generar el PDF"));
    } finally {
      setPdfExporting(false);
    }
  }

  function canAdvanceFromStep0() {
    if (loading) return false;
    if (compareAllProviders) return plans.length > 0;
    return selectedProviderId !== "" && selectedPlanIds.length > 0;
  }

  async function handleNext() {
    setError(null);
    if (currentStep === 0) {
      if (!canAdvanceFromStep0()) return;
      setStepDir(1);
      setCurrentStep(1);
    } else if (currentStep === 1) {
      const fields: Parameters<typeof form.trigger>[0] = hasSpouse
        ? ["holderAge", "spouseAge"]
        : ["holderAge"];
      const valid = await form.trigger(fields);
      if (!valid) return;
      setStepDir(1);
      setCurrentStep(2);
    } else if (currentStep === 2) {
      form.handleSubmit((values) => {
        onSubmit(values);
        setStepDir(1);
        setCurrentStep(3);
      })();
    }
  }

  function handleBack() {
    setError(null);
    if (currentStep === 0) {
      form.reset();
      setCompareAllProviders(false);
      setPlanCompareRows([]);
      setExpandedPlanId(null);
      setSelectedPlanIds(plans.filter((p) => p.provider_id === selectedProviderId).map((p) => p.id));
    } else {
      setStepDir(-1);
      setCurrentStep((s) => s - 1);
    }
  }

  // ─── Calculated total aportes ─────────────────────────────────────────────
  const watchedValues = form.watch();
  const totalAportes = React.useMemo(() => {
    const v = watchedValues as FormValues;
    const h = v.holderUsesGross ? (v.holderGross ?? 0) * 0.0765 : (v.holderContribution ?? 0);
    const s = v.hasSpouse
      ? v.spouseUsesGross ? (v.spouseGross ?? 0) * 0.0765 : (v.spouseContribution ?? 0)
      : 0;
    const total = h + s;
    return Number.isFinite(total) ? total : 0;
  }, [watchedValues]);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div
      className="mx-auto w-full max-w-5xl overflow-hidden rounded-2xl bg-white"
      style={{
        boxShadow:
          "rgba(0,0,0,0.08) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 4px, rgba(0,0,0,0.04) 0px 12px 24px -8px",
      }}
    >
      <div className="flex min-h-[640px] flex-col md:flex-row">

        {/* ════════════════════ LEFT SIDEBAR ════════════════════ */}
        <aside className="hidden w-64 shrink-0 flex-col bg-[#fafafa] p-8 md:flex">
          {/* Brand */}
          <div className="mb-10">
            <p className="text-xl font-semibold tracking-tight text-[#171717]" style={{ letterSpacing: "-0.96px" }}>
              Magenta.
            </p>
            <p className="mt-0.5 text-xs text-[#808080]">Cotizador de planes</p>
          </div>

          {/* Steps */}
          <nav aria-label="Pasos del formulario" className="flex flex-col">
            {STEPS.map((step, i) => {
              const isActive = currentStep === i;
              const isCompleted = currentStep > i;
              return (
                <div key={i} className="flex gap-3">
                  {/* Circle + connector */}
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all duration-200",
                        isActive || isCompleted
                          ? "bg-[#171717] text-white"
                          : "bg-white text-[#808080]",
                      )}
                      style={
                        !(isActive || isCompleted)
                          ? { boxShadow: "0px 0px 0px 1px rgba(0,0,0,0.12)" }
                          : {}
                      }
                    >
                      {isCompleted ? "✓" : i + 1}
                    </div>
                    {i < STEPS.length - 1 && (
                      <div
                        className={cn(
                          "w-px flex-1 transition-colors duration-300",
                          currentStep > i ? "bg-[#171717]" : "bg-[#ebebeb]",
                        )}
                        style={{ minHeight: 48 }}
                      />
                    )}
                  </div>

                  {/* Label */}
                  <div className={cn("pb-8", i === STEPS.length - 1 && "pb-0")}>
                    <p
                      className={cn(
                        "text-sm font-medium leading-snug transition-colors duration-200",
                        isActive ? "text-[#171717]" : "text-[#808080]",
                      )}
                    >
                      {step.title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-[#808080]">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Vertical divider */}
        <div className="hidden w-px shrink-0 bg-[#ebebeb] md:block" />

        {/* ════════════════════ RIGHT CONTENT ════════════════════ */}
        <div className="flex flex-1 flex-col">

          {/* Mobile progress bar */}
          <div
            className="flex items-center gap-2 px-6 py-4 md:hidden"
            style={{ borderBottom: "1px solid #ebebeb" }}
          >
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-full transition-all duration-300",
                  i <= currentStep ? "bg-[#171717]" : "bg-[#ebebeb]",
                )}
              />
            ))}
            <span className="ml-2 shrink-0 text-xs text-[#808080]">
              {currentStep + 1}/{STEPS.length}
            </span>
          </div>

          {/* Content area */}
          <div className="flex flex-1 flex-col px-8 py-8">

            {/* AnimatePresence wraps the animated step content */}
            <AnimatePresence mode="wait" custom={stepDir} initial={false}>
              <motion.div
                key={currentStep}
                custom={stepDir}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-1 flex-col"
              >

            {/* Step header */}
            <div className="mb-8">
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-widest text-[#808080]">
                Paso {currentStep + 1} de {STEPS.length}
              </p>
              <h2
                className="text-2xl font-semibold text-[#171717]"
                style={{ letterSpacing: "-0.96px" }}
              >
                {STEPS[currentStep].title}
              </h2>
              <p className="mt-1 text-sm text-[#4d4d4d]">
                {STEPS[currentStep].description}
              </p>
            </div>

            {/* ── STEP 0: PRESTADOR ─────────────────────────────── */}
            {currentStep === 0 && (
              <div className="flex-1 space-y-4">
                {loading && (
                  <motion.p
                    className="text-sm text-[#808080]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    Cargando prestadores…
                  </motion.p>
                )}

                {/* Compare all toggle */}
                <div
                  className="flex items-center justify-between rounded-lg bg-white px-4 py-3.5"
                  style={{ boxShadow: shadowBorder }}
                >
                  <div className="space-y-0.5">
                    <Label htmlFor="compareAll" className="text-sm font-medium text-[#171717]">
                      Todos los prestadores
                    </Label>
                    <p className="text-xs text-[#808080]">
                      Cotiza todos los planes cargados en una tabla ordenada por precio.
                    </p>
                  </div>
                  <Switch
                    id="compareAll"
                    checked={compareAllProviders}
                    onCheckedChange={(checked) => {
                      setCompareAllProviders(checked);
                      setPlanCompareRows([]);
                      setSelectedPlanIds(
                        checked
                          ? plans.map((p) => p.id)
                          : plans.filter((p) => p.provider_id === selectedProviderId).map((p) => p.id),
                      );
                    }}
                    disabled={loading || plans.length === 0}
                  />
                </div>

                {compareAllProviders ? (
                  <div
                    className="rounded-lg bg-[#fafafa] px-4 py-3.5"
                    style={{ boxShadow: shadowBorder }}
                  >
                    <p className="text-sm text-[#4d4d4d]">
                      Se incluirán{" "}
                      <span className="font-semibold text-[#171717]">{plans.length}</span>{" "}
                      planes de{" "}
                      <span className="font-semibold text-[#171717]">{providers.length}</span>{" "}
                      prestadores en la cotización.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Provider select */}
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-medium uppercase tracking-widest text-[#808080]">
                        Prestador
                      </Label>
                      <Select
                        value={selectedProviderId}
                        onValueChange={(providerId) => {
                          setSelectedProviderId(providerId);
                          setSelectedPlanIds(
                            plans.filter((p) => p.provider_id === providerId).map((p) => p.id),
                          );
                          setPlanCompareRows([]);
                        }}
                        disabled={loading || providers.length === 0}
                      >
                        <SelectTrigger
                          className="h-10 border-0 bg-white"
                          style={{ boxShadow: shadowInput }}
                        >
                          <SelectValue placeholder="Elegí un prestador" />
                        </SelectTrigger>
                        <SelectContent>
                          {providers.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Plans */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-[11px] font-medium uppercase tracking-widest text-[#808080]">
                          Planes a cotizar
                        </Label>
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-[#4d4d4d]"
                            disabled={providerPlans.length === 0 || loading}
                            onClick={() => { setSelectedPlanIds(providerPlans.map((p) => p.id)); setPlanCompareRows([]); }}
                          >
                            Todos
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-[#4d4d4d]"
                            disabled={providerPlans.length === 0 || loading}
                            onClick={() => { setSelectedPlanIds([]); setPlanCompareRows([]); }}
                          >
                            Ninguno
                          </Button>
                        </div>
                      </div>
                      {loadingPrices && (
                        <motion.p
                          className="text-xs text-[#808080]"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                        >
                          Cargando tarifas…
                        </motion.p>
                      )}
                      <div
                        className="max-h-48 space-y-0.5 overflow-y-auto rounded-lg px-2 py-2"
                        style={{ boxShadow: shadowBorder }}
                      >
                        {providerPlans.length === 0 ? (
                          <p className="px-2 py-2 text-xs text-[#808080]">Sin planes para este prestador.</p>
                        ) : (
                          providerPlans.map((pl) => {
                            const checked = selectedPlanIds.includes(pl.id);
                            const hasPrices = (pricesByPlan[pl.id]?.length ?? 0) > 0;
                            return (
                              <label
                                key={pl.id}
                                className="flex cursor-pointer items-start gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-[#fafafa]"
                              >
                                <input
                                  type="checkbox"
                                  className="mt-0.5 size-3.5 accent-[#171717]"
                                  checked={checked}
                                  onChange={(e) => {
                                    setSelectedPlanIds((prev) => togglePlanId(prev, pl.id, e.target.checked));
                                    setPlanCompareRows([]);
                                  }}
                                />
                                <span className="min-w-0 leading-tight">
                                  <span className="font-medium text-[#171717]">{pl.name}</span>
                                  <span className="text-[#808080]"> · {pl.type}</span>
                                  {!hasPrices && !loadingPrices && (
                                    <span className="mt-0.5 block text-[11px] text-amber-700">
                                      Sin tarifa este mes
                                    </span>
                                  )}
                                </span>
                              </label>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Particular toggle */}
                <div
                  className="flex items-center justify-between rounded-lg bg-white px-4 py-3.5"
                  style={{ boxShadow: shadowBorder }}
                >
                  <div className="space-y-0.5">
                    <Label htmlFor="isParticular" className="text-sm font-medium text-[#171717]">
                      Modalidad particular
                    </Label>
                    <p className="text-xs text-[#808080]">
                      Tarifario particular (sin relación de dependencia).
                    </p>
                  </div>
                  <Switch
                    id="isParticular"
                    checked={Boolean(isParticular)}
                    onCheckedChange={(checked) => {
                      form.setValue("isParticular", checked, { shouldValidate: true, shouldDirty: true });
                      setPlanCompareRows([]);
                    }}
                  />
                </div>

                {/* Vigencia */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-[#808080]">Vigencia:</span>
                  <span
                    className="rounded-full px-3 py-0.5 text-xs font-medium text-[#171717]"
                    style={{ boxShadow: "0px 0px 0px 1px rgba(0,0,0,0.10)" }}
                  >
                    {effectiveMonth.slice(0, 7)}
                  </span>
                </div>
              </div>
            )}

            {/* ── STEP 1: GRUPO FAMILIAR ─────────────────────────── */}
            {currentStep === 1 && (
              <div className="flex-1 space-y-5">
                {/* Holder age */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="holderAge"
                    className="text-[11px] font-medium uppercase tracking-widest text-[#808080]"
                  >
                    Titular — Edad
                  </Label>
                  <Input
                    id="holderAge"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={120}
                    className="h-10 border-0 bg-white"
                    style={{ boxShadow: shadowInput }}
                    {...form.register("holderAge")}
                    onChange={(e) => {
                      void form.register("holderAge").onChange(e);
                      setPlanCompareRows([]);
                    }}
                  />
                  {form.formState.errors.holderAge && (
                    <p className="text-xs text-red-600">{form.formState.errors.holderAge.message}</p>
                  )}
                </div>

                {/* Spouse toggle */}
                <div
                  className="flex items-center justify-between rounded-lg bg-[#fafafa] px-4 py-3.5"
                  style={{ boxShadow: shadowBorder }}
                >
                  <div className="space-y-0.5">
                    <Label htmlFor="hasSpouse" className="text-sm font-medium text-[#171717]">
                      Incluye cónyuge
                    </Label>
                    <p className="text-xs text-[#808080]">
                      Activá si el grupo incluye cónyuge o conviviente a cargo.
                    </p>
                  </div>
                  <Switch
                    id="hasSpouse"
                    checked={hasSpouse}
                    onCheckedChange={(checked) => {
                      form.setValue("hasSpouse", checked, { shouldValidate: true, shouldDirty: true });
                      if (!checked) form.setValue("spouseAge", undefined, { shouldValidate: true, shouldDirty: true });
                      setPlanCompareRows([]);
                    }}
                  />
                </div>

                {/* Spouse age */}
                {hasSpouse && (
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="spouseAge"
                      className="text-[11px] font-medium uppercase tracking-widest text-[#808080]"
                    >
                      Cónyuge — Edad
                    </Label>
                    <Input
                      id="spouseAge"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={120}
                      className="h-10 border-0 bg-white"
                      style={{ boxShadow: shadowInput }}
                      {...form.register("spouseAge")}
                      onChange={(e) => {
                        void form.register("spouseAge").onChange(e);
                        setPlanCompareRows([]);
                      }}
                    />
                    {form.formState.errors.spouseAge && (
                      <p className="text-xs text-red-600">{form.formState.errors.spouseAge.message}</p>
                    )}
                  </div>
                )}

                {/* Children */}
                <div
                  className="rounded-lg p-5"
                  style={{ boxShadow: shadowBorder }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-[#171717]">Hijos / menores</p>
                      <p className="mt-0.5 text-xs text-[#808080]">
                        Sumá un renglón por cada hijo o menor a incluir.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0 border-0 text-xs"
                      style={{ boxShadow: "0px 0px 0px 1px rgba(0,0,0,0.10)" }}
                      onClick={() => { childrenArray.append({ age: 0 }); setPlanCompareRows([]); }}
                    >
                      + Agregar
                    </Button>
                  </div>

                  {childrenArray.fields.length === 0 ? (
                    <p className="mt-3 text-xs text-[#808080]">Sin menores en el grupo.</p>
                  ) : (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {childrenArray.fields.map((field, idx) => {
                        const path = `children.${idx}.age` as const;
                        return (
                          <div key={field.id} className="flex items-end gap-2">
                            <div className="flex-1 space-y-1">
                              <Label
                                htmlFor={`childAge-${field.id}`}
                                className="text-xs text-[#808080]"
                              >
                                Hijo/a #{idx + 1} · Edad
                              </Label>
                              <Input
                                id={`childAge-${field.id}`}
                                type="number"
                                inputMode="numeric"
                                min={0}
                                max={120}
                                className="h-9 border-0 bg-white"
                                style={{ boxShadow: shadowInput }}
                                defaultValue={String(field.age ?? 0)}
                                {...form.register(path)}
                                onChange={(e) => {
                                  void form.register(path).onChange(e);
                                  setPlanCompareRows([]);
                                }}
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-9 text-xs text-[#808080]"
                              onClick={() => { childrenArray.remove(idx); setPlanCompareRows([]); }}
                            >
                              Quitar
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── STEP 2: APORTES Y DESCUENTOS ──────────────────── */}
            {currentStep === 2 && (
              <div className="flex-1 space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Titular */}
                  <div className="rounded-lg p-4" style={{ boxShadow: shadowBorder }}>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-[#171717]">Titular</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#808080]">Bruto</span>
                        <Switch
                          checked={Boolean(holderUsesGross)}
                          onCheckedChange={(checked) => {
                            form.setValue("holderUsesGross", checked, { shouldValidate: true, shouldDirty: true });
                            setPlanCompareRows([]);
                          }}
                        />
                      </div>
                    </div>
                    <div className="mt-3 space-y-1">
                      <Label
                        htmlFor={holderUsesGross ? "holderGross" : "holderContribution"}
                        className="text-xs text-[#808080]"
                      >
                        {holderUsesGross ? "Sueldo bruto" : "Aportes directos"}
                      </Label>
                      <Input
                        id={holderUsesGross ? "holderGross" : "holderContribution"}
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="0.01"
                        className="h-10 border-0 bg-white"
                        style={{ boxShadow: shadowInput }}
                        {...form.register(holderUsesGross ? "holderGross" : "holderContribution")}
                        onChange={(e) => {
                          void form.register(holderUsesGross ? "holderGross" : "holderContribution").onChange(e);
                          setPlanCompareRows([]);
                        }}
                      />
                    </div>
                  </div>

                  {/* Cónyuge */}
                  <div
                    className={cn("rounded-lg p-4", !hasSpouse && "opacity-50")}
                    style={{ boxShadow: shadowBorder }}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-[#171717]">Cónyuge</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#808080]">Bruto</span>
                        <Switch
                          checked={Boolean(spouseUsesGross)}
                          onCheckedChange={(checked) => {
                            form.setValue("spouseUsesGross", checked, { shouldValidate: true, shouldDirty: true });
                            setPlanCompareRows([]);
                          }}
                          disabled={!hasSpouse}
                        />
                      </div>
                    </div>
                    <div className="mt-3 space-y-1">
                      <Label
                        htmlFor={spouseUsesGross ? "spouseGross" : "spouseContribution"}
                        className="text-xs text-[#808080]"
                      >
                        {spouseUsesGross ? "Sueldo bruto" : "Aportes directos"}
                      </Label>
                      <Input
                        id={spouseUsesGross ? "spouseGross" : "spouseContribution"}
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="0.01"
                        className="h-10 border-0 bg-white"
                        style={{ boxShadow: shadowInput }}
                        {...form.register(spouseUsesGross ? "spouseGross" : "spouseContribution")}
                        disabled={!hasSpouse}
                        onChange={(e) => {
                          void form.register(spouseUsesGross ? "spouseGross" : "spouseContribution").onChange(e);
                          setPlanCompareRows([]);
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Total aportes */}
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-medium uppercase tracking-widest text-[#808080]">
                    Total aportes (calculado)
                  </Label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.01"
                    className="h-10 border-0 bg-[#fafafa]"
                    style={{ boxShadow: shadowBorder }}
                    value={totalAportes}
                    readOnly
                  />
                  <p className="text-xs text-[#808080]">
                    Suma titular + cónyuge si corresponde. Misma base para todos los planes comparados.
                  </p>
                </div>

                {/* Commercial discounts */}
                <div className="rounded-lg p-5" style={{ boxShadow: shadowBorder }}>
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-[#171717]">Descuentos comerciales</p>
                      <p className="mt-0.5 text-xs text-[#808080]">
                        Se aplican al subtotal antes de descontar los aportes.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0 border-0 text-xs"
                      style={{ boxShadow: "0px 0px 0px 1px rgba(0,0,0,0.10)" }}
                      onClick={() => { commercialDiscountsArray.append({ label: "", amount: 0 }); setPlanCompareRows([]); }}
                    >
                      + Agregar
                    </Button>
                  </div>

                  {commercialDiscountsArray.fields.length === 0 ? (
                    <p className="text-xs text-[#808080]">Sin descuentos adicionales.</p>
                  ) : (
                    <div className="space-y-2">
                      {commercialDiscountsArray.fields.map((field, idx) => (
                        <div key={field.id} className="flex flex-wrap items-end gap-2 sm:flex-nowrap">
                          <div className="min-w-[140px] flex-1 space-y-1">
                            <Label className="text-xs text-[#808080]">Concepto</Label>
                            <Input
                              className="h-9 border-0 bg-white"
                              style={{ boxShadow: shadowInput }}
                              placeholder="Ej. promo Q1"
                              {...form.register(`commercialDiscounts.${idx}.label`)}
                              onChange={(e) => {
                                void form.register(`commercialDiscounts.${idx}.label`).onChange(e);
                                setPlanCompareRows([]);
                              }}
                            />
                          </div>
                          <div className="w-full space-y-1 sm:w-32">
                            <Label className="text-xs text-[#808080]">Importe</Label>
                            <Input
                              className="h-9 border-0 bg-white"
                              style={{ boxShadow: shadowInput }}
                              type="number"
                              inputMode="decimal"
                              min={0}
                              step="0.01"
                              {...form.register(`commercialDiscounts.${idx}.amount`)}
                              onChange={(e) => {
                                void form.register(`commercialDiscounts.${idx}.amount`).onChange(e);
                                setPlanCompareRows([]);
                              }}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-9 shrink-0 text-xs text-[#808080]"
                            onClick={() => { commercialDiscountsArray.remove(idx); setPlanCompareRows([]); }}
                          >
                            Quitar
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── STEP 3: RESULTADOS ────────────────────────────── */}
            {currentStep === 3 && (
              <div className="flex-1 space-y-5">
                {/* Summary cards */}
                {planCompareRows.length > 0 && (
                  <motion.div
                    className="grid gap-3 sm:grid-cols-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <div className="rounded-lg p-4" style={{ boxShadow: shadowCard }}>
                      <p className="text-xs text-[#808080]">Mejor cuota estimada</p>
                      <p
                        className="mt-1.5 text-2xl font-semibold tabular-nums text-[#171717]"
                        style={{ letterSpacing: "-0.96px" }}
                      >
                        {bestTotal != null ? formatMoneyCompact(bestTotal) : "—"}
                      </p>
                    </div>
                    <div className="rounded-lg p-4" style={{ boxShadow: shadowCard }}>
                      <p className="text-xs text-[#808080]">Planes cotizados</p>
                      <p
                        className="mt-1.5 text-2xl font-semibold tabular-nums text-[#171717]"
                        style={{ letterSpacing: "-0.96px" }}
                      >
                        {successfulQuotes.length}
                      </p>
                    </div>
                    <div className="rounded-lg p-4" style={{ boxShadow: shadowCard }}>
                      <p className="text-xs text-[#808080]">Alcance</p>
                      <p className="mt-1.5 text-sm font-semibold text-[#171717]">
                        {compareAllProviders ? "Todos los prestadores" : (selectedProvider?.name ?? "—")}
                      </p>
                      <p className="mt-0.5 text-xs text-[#808080]">
                        {isParticular ? "Particular" : "Obra social"}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Error */}
                {error && (
                  <div
                    className="rounded-lg p-4 text-sm text-red-700"
                    style={{ boxShadow: "0px 0px 0px 1px rgba(220,38,38,0.2)", background: "rgba(220,38,38,0.04)" }}
                  >
                    {error}
                  </div>
                )}

                {/* Empty state */}
                {planCompareRows.length === 0 && !error && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div
                      className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#fafafa]"
                      style={{ boxShadow: shadowBorder }}
                    >
                      <span className="text-xl">—</span>
                    </div>
                    <p className="text-sm font-medium text-[#171717]">Sin resultados</p>
                    <p className="mt-1 text-xs text-[#808080]">Volvé al paso anterior para ajustar los datos.</p>
                  </div>
                )}

                {/* Results table */}
                {planCompareRows.length > 0 && (
                  <div
                    className="overflow-hidden rounded-lg"
                    style={{ boxShadow: shadowBorder }}
                  >
                    <table className="w-full min-w-[340px] text-xs sm:text-sm">
                      <thead>
                        <tr
                          className="text-left text-[11px] font-medium uppercase tracking-widest text-[#808080]"
                          style={{ borderBottom: "1px solid #ebebeb", background: "#fafafa" }}
                        >
                          <th className="px-3 py-2.5">Prestador</th>
                          <th className="px-3 py-2.5">Plan</th>
                          <th className="hidden px-3 py-2.5 sm:table-cell">Tipo</th>
                          <th className="px-3 py-2.5 text-right">Final</th>
                          <th className="hidden w-24 px-3 py-2.5 sm:table-cell" />
                        </tr>
                      </thead>
                      <tbody>
                        {planCompareRows.map((row, rowIdx) => {
                          const isBest =
                            row.result != null && bestTotal != null && row.result.total === bestTotal;
                          return (
                            <motion.tr
                              key={row.plan.id}
                              custom={rowIdx}
                              variants={fadeUp}
                              initial="hidden"
                              animate="show"
                              style={{ borderBottom: "1px solid #ebebeb" }}
                              className="last:border-0"
                            >
                              <td className="px-3 py-2.5">
                                <div className="flex max-w-[160px] items-center gap-2 sm:max-w-[200px]">
                                  {providerLogoSrc(row.providerSlug) ? (
                                    <Image
                                      src={providerLogoSrc(row.providerSlug)!}
                                      alt={row.providerName}
                                      width={28}
                                      height={28}
                                      className="size-7 shrink-0 object-contain"
                                    />
                                  ) : (
                                    <span
                                      className="size-7 shrink-0 rounded bg-[#fafafa]"
                                      style={{ boxShadow: shadowBorder }}
                                    />
                                  )}
                                  <span className="min-w-0 truncate font-medium text-[#171717]">
                                    {row.providerName}
                                  </span>
                                </div>
                              </td>
                              <td className="px-3 py-2.5">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="font-medium leading-tight text-[#171717]">
                                    {row.plan.name}
                                  </span>
                                  {isBest && (
                                    <span
                                      className="rounded-full px-2 py-0.5 text-[10px] font-medium text-[#0068d6]"
                                      style={{ background: "#ebf5ff" }}
                                    >
                                      Mejor
                                    </span>
                                  )}
                                  <span className="block text-[11px] text-[#808080] sm:hidden">
                                    {row.plan.type}
                                  </span>
                                </div>
                                {row.error && (
                                  <p className="mt-1 text-xs text-red-600">{row.error}</p>
                                )}
                                {row.result && (
                                  <button
                                    type="button"
                                    className="mt-1 text-xs text-[#0072f5] hover:underline sm:hidden"
                                    onClick={() =>
                                      setExpandedPlanId((id) => (id === row.plan.id ? null : row.plan.id))
                                    }
                                  >
                                    {expandedPlanId === row.plan.id ? "Ocultar" : "Ver desglose"}
                                  </button>
                                )}
                              </td>
                              <td className="hidden px-3 py-2.5 text-[#808080] sm:table-cell">
                                {row.plan.type}
                              </td>
                              <td className="px-3 py-2.5 text-right text-sm font-semibold tabular-nums text-[#171717] sm:text-base">
                                {row.result ? formatMoney(row.result.total) : "—"}
                              </td>
                              <td className="hidden px-3 py-2.5 text-right sm:table-cell">
                                {row.result && (
                                  <button
                                    type="button"
                                    className="rounded-md px-3 py-1.5 text-xs font-medium text-[#4d4d4d] transition-colors hover:bg-[#fafafa]"
                                    style={{ boxShadow: "0px 0px 0px 1px rgba(0,0,0,0.08)" }}
                                    onClick={() =>
                                      setExpandedPlanId((id) => (id === row.plan.id ? null : row.plan.id))
                                    }
                                  >
                                    {expandedPlanId === row.plan.id ? "Ocultar" : "Detalle"}
                                  </button>
                                )}
                              </td>
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Expanded detail panels */}
                {planCompareRows.map((row) => {
                  if (!row.result || expandedPlanId !== row.plan.id) return null;
                  const result = row.result;
                  return (
                    <div
                      key={`detail-${row.plan.id}`}
                      className="space-y-4 rounded-lg p-5"
                      style={{ boxShadow: shadowBorder, background: "#fafafa" }}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          {providerLogoSrc(row.providerSlug) && (
                            <Image
                              src={providerLogoSrc(row.providerSlug)!}
                              alt={row.providerName}
                              width={32}
                              height={32}
                              className="size-8 shrink-0 object-contain"
                            />
                          )}
                          <p className="min-w-0 text-sm font-medium text-[#171717]">
                            {row.providerName} · {row.plan.name}
                          </p>
                        </div>
                        <span
                          className="rounded-full px-3 py-0.5 text-xs font-medium text-[#171717]"
                          style={{ boxShadow: "0px 0px 0px 1px rgba(0,0,0,0.10)" }}
                        >
                          {row.plan.type}
                        </span>
                      </div>

                      {/* Line items */}
                      <div
                        className="overflow-hidden rounded-lg bg-white"
                        style={{ boxShadow: shadowBorder }}
                      >
                        <div
                          className="grid grid-cols-[1fr_90px_120px] gap-2 px-3 py-2 text-xs font-medium text-[#808080]"
                          style={{ borderBottom: "1px solid #ebebeb" }}
                        >
                          <div>Integrante / categoría</div>
                          <div className="text-right">Edad</div>
                          <div className="text-right">Importe</div>
                        </div>
                        {(result.lineItems as QuoteLineItem[]).map((it, idx) => (
                          <div
                            key={`${idx}-${it.category}-${it.memberRole}-${it.memberAge}`}
                            className="grid grid-cols-[1fr_90px_120px] gap-2 px-3 py-2 text-sm"
                            style={{ borderBottom: "1px solid #ebebeb" }}
                          >
                            <div className="min-w-0">
                              <div className="font-medium text-[#171717]">
                                {it.memberRole === "holder" ? "Titular"
                                  : it.memberRole === "spouse" ? "Cónyuge"
                                  : it.memberRole === "child" ? "Hijo/a"
                                  : "Familiar"}
                              </div>
                              <div className="truncate text-xs text-[#808080]">{String(it.category)}</div>
                            </div>
                            <div className="text-right tabular-nums text-[#808080]">{Number(it.memberAge)}</div>
                            <div className="text-right tabular-nums font-medium text-[#171717]">
                              {formatMoney(Number(it.price))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Aportes */}
                      {lastInputs && (
                        <div className="space-y-1.5 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-[#808080]">Aportes titular</span>
                            <span className="font-medium tabular-nums text-[#171717]">
                              -{formatMoney(lastInputs.holderAporte)}
                            </span>
                          </div>
                          {lastInputs.spouseAporte > 0 && (
                            <div className="flex items-center justify-between">
                              <span className="text-[#808080]">Aportes cónyuge</span>
                              <span className="font-medium tabular-nums text-[#171717]">
                                -{formatMoney(lastInputs.spouseAporte)}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Totals */}
                      <div
                        className="space-y-1.5 pt-3 text-sm"
                        style={{ borderTop: "1px solid #ebebeb" }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[#808080]">Subtotal planes</span>
                          <span className="font-medium tabular-nums text-[#171717]">
                            {formatMoney(result.basePrice)}
                          </span>
                        </div>
                        {result.discounts.map((d, di) => (
                          <div key={`${di}-${d.label}`} className="flex items-center justify-between">
                            <span className="text-[#808080]">{d.label}</span>
                            <span className="font-medium tabular-nums text-[#171717]">
                              -{formatMoney(d.value)}
                            </span>
                          </div>
                        ))}
                        <div
                          className="flex items-center justify-between pt-2"
                          style={{ borderTop: "1px solid #ebebeb" }}
                        >
                          <span className="font-medium text-[#171717]">Valor final</span>
                          <span
                            className="text-base font-semibold tabular-nums text-[#171717]"
                            style={{ letterSpacing: "-0.32px" }}
                          >
                            {formatMoney(result.total)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* ════════════════════ NAVIGATION FOOTER ════════════════════ */}
          <div
            className="flex items-center justify-between px-8 py-5"
            style={{ borderTop: "1px solid #ebebeb" }}
          >
            {/* Back / Cancel */}
            <button
              type="button"
              onClick={handleBack}
              className="rounded-md px-4 py-2 text-sm font-medium text-[#171717] transition-colors hover:bg-[#fafafa]"
              style={{ boxShadow: shadowBorder }}
            >
              {currentStep === 0 ? "Cancelar" : "← Volver"}
            </button>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {currentStep === 3 ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(0);
                      setPlanCompareRows([]);
                      setExpandedPlanId(null);
                      form.reset();
                    }}
                    className="rounded-md px-4 py-2 text-sm font-medium text-[#4d4d4d] transition-colors hover:bg-[#fafafa]"
                    style={{ boxShadow: shadowBorder }}
                  >
                    Nueva cotización
                  </button>
                  <button
                    type="button"
                    disabled={planCompareRows.length === 0 || pdfExporting}
                    onClick={() => void handleDownloadPdf()}
                    className="flex items-center gap-2 rounded-md bg-[#171717] px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-40"
                  >
                    {pdfExporting ? "Generando…" : "Descargar PDF"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  disabled={currentStep === 0 && !canAdvanceFromStep0()}
                  onClick={() => void handleNext()}
                  className="flex items-center gap-1.5 rounded-md bg-[#171717] px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-40"
                >
                  {currentStep === 2 ? "Cotizar" : "Siguiente"}
                  <span aria-hidden className="text-base leading-none">›</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
