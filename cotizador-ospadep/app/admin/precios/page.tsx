"use client";

import * as React from "react";

import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { formatMoney } from "@/lib/money";
import type { PriceRow } from "@/lib/engine/strategies";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

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

export default function AdminPricesPage() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const [providers, setProviders] = React.useState<ProviderRow[]>([]);
  const [plans, setPlans] = React.useState<PlanRow[]>([]);
  const [prices, setPrices] = React.useState<PriceRow[]>([]);

  const [increasePct, setIncreasePct] = React.useState<string>("0");
  const [filter, setFilter] = React.useState<string>("");

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
        const [{ data: provs, error: provErr }, { data: pls, error: planErr }, { data: prs, error: prErr }] =
          await Promise.all([
            supabase.from("providers").select("id,name,slug").order("name"),
            supabase.from("plans").select("id,provider_id,name,type").order("name"),
            supabase
              .from("prices")
              .select("plan_id,age_min,age_max,role,price,is_particular")
              .order("plan_id")
              .order("role")
              .order("age_min"),
          ]);
        if (provErr) throw provErr;
        if (planErr) throw planErr;
        if (prErr) throw prErr;
        if (!alive) return;
        setProviders((provs ?? []) as ProviderRow[]);
        setPlans((pls ?? []) as PlanRow[]);
        setPrices((prs ?? []) as PriceRow[]);
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

  async function applyIncrease() {
    setError(null);
    if (!supabase) return;
    const pct = Number(increasePct);
    if (!Number.isFinite(pct)) {
      setError("Porcentaje inválido.");
      return;
    }
    const factor = 1 + pct / 100;
    const next = prices.map((r) => ({
      ...r,
      price: Math.round(r.price * factor * 100) / 100,
    }));

    setSaving(true);
    try {
      // Requiere que la tabla `prices` tenga PK/unique compatible con upsert.
      // Si hoy no existe, lo resolvemos con una migración (ver SQL en docs).
      const { error: upErr } = await supabase.from("prices").upsert(next);
      if (upErr) throw upErr;
      setPrices(next);
    } catch (e) {
      setError(getErrorMessage(e, "No se pudo actualizar precios"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="flex-1 bg-zinc-50 px-4 py-10 dark:bg-black">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Admin · Precios</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Actualización masiva y edición (base para el panel completo).
            </p>
          </div>
          <Badge variant="secondary">Solo Admin</Badge>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Acciones rápidas</CardTitle>
            <CardDescription>Aplicar aumento a todos los precios cargados.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="space-y-2">
              <Label htmlFor="pct">Aumento (%)</Label>
              <Input
                id="pct"
                inputMode="decimal"
                value={increasePct}
                onChange={(e) => setIncreasePct(e.target.value)}
                placeholder="Ej: 7.5"
              />
              <p className="text-xs text-muted-foreground">
                Aplica multiplicador a la columna <span className="font-medium">price</span>.
              </p>
            </div>
            <Button onClick={applyIncrease} disabled={loading || saving}>
              {saving ? "Actualizando…" : "Aplicar a todos"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Buscar</CardTitle>
            <CardDescription>Filtrá por prestador/plan/rol.</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Ej: OSPADEP, Plan Joven, individual…"
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
              <CardTitle>Precios (vista)</CardTitle>
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
                  <div className="text-right">Rol / Edad</div>
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
              Nota: esta pantalla es la base. Próximo paso: CRUD completo (prestadores/planes/precios)
              + editor por fila + carga por “mes/año” (histórico).
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

