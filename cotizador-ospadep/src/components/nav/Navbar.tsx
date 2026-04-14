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
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-md"
      style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}
    >
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">

        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-sm font-semibold text-[#171717] transition-opacity hover:opacity-70"
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
          className="flex items-center gap-0.5 rounded-full bg-[#fafafa] p-1"
          style={{ boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px" }}
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
                    ? "bg-[#171717] text-white"
                    : "text-[#666666] hover:bg-[#ebebeb] hover:text-[#171717]",
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
