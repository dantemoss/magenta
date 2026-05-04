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
  footerPhoneLine: string;
  footerWebLine: string;
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

let pdfFontsOrigin: string | null = null;

export function ensureComparisonPdfFonts(origin: string): void {
  if (pdfFontsOrigin === origin) return;
  try {
    Font.register({
      family: "Poppins",
      fonts: [
        { src: `${origin}/fonts/Poppins-Regular.ttf`, fontWeight: 400 },
        { src: `${origin}/fonts/Poppins-Bold.ttf`, fontWeight: 700 },
      ],
    });
    Font.register({
      family: "Raleway",
      fonts: [
        { src: `${origin}/fonts/Raleway-Bold.ttf`, fontWeight: 700 },
        { src: `${origin}/fonts/Raleway-Black.ttf`, fontWeight: 900 },
      ],
    });
    pdfFontsOrigin = origin;
  } catch {
    pdfFontsOrigin = origin;
  }
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 112,
    paddingHorizontal: 32,
    fontSize: 9,
    fontFamily: "Poppins",
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
    fontFamily: "Poppins",
    color: COLOR_MUTED,
    lineHeight: 1.45,
    maxWidth: 220,
  },
  brandFallback: {
    fontSize: 16,
    fontFamily: "Raleway",
    fontWeight: 900,
    color: COLOR_PRIMARY,
    marginBottom: 6,
  },

  docCol: {
    alignItems: "flex-end",
  },
  documentLabel: {
    fontSize: 22,
    fontFamily: "Raleway",
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
    fontFamily: "Poppins",
    color: COLOR_MUTED_SOFT,
    width: 92,
    textAlign: "right",
    marginRight: 6,
  },
  metaVal: {
    fontSize: 8.5,
    fontFamily: "Poppins",
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
    fontFamily: "Raleway",
    fontWeight: 900,
    color: COLOR_PRIMARY,
    lineHeight: 1.25,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 9.5,
    fontFamily: "Poppins",
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
    fontFamily: "Poppins",
    fontWeight: 700,
    color: COLOR_SLATE,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 8,
    fontFamily: "Poppins",
    color: COLOR_TEXT,
    lineHeight: 1.35,
  },

  sectionEyebrow: {
    fontSize: 7.5,
    fontFamily: "Raleway",
    fontWeight: 700,
    color: COLOR_SLATE_MID,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },

  cardWrap: {
    paddingHorizontal: 6,
    marginBottom: 14,
  },

  card: {
    backgroundColor: COLOR_BG_CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLOR_BORDER,
    padding: 14,
    minHeight: 300,
    flexDirection: "column",
  },
  cardBest: {
    borderWidth: 2,
    borderColor: COLOR_SLATE_MID,
  },

  badgeBest: {
    alignSelf: "center",
    backgroundColor: COLOR_SLATE,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 10,
  },
  badgeBestText: {
    fontSize: 7,
    fontFamily: "Poppins",
    fontWeight: 700,
    color: "#ffffff",
    letterSpacing: 0.3,
  },

  iconBox: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  iconBoxLogo: {
    width: 46,
    height: 46,
    objectFit: "contain",
  },
  iconBoxFallback: {
    fontSize: 11,
    fontFamily: "Raleway",
    fontWeight: 900,
  },
  planTypeUpper: {
    fontSize: 8,
    fontFamily: "Raleway",
    fontWeight: 900,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  planName: {
    fontSize: 11,
    fontFamily: "Raleway",
    fontWeight: 700,
    color: COLOR_TEXT,
    marginBottom: 6,
    lineHeight: 1.3,
  },
  providerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    minHeight: 14,
  },
  providerName: {
    fontSize: 8,
    fontFamily: "Poppins",
    color: COLOR_MUTED,
    flex: 1,
  },

  featuresList: {
    flexDirection: "column",
    flexGrow: 1,
    marginBottom: 12,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 5,
  },
  featureIconBox: { width: 12, marginRight: 6, marginTop: 0.5 },
  featureText: {
    fontSize: 7.8,
    fontFamily: "Poppins",
    color: COLOR_TEXT,
    lineHeight: 1.4,
    flex: 1,
  },
  featureTextMuted: { color: COLOR_MUTED },

  priceSection: {
    borderTopWidth: 1,
    borderTopColor: COLOR_BORDER,
    paddingTop: 10,
    marginTop: "auto",
  },
  priceLabel: {
    fontSize: 7,
    fontFamily: "Poppins",
    fontWeight: 700,
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 10,
  },
  priceAmount: {
    fontSize: 21,
    fontFamily: "Poppins",
    fontWeight: 700,
    letterSpacing: -0.5,
  },
  priceSuffix: {
    fontSize: 9,
    fontFamily: "Poppins",
    color: COLOR_MUTED,
    marginLeft: 4,
  },
  priceStruck: {
    fontSize: 13,
    fontFamily: "Poppins",
    fontWeight: 700,
    color: COLOR_MUTED_SOFT,
    textDecoration: "line-through",
    letterSpacing: -0.3,
    marginBottom: 3,
  },
  contributionNote: {
    fontSize: 7.5,
    fontFamily: "Poppins",
    fontWeight: 700,
    color: COLOR_TEXT,
    marginTop: 4,
  },

  ctaSolid: {
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
  },
  ctaSolidText: {
    fontSize: 8,
    fontFamily: "Poppins",
    fontWeight: 700,
    color: "#ffffff",
  },
  ctaOutline: {
    borderRadius: 10,
    borderWidth: 1.5,
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  ctaOutlineText: {
    fontSize: 8,
    fontFamily: "Poppins",
    fontWeight: 700,
  },

  errBox: {
    marginTop: 8,
    padding: 8,
    backgroundColor: COLOR_DANGER_BG,
    borderRadius: 8,
  },
  errText: {
    fontSize: 7,
    fontFamily: "Poppins",
    color: COLOR_DANGER,
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
    paddingTop: 12,
    paddingBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  footerLeft: {
    flexDirection: "row",
    width: "62%",
    paddingRight: 12,
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
    fontFamily: "Poppins",
    fontWeight: 700,
    color: "#ffffff",
  },
  footerDisclaimer: {
    fontSize: 7,
    fontFamily: "Poppins",
    color: COLOR_MUTED,
    lineHeight: 1.45,
    flex: 1,
  },
  footerRight: {
    alignItems: "flex-end",
    maxWidth: "36%",
  },
  footerContactLine: {
    fontSize: 8,
    fontFamily: "Poppins",
    fontWeight: 600,
    color: COLOR_TEXT,
    marginBottom: 3,
    textAlign: "right",
  },
  footerContactMuted: {
    fontSize: 7.5,
    fontFamily: "Poppins",
    color: COLOR_MUTED,
    textAlign: "right",
  },
  pageNumber: {
    position: "absolute",
    bottom: 8,
    right: 32,
    fontSize: 6.5,
    fontFamily: "Poppins",
    color: COLOR_MUTED_SOFT,
  },
});

