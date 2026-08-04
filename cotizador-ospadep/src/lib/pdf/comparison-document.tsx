import {
  Document,
  Font,
  Image,
  Page,
  Path,
  StyleSheet,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer";

export type ComparisonPdfFeature = {
  label: string;
  emphasis?: boolean;
};

export type ComparisonPdfRowInput = {
  providerName: string;
  providerSlug: string;
  logoSrc?: string;
  planName: string;
  planType: string;
  finalText: string;
  /** Precio antes de aplicar aportes (para tachado cuando hay descuento por aportes) */
  strikeThroughPrice?: string;
  /** Hay línea “Aportes” aplicada en el cálculo */
  hasContributionDiscount?: boolean;
  isBest: boolean;
  features: ComparisonPdfFeature[];
  errorNote?: string;
};

export type ComparisonPdfSummaryItem = {
  label: string;
  value: string;
};

export type ComparisonPdfInput = {
  /** Palabra destacada tipo “INVOICE” del mockup */
  documentLabel: string;
  quoteRef: string;
  /** Título grande bajo el encabezado (hero) */
  heroTitle: string;
  heroSubtitle: string;
  /** Leyenda breve bajo el logo */
  tagline: string;
  title: string;
  subtitle?: string;
  logoSrc?: string;
  quoteDateLabel: string;
  effectiveMonthLabel: string;
  summaryItems: ComparisonPdfSummaryItem[];
  rows: ComparisonPdfRowInput[];
  bestPriceLabel: string;
  regularPriceLabel: string;
  disclaimer: string;
  /** Líneas de contacto del pie (solo datos verificables) */
  footerBrandLine: string;
  footerWebLine: string;
  footerPhoneLine?: string;
};

/** Manual OSPADEP + acentos funcionales */
const COLOR_PRIMARY = "#004f9f";
/** Acentos de tarjetas / CTAs: neutros (manual — grises #333 / #666), sin azules fuertes en bordes */
const COLOR_SLATE = "#475569";
const COLOR_SLATE_MID = "#64748b";
const COLOR_SLATE_LIGHT = "#78716c";
const COLOR_BG_PAGE = "#f2f5f9";
const COLOR_BG_CARD = "#ffffff";
const COLOR_BG_FOOTER = "#e8eef4";
const COLOR_BORDER = "#dde3ea";
const COLOR_TEXT = "#1a2b3c";
const COLOR_MUTED = "#5a6b7c";
const COLOR_MUTED_SOFT = "#7a8a99";
const COLOR_DANGER = "#b91d1b";
const COLOR_DANGER_BG = "#fdecec";

const ACCENT_BY_INDEX = [COLOR_SLATE, COLOR_SLATE_MID, COLOR_SLATE_LIGHT] as const;

/**
 * Noto Sans incluye marcas combinantes (U+0301, U+0303). Poppins no:
 * react-pdf descompone ó/ñ y sin esas marcas los acentos desaparecen en el PDF.
 */
const PDF_FONT_PATHS = {
  bodyRegular: "/fonts/NotoSans-Regular.ttf",
  bodyBold: "/fonts/NotoSans-Bold.ttf",
  ralewayBold: "/fonts/Raleway-Bold.ttf",
  ralewayBlack: "/fonts/Raleway-Black.ttf",
} as const;

const FONT_BODY = "NotoSans";
const FONT_DISPLAY = "Raleway";

let pdfFontsReady: Promise<void> | null = null;

function isSupportedFontBuffer(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 4) return false;
  const sig = new Uint8Array(buffer, 0, 4);
  const isTrueType =
    sig[0] === 0x00 && sig[1] === 0x01 && sig[2] === 0x00 && sig[3] === 0x00;
  const isOpenType =
    sig[0] === 0x4f && sig[1] === 0x54 && sig[2] === 0x54 && sig[3] === 0x4f;
  const isWoff =
    sig[0] === 0x77 && sig[1] === 0x4f && sig[2] === 0x46 && sig[3] === 0x46;
  const isWoff2 =
    sig[0] === 0x77 && sig[1] === 0x4f && sig[2] === 0x46 && sig[3] === 0x32;
  return isTrueType || isOpenType || isWoff || isWoff2;
}

