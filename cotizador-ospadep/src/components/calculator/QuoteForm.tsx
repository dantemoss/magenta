"use client";

import * as React from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import type { QuoteRequest, QuoteResult } from "@/types/quotes";
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
import { Button } from "@/components/ui/button";
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
import { Switch } from "@/components/ui/switch";

const formSchema = z
  .object({
    holderAge: z.coerce.number().int().min(0).max(120),
    hasSpouse: z.boolean(),
    spouseAge: z.coerce.number().int().min(0).max(120).optional(),
    children: z.array(
      z.object({
        age: z.coerce.number().int().min(0).max(120),
      }),
    ),
    isParticular: z.boolean(),
    holderUsesGross: z.boolean(),
    holderContribution: z.coerce.number().min(0),
    holderGross: z.coerce.number().min(0),
    spouseUsesGross: z.boolean(),
    spouseContribution: z.coerce.number().min(0),
    spouseGross: z.coerce.number().min(0),
  })
  .superRefine((val, ctx) => {
    if (val.hasSpouse) {
      if (typeof val.spouseAge !== "number") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["spouseAge"],
          message: "Ingresá la edad de la pareja",
        });
      }
    }

    if (!val.holderUsesGross && val.holderContribution < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["holderContribution"],
        message: "Aportes inválidos",
      });
    }
    if (val.holderUsesGross && val.holderGross < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["holderGross"],
        message: "Sueldo bruto inválido",
      });
    }

    if (val.hasSpouse) {
      if (val.spouseUsesGross && val.spouseGross < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["spouseGross"],
          message: "Sueldo bruto inválido",
        });
      }
      if (!val.spouseUsesGross && val.spouseContribution < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["spouseContribution"],
          message: "Aportes inválidos",
        });
      }
    }
  });

type FormValues = z.infer<typeof formSchema>;
type FormInput = z.input<typeof formSchema>;
type FormOutput = z.output<typeof formSchema>;

type ProviderRow = { id: string; name: string; slug: string };
type PlanRow = { id: string; provider_id: string; name: string; type: string };

function getErrorMessage(e: unknown, fallback: string): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "object" && e !== null && "message" in e) {
    const m = (e as { message?: unknown }).message;
    if (typeof m === "string" && m.trim() !== "") return m;
  }
  return fallback;
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

  const members: QuoteRequest["members"] = [
    { role: "holder", age: values.holderAge },
  ];
  if (values.hasSpouse && typeof values.spouseAge === "number") {
    members.push({ role: "spouse", age: values.spouseAge });
  }
  for (const c of values.children) {
    members.push({ role: "child", age: c.age });
  }
  return {
    members,
    isParticular: values.isParticular,
    contributions: holderAporte + spouseAporte,
  };
}