function CheckCircleIcon({ fill }: { fill: string }) {
  return (
    <Svg width={11} height={11} viewBox="0 0 24 24">
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
}: {
  logoSrc?: string;
  providerName: string;
  accent: string;
}) {
  const cleaned = providerName.replace(/[^a-záéíóúñA-ZÁÉÍÓÚÑ0-9]/g, "");
  const initials =
    cleaned.length >= 2
      ? cleaned.slice(0, 2).toUpperCase()
      : cleaned.length === 1
        ? cleaned.toUpperCase()
        : "?";

  return (
    <View style={styles.iconBox}>
      {logoSrc ? (
        <Image src={logoSrc} style={styles.iconBoxLogo} />
      ) : (
        <Text style={[styles.iconBoxFallback, { color: accent }]}>{initials}</Text>
      )}
    </View>
  );
}

function PlanCard({
  row,
  accent,
  colPct,
  bestPriceLabel,
  regularPriceLabel,
}: {
  row: ComparisonPdfRowInput;
  accent: string;
  colPct: number;
  bestPriceLabel: string;
  regularPriceLabel: string;
}) {
  const hasError = Boolean(row.errorNote);
  const isBest = row.isBest && !hasError;

  return (
    <View style={[styles.cardWrap, { width: `${colPct}%` }]} wrap={false}>
      <View
        style={[styles.card, ...(isBest ? [styles.cardBest] : [])]}
      >
        {isBest ? (
          <View style={styles.badgeBest}>
            <Text style={styles.badgeBestText}>{bestPriceLabel}</Text>
          </View>
        ) : (
          <View style={{ height: 22, marginBottom: 4 }} />
        )}

        <ProviderLogoBox
          logoSrc={row.logoSrc}
          providerName={row.providerName}
          accent={accent}
        />

        <Text style={[styles.planTypeUpper, { color: accent }]}>
          {(row.planType || "Plan").toUpperCase()}
        </Text>
        <Text style={styles.planName}>{row.planName}</Text>

        <View style={styles.providerRow}>
          <Text style={styles.providerName}>{row.providerName}</Text>
        </View>

        <View style={styles.featuresList}>
          {row.features.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={styles.featureIconBox}>
                <CheckCircleIcon fill={accent} />
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
            <View style={{ marginBottom: 6 }}>
              <Text style={styles.priceStruck}>{row.strikeThroughPrice}</Text>
              <View style={styles.priceRow}>
                <Text style={[styles.priceAmount, { color: COLOR_TEXT }]}>
                  {row.finalText}
                </Text>
                <Text style={styles.priceSuffix}>/mes</Text>
              </View>
              <Text style={styles.contributionNote}>¡descontado por aportes!</Text>
            </View>
          ) : (
            <View style={styles.priceRow}>
              <Text style={[styles.priceAmount, { color: COLOR_TEXT }]}>
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
              <Text style={styles.ctaSolidText}>Mejor opción económica</Text>
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

export function ComparisonPdfDocument(props: ComparisonPdfInput) {
  const rowCount = props.rows.length;
  const colWeight =
    rowCount <= 1 ? 100 : rowCount === 2 ? 50 : rowCount === 3 ? 33.333 : 25;

  return (
    <Document
      title={props.title}
      author="OSPADEP"
      creator="Cotizador OSPADEP"
      producer="Cotizador OSPADEP"
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
              <Text style={styles.metaKey}>Cotización Nº</Text>
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

        <Text style={styles.sectionEyebrow}>Planes cotizados</Text>
        <View style={styles.grid}>
          {props.rows.map((row, i) => {
            const accent =
              row.isBest && !row.errorNote
                ? COLOR_SLATE
                : ACCENT_BY_INDEX[i % ACCENT_BY_INDEX.length];
            return (
              <PlanCard
                key={i}
                row={row}
                accent={accent}
                colPct={colWeight}
                bestPriceLabel={props.bestPriceLabel}
                regularPriceLabel={props.regularPriceLabel}
              />
            );
          })}
        </View>

        <View style={styles.footerBar} fixed>
          <View style={styles.footerLeft}>
            <View style={styles.footerInfoIcon}>
              <Text style={styles.footerInfoIconText}>i</Text>
            </View>
            <Text style={styles.footerDisclaimer}>{props.disclaimer}</Text>
          </View>
          <View style={styles.footerRight}>
            <Text style={styles.footerContactLine}>{props.footerPhoneLine}</Text>
            <Text style={styles.footerContactMuted}>{props.footerWebLine}</Text>
          </View>
        </View>

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
}
