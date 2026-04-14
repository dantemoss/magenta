"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function getErrorMessage(e: unknown, fallback: string): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "object" && e !== null && "message" in e) {
    const m = (e as { message?: unknown }).message;
    if (typeof m === "string" && m.trim() !== "") return m;
  }
  return fallback;
}

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") ?? "/";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isSupabaseConfigured() || !supabase) {
      setError("Falta configurar Supabase (.env.local).");
      return;
    }
    setLoading(true);
    try {
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInErr) throw signInErr;
      router.replace(next);
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo iniciar sesión"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-[#f5f6f8] px-4 py-8">
      <section className="grid w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_20px_48px_-24px_rgba(0,0,0,0.35)] md:grid-cols-2">
        <div className="flex min-h-[640px] flex-col px-8 py-8 sm:px-10">
          <div className="flex items-center gap-3">
            <Image
              src="/LOGO%20OSPADEP_04.png"
              alt="OSPADEP"
              width={168}
              height={40}
              className="h-9 w-auto object-contain"
              priority
            />
          </div>

          <div className="mt-14 max-w-sm">
            <h1 className="text-4xl font-semibold tracking-tight text-[#171717]">Ingresar</h1>
            <p className="mt-2 text-sm text-[#6a6a6a]">
              Acceso seguro al cotizador de planes OSPADEP.
            </p>

            <form className="mt-8 space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nombre@empresa.com"
                  className="h-11 rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-sm text-[#505050]">
                  <input
                    type="checkbox"
                    checked
                    readOnly
                    className="size-4 rounded border-[#d5d5d5] accent-[#171717]"
                  />
                  Recordarme siempre
                </label>
                <span className="text-xs text-[#7d7d7d]">Sesión persistente</span>
              </div>

              {error ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              ) : null}

              <Button type="submit" disabled={loading} className="h-11 w-full rounded-lg text-sm">
                {loading ? "Ingresando…" : "Ingresar"}
              </Button>
            </form>
          </div>
        </div>

        <div className="relative hidden min-h-[640px] md:block">
          <Image
            src="/plane.png"
            alt="Avión en el cielo"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
        </div>
      </section>
    </main>
  );
}