async function fetchFontBuffer(origin: string, path: string): Promise<ArrayBuffer> {
  const res = await fetch(`${origin}${path}`);
  if (!res.ok) {
    throw new Error(`No se pudo cargar la fuente (${res.status}): ${path}`);
  }
  const buffer = await res.arrayBuffer();
  if (!isSupportedFontBuffer(buffer)) {
    throw new Error(
      `Formato de fuente inválido en ${path}. Verificá que el archivo .ttf esté en public/fonts.`,
    );
  }
  return buffer;
}

/** Base64 seguro por chunks (evita corrupción del TTF y pérdida de glifos latinos). */
function fontBufferToDataUri(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return `data:font/ttf;base64,${btoa(binary)}`;
}

/**
 * Registra fuentes con soporte latino completo (incl. marcas combinantes).
 * Desactiva el hyphenation en inglés de react-pdf.
 */
export function ensureComparisonPdfFonts(origin: string): Promise<void> {
  if (!pdfFontsReady) {
    pdfFontsReady = (async () => {
      Font.registerHyphenationCallback((word) => [word]);

      const [bodyRegular, bodyBold, ralewayBold, ralewayBlack] =
        await Promise.all([
          fetchFontBuffer(origin, PDF_FONT_PATHS.bodyRegular),
          fetchFontBuffer(origin, PDF_FONT_PATHS.bodyBold),
          fetchFontBuffer(origin, PDF_FONT_PATHS.ralewayBold),
          fetchFontBuffer(origin, PDF_FONT_PATHS.ralewayBlack),
        ]);

      Font.register({
        family: FONT_BODY,
        fonts: [
          {
            src: fontBufferToDataUri(bodyRegular),
            fontStyle: "normal",
            fontWeight: 400,
          },
          {
            src: fontBufferToDataUri(bodyBold),
            fontStyle: "normal",
            fontWeight: 700,
          },
        ],
      });
      Font.register({
        family: FONT_DISPLAY,
        fonts: [
          {
            src: fontBufferToDataUri(ralewayBold),
            fontStyle: "normal",
            fontWeight: 700,
          },
          {
            src: fontBufferToDataUri(ralewayBlack),
            fontStyle: "normal",
            fontWeight: 900,
          },
        ],
      });
    })();
  }
  return pdfFontsReady;
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 112,
    paddingHorizontal: 32,
    fontSize: 9,
    fontFamily: FONT_BODY,
    fontWeight: 400,
    color: COLOR_TEXT,
    backgroundColor: COLOR_BG_PAGE,
  },

  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: COLOR_PRIMARY,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  brandCol: {
    flexDirection: "column",
    maxWidth: "58%",
  },
  headerLogo: {
    width: 152,
    height: 38,
    objectFit: "contain",
    marginBottom: 6,
  },
  tagline: {
    fontSize: 7.5,
    fontFamily: FONT_BODY,
    color: COLOR_MUTED,
    lineHeight: 1.45,
    maxWidth: 220,
  },
  brandFallback: {
    fontSize: 16,
    fontFamily: FONT_DISPLAY,
    fontWeight: 900,
    color: COLOR_PRIMARY,
    marginBottom: 6,
  },

  docCol: {
    alignItems: "flex-end",
  },
  documentLabel: {
    fontSize: 22,
    fontFamily: FONT_DISPLAY,
    fontWeight: 900,
    color: COLOR_PRIMARY,
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 3,
  },
  metaKey: {
    fontSize: 7.5,
    fontFamily: FONT_BODY,
    color: COLOR_MUTED_SOFT,
    width: 92,
    textAlign: "right",
    marginRight: 6,
  },
  metaVal: {
    fontSize: 8.5,
    fontFamily: FONT_BODY,
    fontWeight: 700,
    color: COLOR_TEXT,
    width: 120,
    textAlign: "right",
  },

  heroBlock: {
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLOR_BORDER,
  },
  heroTitle: {
    fontSize: 15,
    fontFamily: FONT_DISPLAY,
    fontWeight: 900,
    color: COLOR_PRIMARY,
    lineHeight: 1.25,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 9.5,
    fontFamily: FONT_BODY,
    color: COLOR_MUTED,
    lineHeight: 1.45,
  },

  summaryStrip: {
    backgroundColor: COLOR_BG_CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOR_BORDER,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  summaryChip: {
    width: "33.33%",
    paddingRight: 8,
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 6.5,
    fontFamily: FONT_BODY,
    fontWeight: 700,
    color: COLOR_SLATE,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 8,
    fontFamily: FONT_BODY,
    color: COLOR_TEXT,
    lineHeight: 1.35,
  },

  sectionEyebrow: {
    fontSize: 7.5,
    fontFamily: FONT_DISPLAY,
    fontWeight: 700,
    color: COLOR_SLATE_MID,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
  },

  /** Contenedor de opciones: sin márgenes negativos (evita desborde en A4). */
  plansBlock: {
    width: "100%",
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "space-between",
    width: "100%",
  },
  cardWrap: {
    marginBottom: 10,
  },

  card: {
    backgroundColor: COLOR_BG_CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOR_BORDER,
    padding: 12,
    flexDirection: "column",
  },
  cardCompact: {
    padding: 10,
  },
  cardBest: {
    borderWidth: 2,
    borderColor: COLOR_SLATE_MID,
  },

  badgeBest: {
    alignSelf: "flex-start",
    backgroundColor: COLOR_SLATE,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 8,
  },
  badgeBestText: {
    fontSize: 6.5,
    fontFamily: FONT_BODY,
    fontWeight: 700,
    color: "#ffffff",
    letterSpacing: 0.2,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  iconBox: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  iconBoxCompact: {
    width: 30,
    height: 30,
    marginRight: 6,
  },
  iconBoxLogo: {
    width: 34,
    height: 34,
    objectFit: "contain",
  },
  iconBoxLogoCompact: {
    width: 28,
    height: 28,
    objectFit: "contain",
  },
  iconBoxFallback: {
    fontSize: 10,
    fontFamily: FONT_DISPLAY,
    fontWeight: 900,
  },
  cardHeaderText: {
    flex: 1,
    minWidth: 0,
  },
  planTypeUpper: {
    fontSize: 7,
    fontFamily: FONT_DISPLAY,
    fontWeight: 900,
    letterSpacing: 0.6,
    marginBottom: 1,
  },
  planName: {
    fontSize: 10,
    fontFamily: FONT_DISPLAY,
    fontWeight: 700,
    color: COLOR_TEXT,
    lineHeight: 1.25,
  },
  planNameCompact: {
    fontSize: 9,
  },
  providerName: {
    fontSize: 7.5,
    fontFamily: FONT_BODY,
    color: COLOR_MUTED,
    marginTop: 2,
  },

  featuresList: {
    flexDirection: "column",
    marginBottom: 8,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 3,
  },
  featureIconBox: { width: 10, marginRight: 4, marginTop: 1 },
  featureText: {
    fontSize: 7.2,
    fontFamily: FONT_BODY,
    color: COLOR_TEXT,
    lineHeight: 1.35,
    flex: 1,
  },
  featureTextMuted: { color: COLOR_MUTED },

  priceSection: {
    borderTopWidth: 1,
    borderTopColor: COLOR_BORDER,
    paddingTop: 8,
    marginTop: "auto",
  },
  priceLabel: {
    fontSize: 6.5,
    fontFamily: FONT_BODY,
    fontWeight: 700,
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 6,
    flexWrap: "wrap",
  },
  priceAmount: {
    fontSize: 16,
    fontFamily: FONT_BODY,
    fontWeight: 700,
    letterSpacing: -0.4,
  },
  priceAmountCompact: {
    fontSize: 14,
  },
  priceSuffix: {
    fontSize: 8,
    fontFamily: FONT_BODY,
    color: COLOR_MUTED,
    marginLeft: 3,
  },
  priceStruck: {
    fontSize: 10,
    fontFamily: FONT_BODY,
    fontWeight: 700,
    color: COLOR_MUTED_SOFT,
    textDecoration: "line-through",
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  contributionNote: {
    fontSize: 6.5,
    fontFamily: FONT_BODY,
    fontWeight: 700,
    color: COLOR_TEXT,
    marginTop: 2,
    marginBottom: 4,
  },

  ctaSolid: {
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: "center",
  },
  ctaSolidText: {
    fontSize: 7,
    fontFamily: FONT_BODY,
    fontWeight: 700,
    color: "#ffffff",
  },
  ctaOutline: {
    borderRadius: 8,
    borderWidth: 1.2,
    paddingVertical: 6,
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  ctaOutlineText: {
    fontSize: 7,
    fontFamily: FONT_BODY,
    fontWeight: 700,
  },

  errBox: {
    marginTop: 4,
    padding: 6,
    backgroundColor: COLOR_DANGER_BG,
    borderRadius: 6,
  },
  errText: {
    fontSize: 6.5,
    fontFamily: FONT_BODY,
    color: COLOR_DANGER,
    lineHeight: 1.3,
  },

  /** Filas para 4+ planes: legibles a ancho completo, sin apretar columnas. */
  listStack: {
    width: "100%",
  },
  listRow: {
    width: "100%",
    backgroundColor: COLOR_BG_CARD,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLOR_BORDER,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  listRowBest: {
    borderWidth: 2,
    borderColor: COLOR_SLATE_MID,
  },
  listLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 10,
    minWidth: 0,
  },
  listMid: {
    flex: 1.2,
    paddingRight: 10,
    minWidth: 0,
  },
  listRight: {
    alignItems: "flex-end",
    width: 118,
  },
  listBadge: {
    backgroundColor: COLOR_SLATE,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 4,
  },
  listBadgeText: {
    fontSize: 6,
    fontFamily: FONT_BODY,
    fontWeight: 700,
    color: "#ffffff",
  },
  listPrice: {
    fontSize: 13,
    fontFamily: FONT_BODY,
    fontWeight: 700,
    color: COLOR_TEXT,
  },
  listPriceStruck: {
    fontSize: 8,
    fontFamily: FONT_BODY,
    fontWeight: 700,
    color: COLOR_MUTED_SOFT,
    textDecoration: "line-through",
    marginBottom: 1,
  },
  listPriceSuffix: {
    fontSize: 7,
    fontFamily: FONT_BODY,
    color: COLOR_MUTED,
  },
  listFeatureLine: {
    fontSize: 6.8,
    fontFamily: FONT_BODY,
    color: COLOR_MUTED,
    lineHeight: 1.35,
  },

  footerBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLOR_BG_FOOTER,
    borderTopWidth: 1,
    borderTopColor: COLOR_BORDER,
    paddingHorizontal: 32,
    paddingTop: 10,
    paddingBottom: 18,
  },
  footerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  footerLeft: {
    flexDirection: "row",
    width: "64%",
    paddingRight: 14,
  },
  footerInfoIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLOR_PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    marginTop: 1,
  },
  footerInfoIconText: {
    fontSize: 9,
    fontFamily: FONT_BODY,
    fontWeight: 700,
    color: "#ffffff",
  },
  footerDisclaimer: {
    fontSize: 6.8,
    fontFamily: FONT_BODY,
    color: COLOR_MUTED,
    lineHeight: 1.45,
    flex: 1,
  },
  footerRight: {
    alignItems: "flex-end",
    maxWidth: "34%",
  },
  footerBrand: {
    fontSize: 8.5,
    fontFamily: FONT_DISPLAY,
    fontWeight: 900,
    color: COLOR_PRIMARY,
    marginBottom: 3,
    textAlign: "right",
  },
  footerContactLine: {
    fontSize: 7.5,
    fontFamily: FONT_BODY,
    fontWeight: 700,
    color: COLOR_TEXT,
    marginBottom: 2,
    textAlign: "right",
  },
  footerContactMuted: {
    fontSize: 7,
    fontFamily: FONT_BODY,
    color: COLOR_MUTED,
    textAlign: "right",
  },
  footerMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: COLOR_BORDER,
    paddingTop: 6,
  },
  footerRef: {
    fontSize: 6.5,
    fontFamily: FONT_BODY,
    color: COLOR_MUTED_SOFT,
  },
  pageNumber: {
    fontSize: 6.5,
    fontFamily: FONT_BODY,
    color: COLOR_MUTED_SOFT,
  },
});

