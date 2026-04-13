/** Rutas en `public/` para logos de prestadores (mismo criterio que `app/planes`). */
export function providerLogoSrc(slug: string): string | null {
  const s = slug.toLowerCase();
  if (s === "medife") return "/MEDIFE.png";
  if (s === "omint") return "/Omint.png";
  if (s === "ospadep") return "/OSPADEP.png";
  if (s === "swiss-medical") return "/SwissMedical.png";
  return null;
}