export function QuoteForm() {
  const [result, setResult] = React.useState<QuoteResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  const [providers, setProviders] = React.useState<ProviderRow[]>([]);
  const [plans, setPlans] = React.useState<PlanRow[]>([]);
  const [selectedProviderId, setSelectedProviderId] = React.useState<string>("");
  const [selectedPlanId, setSelectedPlanId] = React.useState<string>("");
  const [prices, setPrices] = React.useState<PriceRow[]>([]);
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
    },
  });

  const childrenArray = useFieldArray({
    control: form.control,
    name: "children",
  });

  const hasSpouse = useWatch({ control: form.control, name: "hasSpouse" });
  const isParticular = useWatch({ control: form.control, name: "isParticular" });
  const holderUsesGross = useWatch({
    control: form.control,
    name: "holderUsesGross",
  });
  const spouseUsesGross = useWatch({
    control: form.control,
    name: "spouseUsesGross",
  });

  const selectedProvider = React.useMemo(
    () => providers.find((p) => p.id === selectedProviderId) ?? null,
    [providers, selectedProviderId],
  );

  const selectedPlan = React.useMemo(
    () => plans.find((p) => p.id === selectedPlanId) ?? null,
    [plans, selectedPlanId],
  );

  const strategy: QuoteStrategy | null = React.useMemo(() => {
    if (!selectedProvider) return null;
    return strategyForProviderSlug(selectedProvider.slug);
  }, [selectedProvider]);

  React.useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setError(null);
      if (!isSupabaseConfigured() || !supabase) {
        setError(
          "Falta configurar Supabase. Creá `cotizador-ospadep/.env.local` (podés copiar `.env.local.example`) con NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.",
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

        const initialPlanId =
          planList.find((p) => p.provider_id === initialProviderId)?.id ?? "";
        setSelectedPlanId(initialPlanId);
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

  React.useEffect(() => {
    let alive = true;
    async function loadPrices() {
      setPrices([]);
      if (!selectedPlanId) return;
      if (!supabase) return;
      try {
        const { data, error: prErr } = await supabase
          .from("prices")
          .select("plan_id,age_min,age_max,role,price,is_particular")
          .eq("plan_id", selectedPlanId)
          .order("role")
          .order("age_min");
        if (prErr) throw prErr;
        if (!alive) return;
        setPrices((data ?? []) as PriceRow[]);
      } catch (e) {
        if (!alive) return;
        setError(getErrorMessage(e, "Error cargando precios"));
      }
    }
    void loadPrices();
    return () => {
      alive = false;
    };
  }, [selectedPlanId]);

  function onSubmit(values: FormValues) {
    setError(null);
    try {
      if (!selectedProvider || !selectedPlan || !strategy) {
        throw new Error("Seleccioná proveedor y plan");
      }
      if (prices.length === 0) {
        throw new Error("No hay precios cargados para el plan seleccionado");
      }
      const holderAporte = values.holderUsesGross
        ? values.holderGross * 0.0765
        : values.holderContribution;
      const spouseAporte =
        values.hasSpouse && typeof values.spouseAge === "number"
          ? values.spouseUsesGross
            ? values.spouseGross * 0.0765
            : values.spouseContribution
          : 0;
      const req = buildQuoteRequest(values);
      const res = strategy.quote({
        providerName: selectedProvider.name,
        prices,
        planId: selectedPlan.id,
      }, req);
      setLastInputs({
        holderAporte,
        spouseAporte,
        members: req.members,
      });
      setResult(res);
    } catch (e) {
      setResult(null);
      setError(getErrorMessage(e, "Error desconocido"));
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>Cotizador</CardTitle>
                  <CardDescription>
                    Elegí plan, cargá el grupo familiar y obtené el desglose.
                  </CardDescription>
                </div>
                <Badge variant="secondary">Luma · Neutral · Teal</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Prestador</Label>
                  <Select
                    value={selectedProviderId}
                    onValueChange={(providerId) => {
                      setSelectedProviderId(providerId);
                      const firstPlanId =
                        plans.find((p) => p.provider_id === providerId)?.id ??
                        "";
                      setSelectedPlanId(firstPlanId);
                      setResult(null);
                    }}
                    disabled={loading || providers.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar prestador" />
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

                <div className="space-y-2">
                  <Label>Plan</Label>
                  <Select
                    value={selectedPlanId}
                    onValueChange={(planId) => {
                      setSelectedPlanId(planId);
                      setResult(null);
                    }}
                    disabled={loading || !selectedProviderId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans
                        .filter((pl) => pl.provider_id === selectedProviderId)
                        .map((pl) => (
                          <SelectItem key={pl.id} value={pl.id}>
                            {pl.name} ({pl.type})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2">
                <div className="space-y-0.5">
                  <Label htmlFor="isParticular">Es Particular</Label>
                  <p className="text-xs text-muted-foreground">
                    Usa precios con IVA cuando aplique.
                  </p>
                </div>
                <Switch
                  id="isParticular"
                  checked={Boolean(isParticular)}
                  onCheckedChange={(checked) => {
                    form.setValue("isParticular", checked, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                    setResult(null);
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
              <CardHeader className="pb-4">
                <CardTitle>Grupo familiar</CardTitle>
                <CardDescription>
                  Cargá edades. Activá pareja y agregá hijos si corresponde.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="holderAge">Titular · Edad</Label>
                    <Input
                      id="holderAge"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={120}
                      {...form.register("holderAge")}
                      onChange={(e) => {
                        form.register("holderAge").onChange(e);
                        setResult(null);
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="hasSpouse">Pareja</Label>
                      <p className="text-xs text-muted-foreground">
                        Activá para cargar cónyuge.
                      </p>
                    </div>
                    <Switch
                      id="hasSpouse"
                      checked={hasSpouse}
                      onCheckedChange={(checked) => {
                        form.setValue("hasSpouse", checked, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                        if (!checked) {
                          form.setValue("spouseAge", undefined, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                        }
                        setResult(null);
                      }}
                    />
                  </div>
                </div>

                {hasSpouse ? (
                  <div className="space-y-2">
                    <Label htmlFor="spouseAge">Cónyuge · Edad</Label>
                    <Input
                      id="spouseAge"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={120}
                      {...form.register("spouseAge")}
                      onChange={(e) => {
                        form.register("spouseAge").onChange(e);
                        setResult(null);
                      }}
                    />
                  </div>
                ) : null}

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">Hijos</p>
                      <p className="text-xs text-muted-foreground">
                        Agregá edades rápidamente.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        childrenArray.append({ age: 0 });
                        setResult(null);
                      }}
                    >
                      + Agregar
                    </Button>
                  </div>

                  {childrenArray.fields.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Sin hijos cargados.
                    </p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {childrenArray.fields.map((field, idx) => {
                        const path = `children.${idx}.age` as const;
                        return (
                          <div key={field.id} className="flex items-end gap-2">
                            <div className="flex-1 space-y-2">
                              <Label htmlFor={`childAge-${field.id}`}>
                                Hijo/a #{idx + 1} · Edad
                              </Label>
                              <Input
                                id={`childAge-${field.id}`}
                                type="number"
                                inputMode="numeric"
                                min={0}
                                max={120}
                                defaultValue={String(field.age ?? 0)}
                                {...form.register(path)}
                                onChange={(e) => {
                                  form.register(path).onChange(e);
                                  setResult(null);
                                }}
                              />
                            </div>
                            <Button
                              variant="ghost"
                              onClick={() => {
                                childrenArray.remove(idx);
                                setResult(null);
                              }}
                            >
                              Quitar
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle>Aportes</CardTitle>
                <CardDescription>
                  Manual o automático \(7,65\%\) del bruto. Se descuentan del plan.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Titular</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          Bruto
                        </span>
                        <Switch
                          checked={Boolean(holderUsesGross)}
                          onCheckedChange={(checked) => {
                            form.setValue("holderUsesGross", checked, {
                              shouldValidate: true,
                              shouldDirty: true,
                            });
                            setResult(null);
                          }}
                        />
                      </div>
                    </div>
                    <div className="mt-3 space-y-2">
                      <Label
                        htmlFor={
                          holderUsesGross ? "holderGross" : "holderContribution"
                        }
                      >
                        {holderUsesGross ? "Sueldo bruto" : "Aportes"}
                      </Label>
                      <Input
                        id={
                          holderUsesGross ? "holderGross" : "holderContribution"
                        }
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="0.01"
                        {...form.register(
                          holderUsesGross ? "holderGross" : "holderContribution",
                        )}
                        onChange={(e) => {
                          form
                            .register(
                              holderUsesGross
                                ? "holderGross"
                                : "holderContribution",
                            )
                            .onChange(e);
                          setResult(null);
                        }}
                      />
                    </div>
                  </div>

                  <div
                    className={cn(
                      "rounded-lg border border-border p-3",
                      !hasSpouse && "opacity-50",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Cónyuge</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          Bruto
                        </span>
                        <Switch
                          checked={Boolean(spouseUsesGross)}
                          onCheckedChange={(checked) => {
                            form.setValue("spouseUsesGross", checked, {
                              shouldValidate: true,
                              shouldDirty: true,
                            });
                            setResult(null);
                          }}
                          disabled={!hasSpouse}
                        />
                      </div>
                    </div>
                    <div className="mt-3 space-y-2">
                      <Label
                        htmlFor={
                          spouseUsesGross ? "spouseGross" : "spouseContribution"
                        }
                      >
                        {spouseUsesGross ? "Sueldo bruto" : "Aportes"}
                      </Label>
                      <Input
                        id={
                          spouseUsesGross ? "spouseGross" : "spouseContribution"
                        }
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="0.01"
                        {...form.register(
                          spouseUsesGross ? "spouseGross" : "spouseContribution",
                        )}
                        disabled={!hasSpouse}
                        onChange={(e) => {
                          form
                            .register(
                              spouseUsesGross
                                ? "spouseGross"
                                : "spouseContribution",
                            )
                            .onChange(e);
                          setResult(null);
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contributions">Aportes totales (auto)</Label>
                  <Input
                    id="contributions"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.01"
                    value={(() => {
                      const v = form.getValues() as FormValues;
                      const h = v.holderUsesGross
                        ? v.holderGross * 0.0765
                        : v.holderContribution;
                      const s = v.hasSpouse
                        ? v.spouseUsesGross
                          ? v.spouseGross * 0.0765
                          : v.spouseContribution
                        : 0;
                      const total = h + s;
                      return Number.isFinite(total) ? total : 0;
                    })()}
                    readOnly
                  />
                  <p className="text-xs text-muted-foreground">
                    Titular + Cónyuge (si aplica).
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={loading || !selectedPlanId}>
                Cotizar
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  form.reset();
                  childrenArray.replace([]);
                  setResult(null);
                  setError(null);
                }}
              >
                Limpiar
              </Button>
            </div>

            {error ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            {result ? (
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle>Cotización</CardTitle>
                    {selectedPlan ? (
                      <Badge variant="outline">
                        {result.providerName} · {selectedPlan.name} ({selectedPlan.type})
                      </Badge>
                    ) : null}
                  </div>
                  <CardDescription>
                    Desglose por integrante + descuentos/aportes.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {"lineItems" in result ? (
                    <div className="overflow-hidden rounded-lg border border-border bg-card">
                      <div className="grid grid-cols-[1fr_90px_120px] gap-2 border-b border-border px-3 py-2 text-xs font-medium text-muted-foreground">
                        <div>Integrante / Categoría</div>
                        <div className="text-right">Edad</div>
                        <div className="text-right">Precio</div>
                      </div>
                      {(result as any).lineItems.map((it: any, idx: number) => (
                        <div
                          key={`${idx}-${it.category}-${it.memberRole}-${it.memberAge}`}
                          className="grid grid-cols-[1fr_90px_120px] gap-2 px-3 py-2 text-sm"
                        >
                          <div className="min-w-0">
                            <div className="font-medium">
                              {it.memberRole === "holder"
                                ? "Titular"
                                : it.memberRole === "spouse"
                                  ? "Cónyuge"
                                  : it.memberRole === "child"
                                    ? "Hijo/a"
                                    : "Familiar"}
                            </div>
                            <div className="truncate text-xs text-muted-foreground">
                              {String(it.category)}
                            </div>
                          </div>
                          <div className="text-right tabular-nums text-muted-foreground">
                            {Number(it.memberAge)}
                          </div>
                          <div className="text-right tabular-nums font-medium">
                            {Number(it.price).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {lastInputs ? (
                    <div className="grid gap-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Aporte Titular</span>
                        <span className="font-medium tabular-nums">
                          -{lastInputs.holderAporte.toFixed(2)}
                        </span>
                      </div>
                      {lastInputs.spouseAporte > 0 ? (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Aporte Cónyuge</span>
                          <span className="font-medium tabular-nums">
                            -{lastInputs.spouseAporte.toFixed(2)}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  <Separator />

                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Base</span>
                      <span className="font-medium tabular-nums">
                        {result.basePrice.toFixed(2)}
                      </span>
                    </div>

                    {result.discounts.map((d) => (
                      <div key={d.label} className="flex items-center justify-between">
                        <span className="text-muted-foreground">{d.label}</span>
                        <span className="font-medium tabular-nums">
                          -{d.value.toFixed(2)}
                        </span>
                      </div>
                    ))}

                    <div className="mt-1 flex items-center justify-between border-t border-border pt-2">
                      <span>Total</span>
                      <span className="text-base font-semibold tabular-nums">
                        {result.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </form>
        </div>

        <aside className="lg:sticky lg:top-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Resumen</CardTitle>
              <CardDescription>Para decidir rápido.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Prestador</span>
                <span className="font-medium">{selectedProvider?.name ?? "-"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium">{selectedPlan?.name ?? "-"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Particular</span>
                <span className="font-medium">{isParticular ? "Sí" : "No"}</span>
              </div>
              <Separator />
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-2xl font-semibold tabular-nums">
                    {result ? result.total.toFixed(2) : "--"}
                  </p>
                </div>
                {result ? <Badge variant="default">Cotizado</Badge> : <Badge>Listo</Badge>}
              </div>
              <p className="text-xs text-muted-foreground">
                Tip: si ya sabés edades y bruto, podés cotizar en segundos.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