type PlanLayoutMode = "single" | "duo" | "trio" | "list";

function resolvePlanLayout(count: number): PlanLayoutMode {
  if (count <= 1) return "single";
  if (count === 2) return "duo";
  if (count === 3) return "trio";
  return "list";
}

/** Anchos seguros dentro del área útil A4 (sin padding negativo). */
function cardWidthForLayout(mode: PlanLayoutMode): string {
  if (mode === "single") return "100%";
  if (mode === "duo") return "48.5%";
  return "31.8%";
}

function CheckCircleIcon({ fill, size = 9 }: { fill: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
        fill={fill}
      />
      <Path
        d="M7.5 12.5l3 3 6-7"
        stroke="#ffffff"
        strokeWidth={2.2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ProviderLogoBox({
  logoSrc,
  providerName,
  accent,
  compact = false,
}: {
  logoSrc?: string;
  providerName: string;
  accent: string;
  compact?: boolean;
}) {
  const cleaned = providerName.replace(/[^a-záéíóúñA-ZÁÉÍÓÚÑ0-9]/g, "");
  const initials =
    cleaned.length >= 2
      ? cleaned.slice(0, 2).toUpperCase()
      : cleaned.length === 1
        ? cleaned.toUpperCase()
        : "?";

  return (
    <View style={[styles.iconBox, ...(compact ? [styles.iconBoxCompact] : [])]}>
      {logoSrc ? (
        <Image
          src={logoSrc}
          style={compact ? styles.iconBoxLogoCompact : styles.iconBoxLogo}
        />
      ) : (
        <Text style={[styles.iconBoxFallback, { color: accent }]}>{initials}</Text>
      )}
    </View>
  );
}

function PlanCard({
  row,
  accent,
  widthPct,
  compact,
  bestPriceLabel,
  regularPriceLabel,
}: {
  row: ComparisonPdfRowInput;
  accent: string;
  widthPct: string;
  compact: boolean;
  bestPriceLabel: string;
  regularPriceLabel: string;
}) {
  const hasError = Boolean(row.errorNote);
  const isBest = row.isBest && !hasError;
  const features = row.features.slice(0, compact ? 3 : 4);

  return (
    <View style={[styles.cardWrap, { width: widthPct }]} wrap={false}>
      <View
        style={[
          styles.card,
          ...(compact ? [styles.cardCompact] : []),
          ...(isBest ? [styles.cardBest] : []),
        ]}
      >
        {isBest ? (
          <View style={styles.badgeBest}>
            <Text style={styles.badgeBestText}>{bestPriceLabel}</Text>
          </View>
        ) : (
          <View style={{ height: 16, marginBottom: 2 }} />
        )}

        <View style={styles.cardHeader}>
          <ProviderLogoBox
            logoSrc={row.logoSrc}
            providerName={row.providerName}
            accent={accent}
            compact={compact}
          />
          <View style={styles.cardHeaderText}>
            <Text style={[styles.planTypeUpper, { color: accent }]}>
              {(row.planType || "Plan").toUpperCase()}
            </Text>
            <Text style={[styles.planName, ...(compact ? [styles.planNameCompact] : [])]}>
              {row.planName}
            </Text>
            <Text style={styles.providerName}>{row.providerName}</Text>
          </View>
        </View>

        <View style={styles.featuresList}>
          {features.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={styles.featureIconBox}>
                <CheckCircleIcon fill={accent} size={compact ? 8 : 9} />
              </View>
              <Text
                style={[
                  styles.featureText,
                  ...(f.emphasis ? [] : [styles.featureTextMuted]),
                ]}
              >
                {f.label}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.priceSection}>
          <Text style={[styles.priceLabel, { color: accent }]}>PRECIO MENSUAL</Text>
          {!hasError &&
          row.hasContributionDiscount &&
          row.strikeThroughPrice ? (
            <View>
              <Text style={styles.priceStruck}>{row.strikeThroughPrice}</Text>
              <View style={styles.priceRow}>
                <Text
                  style={[
                    styles.priceAmount,
                    ...(compact ? [styles.priceAmountCompact] : []),
                    { color: COLOR_TEXT },
                  ]}
                >
                  {row.finalText}
                </Text>
                <Text style={styles.priceSuffix}>/mes</Text>
              </View>
              <Text style={styles.contributionNote}>Cuota con descuento por aportes</Text>
            </View>
          ) : (
            <View style={styles.priceRow}>
              <Text
                style={[
                  styles.priceAmount,
                  ...(compact ? [styles.priceAmountCompact] : []),
                  { color: COLOR_TEXT },
                ]}
              >
                {row.finalText}
              </Text>
              {!hasError ? <Text style={styles.priceSuffix}>/mes</Text> : null}
            </View>
          )}

          {hasError ? (
            <View style={styles.errBox}>
              <Text style={styles.errText}>{row.errorNote}</Text>
            </View>
          ) : isBest ? (
            <View style={[styles.ctaSolid, { backgroundColor: COLOR_SLATE }]}>
              <Text style={styles.ctaSolidText}>Opción más conveniente</Text>
            </View>
          ) : (
            <View style={[styles.ctaOutline, { borderColor: COLOR_SLATE_MID }]}>
              <Text style={[styles.ctaOutlineText, { color: COLOR_SLATE }]}>
                {regularPriceLabel}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

function PlanListRow({
  row,
  accent,
  bestPriceLabel,
}: {
  row: ComparisonPdfRowInput;
  accent: string;
  bestPriceLabel: string;
}) {
  const hasError = Boolean(row.errorNote);
  const isBest = row.isBest && !hasError;
  const featureLine = row.features
    .slice(0, 3)
    .map((f) => f.label)
    .join(" · ");

  return (
    <View
      style={[styles.listRow, ...(isBest ? [styles.listRowBest] : [])]}
      wrap={false}
    >
      <View style={styles.listLeft}>
        <ProviderLogoBox
          logoSrc={row.logoSrc}
          providerName={row.providerName}
          accent={accent}
          compact
        />
        <View style={styles.cardHeaderText}>
          <Text style={[styles.planTypeUpper, { color: accent }]}>
            {(row.planType || "Plan").toUpperCase()}
          </Text>
          <Text style={[styles.planName, styles.planNameCompact]}>{row.planName}</Text>
          <Text style={styles.providerName}>{row.providerName}</Text>
        </View>
      </View>

      <View style={styles.listMid}>
        {hasError ? (
          <Text style={styles.errText}>{row.errorNote}</Text>
        ) : (
          <Text style={styles.listFeatureLine}>{featureLine}</Text>
        )}
      </View>

      <View style={styles.listRight}>
        {isBest ? (
          <View style={styles.listBadge}>
            <Text style={styles.listBadgeText}>{bestPriceLabel}</Text>
          </View>
        ) : null}
        {!hasError && row.hasContributionDiscount && row.strikeThroughPrice ? (
          <Text style={styles.listPriceStruck}>{row.strikeThroughPrice}</Text>
        ) : null}
        <Text style={styles.listPrice}>{row.finalText}</Text>
        {!hasError ? <Text style={styles.listPriceSuffix}>por mes</Text> : null}
      </View>
    </View>
  );
}

function PlansSection({
  rows,
  bestPriceLabel,
  regularPriceLabel,
}: {
  rows: ComparisonPdfRowInput[];
  bestPriceLabel: string;
  regularPriceLabel: string;
}) {
  const layout = resolvePlanLayout(rows.length);
  const widthPct = cardWidthForLayout(layout);
  const compact = layout === "trio";

  if (layout === "list") {
    return (
      <View style={styles.listStack}>
        {rows.map((row, i) => {
          const accent =
            row.isBest && !row.errorNote
              ? COLOR_SLATE
              : ACCENT_BY_INDEX[i % ACCENT_BY_INDEX.length];
          return (
            <PlanListRow
              key={i}
              row={row}
              accent={accent}
              bestPriceLabel={bestPriceLabel}
            />
          );
        })}
      </View>
    );
  }

  return (
    <View style={styles.cardGrid}>
      {rows.map((row, i) => {
        const accent =
          row.isBest && !row.errorNote
            ? COLOR_SLATE
            : ACCENT_BY_INDEX[i % ACCENT_BY_INDEX.length];
        return (
          <PlanCard
            key={i}
            row={row}
            accent={accent}
            widthPct={widthPct}
            compact={compact}
            bestPriceLabel={bestPriceLabel}
            regularPriceLabel={regularPriceLabel}
          />
        );
      })}
    </View>
  );
}

export function ComparisonPdfDocument(props: ComparisonPdfInput) {
  return (
    <Document
      title={props.title}
      author="OSPADEP"
      subject={`Cotización ${props.quoteRef}`}
      creator="OSPADEP"
      producer="OSPADEP"
      keywords={props.quoteRef}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.topBar} fixed />

        <View style={styles.headerRow}>
          <View style={styles.brandCol}>
            {props.logoSrc ? (
              <Image src={props.logoSrc} style={styles.headerLogo} />
            ) : (
              <Text style={styles.brandFallback}>OSPADEP</Text>
            )}
            <Text style={styles.tagline}>{props.tagline}</Text>
          </View>
          <View style={styles.docCol}>
            <Text style={styles.documentLabel}>{props.documentLabel}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaKey}>Cotización N°</Text>
              <Text style={styles.metaVal}>{props.quoteRef}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaKey}>Fecha de emisión</Text>
              <Text style={styles.metaVal}>{props.quoteDateLabel}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaKey}>Vigencia tarifaria</Text>
              <Text style={styles.metaVal}>{props.effectiveMonthLabel}</Text>
            </View>
          </View>
        </View>

        <View style={styles.heroBlock}>
          <Text style={styles.heroTitle}>{props.heroTitle}</Text>
          <Text style={styles.heroSubtitle}>{props.heroSubtitle}</Text>
        </View>

        <View style={styles.summaryStrip}>
          {props.summaryItems.map((item, i) => (
            <View key={i} style={styles.summaryChip}>
              <Text style={styles.summaryLabel}>{item.label}</Text>
              <Text style={styles.summaryValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionEyebrow}>Opciones de cobertura</Text>
        <View style={styles.plansBlock}>
          <PlansSection
            rows={props.rows}
            bestPriceLabel={props.bestPriceLabel}
            regularPriceLabel={props.regularPriceLabel}
          />
        </View>

        <View style={styles.footerBar} fixed>
          <View style={styles.footerTop}>
            <View style={styles.footerLeft}>
              <View style={styles.footerInfoIcon}>
                <Text style={styles.footerInfoIconText}>i</Text>
              </View>
              <Text style={styles.footerDisclaimer}>{props.disclaimer}</Text>
            </View>
            <View style={styles.footerRight}>
              <Text style={styles.footerBrand}>{props.footerBrandLine}</Text>
              <Text style={styles.footerContactLine}>{props.footerWebLine}</Text>
              {props.footerPhoneLine ? (
                <Text style={styles.footerContactMuted}>{props.footerPhoneLine}</Text>
              ) : null}
            </View>
          </View>
          <View style={styles.footerMeta}>
            <Text style={styles.footerRef}>Ref. {props.quoteRef}</Text>
            <Text
              style={styles.pageNumber}
              render={({ pageNumber, totalPages }) =>
                `Página ${pageNumber} de ${totalPages}`
              }
            />
          </View>
        </View>
      </Page>
    </Document>
  );
}
