"use client";

import Image from "next/image";
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
    <header
      className="sticky top-0 z-50 border-b border-border/80 bg-card/85 backdrop-blur-md"
      style={{ boxShadow: "0 1px 0 0 hsl(var(--primary) / 0.06)" }}
    >
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">

        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-sm font-semibold text-foreground transition-opacity hover:opacity-75"
          style={{ letterSpacing: "-0.32px" }}
        >
          <Image
            src="/LOGO%20OSPADEP_04.png"
            alt="OSPADEP"
            width={152}
            height={36}
            className="h-9 w-auto object-contain"
            priority
          />

        </Link>

        {/* Nav pills */}
        <nav
          className="flex items-center gap-0.5 rounded-full bg-muted p-1"
          style={{ boxShadow: "0px 0px 0px 1px hsl(var(--border))" }}
        >
          {navItems.map((it) => {
            const active = pathname === it.href;
            return (
              <Link
                key={it.href}
                href={it.href}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {it.label}
              </Link>
            );
          })}
        </nav>

        {/* Auth */}
        <div className="hidden sm:block">
          <AuthButtons />
        </div>
      </div>
    </header>
  );
}
