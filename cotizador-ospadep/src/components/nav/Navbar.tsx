"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { AuthButtons } from "@/components/auth/AuthButtons";

const navItems = [
  { href: "/", label: "Cotizador" },
  { href: "/planes", label: "Precios base" },
  { href: "/admin/precios", label: "Administración" },
] as const;

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-muted/40">
            M
          </span>
          <span className="hidden sm:inline">Magenta</span>
        </Link>

        <nav className="flex items-center gap-1 rounded-full border border-border bg-card p-1 shadow-sm">
          {navItems.map((it) => {
            const active = pathname === it.href;
            return (
              <Link
                key={it.href}
                href={it.href}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition",
                  "text-muted-foreground hover:text-foreground",
                  active && "bg-muted text-foreground",
                )}
              >
                {it.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden sm:block">
          <AuthButtons />
        </div>
      </div>
    </header>
  );
}

