import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

export type ComparisonPdfRowInput = {
  providerName: string;
  planName: string;
  planType: string;
  finalText: string;
  isBest: boolean;
  errorNote?: string;
};

export type ComparisonPdfInput = {
  title: string;
  effectiveMonthLabel: string;
  generatedAtLabel: string;
  scopeLabel: string;
  particularLabel: string;
  groupSummary: string;
  contributionsLine: string;
  commercialDiscountsLine: string;
  rows: ComparisonPdfRowInput[];
  disclaimer: string;
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 44,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#171717",
  },
  title: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 9,
    color: "#525252",
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#404040",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  box: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    padding: 10,
    marginBottom: 14,
    borderRadius: 2,
  },
  boxLine: {
    marginBottom: 3,
    lineHeight: 1.35,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#d4d4d4",
    paddingBottom: 6,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  colProvider: { width: "22%" },
  colPlan: { width: "38%", paddingRight: 6 },
  colType: { width: "18%", paddingRight: 4 },
  colFinal: { width: "22%", textAlign: "right" },
  th: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#737373",
    textTransform: "uppercase",
  },
  bestPill: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#16a34a",
    marginTop: 2,
  },
  err: {
    fontSize: 7,
    color: "#dc2626",
    marginTop: 2,
  },
  footer: {
    marginTop: 18,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    fontSize: 7,
    color: "#737373",
    lineHeight: 1.45,
  },
});

export function ComparisonPdfDocument(props: ComparisonPdfInput) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{props.title}</Text>
        <Text style={styles.subtitle}>
          Vigencia tarifaria: {props.effectiveMonthLabel} · Generado:{" "}
          {props.generatedAtLabel}
        </Text>

        <Text style={styles.sectionLabel}>Condiciones de esta comparativa</Text>
        <View style={styles.box}>
          <Text style={styles.boxLine}>
            <Text style={{ fontFamily: "Helvetica-Bold" }}>Alcance: </Text>
            {props.scopeLabel}
          </Text>
          <Text style={styles.boxLine}>
            <Text style={{ fontFamily: "Helvetica-Bold" }}>Modalidad: </Text>
            {props.particularLabel}
          </Text>
          <Text style={styles.boxLine}>
            <Text style={{ fontFamily: "Helvetica-Bold" }}>Grupo: </Text>
            {props.groupSummary}
          </Text>
          <Text style={styles.boxLine}>
            <Text style={{ fontFamily: "Helvetica-Bold" }}>Aportes: </Text>
            {props.contributionsLine}
          </Text>
          <Text style={styles.boxLine}>
            <Text style={{ fontFamily: "Helvetica-Bold" }}>
              Descuentos comercial:{" "}
            </Text>
            {props.commercialDiscountsLine}
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Comparativa de cuotas estimadas</Text>
        <View style={{ marginBottom: 8 }}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, styles.colProvider]}>Prestador</Text>
            <Text style={[styles.th, styles.colPlan]}>Plan</Text>
            <Text style={[styles.th, styles.colType]}>Tipo</Text>
            <Text style={[styles.th, styles.colFinal]}>Valor final</Text>
          </View>
          {props.rows.map((r, i) => (
            <View key={i} style={styles.tableRow} wrap={false}>
              <View style={styles.colProvider}>
                <Text>{r.providerName}</Text>
              </View>
              <View style={styles.colPlan}>
                <Text>{r.planName}</Text>
                {r.isBest ? (
                  <Text style={styles.bestPill}>Mejor precio</Text>
                ) : null}
                {r.errorNote ? (
                  <Text style={styles.err}>{r.errorNote}</Text>
                ) : null}
              </View>
              <View style={styles.colType}>
                <Text style={{ color: "#525252" }}>{r.planType}</Text>
              </View>
              <View style={styles.colFinal}>
                <Text style={{ fontFamily: "Helvetica-Bold" }}>{r.finalText}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>{props.disclaimer}</Text>
      </Page>
    </Document>
  );
}
