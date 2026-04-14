import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/nav/Navbar";
import { CustomCursor } from "@/components/ui/custom-cursor";
import { DotPattern } from "@/components/ui/dot-pattern";

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "OSPADEP · Cotizador",
  description: "Cotizaciones rápidas con desglose por plan y grupo familiar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${jetBrainsMono.variable} h-full antialiased`}>
      <body className="relative flex min-h-full flex-col bg-[#f5f5f5] text-foreground">
        {/* DotPattern global — visible en toda la app */}
        <DotPattern
          width={20}
          height={20}
          cx={1}
          cy={1}
          cr={1}
          className="fixed fill-neutral-300/50"
        />
        {/* Fade mask radial para suavizar el patrón */}
        <div
          className="pointer-events-none fixed inset-0"
          style={{
            background:
              "radial-gradient(ellipse 90% 70% at 50% 0%, transparent 30%, #f5f5f5 100%)",
          }}
        />
        <CustomCursor />
        <div className="relative z-10 flex flex-1 flex-col">
          <Navbar />
          {children}
        </div>
      </body>
    </html>
  );
}
