import { StyleSheet } from "@react-pdf/renderer";

export const pdfStyles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 64,
    paddingHorizontal: 48,
    fontSize: 9.5,
    fontFamily: "Helvetica",
    color: "#18181b",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  logo: {
    width: 90,
    maxHeight: 60,
    objectFit: "contain",
    marginBottom: 8,
  },
  issuerBlock: {
    maxWidth: 240,
  },
  issuerName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    marginBottom: 2,
  },
  muted: {
    color: "#71717a",
  },
  titleBlock: {
    alignItems: "flex-end",
  },
  title: {
    fontFamily: "Helvetica-Bold",
    fontSize: 22,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    minWidth: 200,
  },
  metaLabel: {
    color: "#71717a",
  },
  clientBlock: {
    marginBottom: 28,
    maxWidth: 260,
  },
  sectionLabel: {
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#71717a",
    marginBottom: 4,
  },
  clientName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10.5,
    marginBottom: 2,
  },
  table: {
    borderTopWidth: 1,
    borderTopColor: "#e4e4e7",
    marginBottom: 4,
  },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e4e4e7",
    paddingVertical: 6,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e4e4e7",
    paddingVertical: 7,
  },
  tableHeaderCell: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 0.3,
    color: "#71717a",
  },
  colDescription: { flex: 3 },
  colQty: { flex: 0.7, textAlign: "right" },
  colUnit: { flex: 0.9, textAlign: "right" },
  colUnitPrice: { flex: 1.2, textAlign: "right" },
  colTotal: { flex: 1.2, textAlign: "right" },
  totalsBlock: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    marginBottom: 28,
  },
  totalLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    marginRight: 8,
  },
  totalValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
  },
  notesBlock: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#fafafa",
    borderRadius: 4,
  },
  notesLabel: {
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#71717a",
    marginBottom: 3,
  },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 48,
    right: 48,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e4e4e7",
    fontSize: 7.5,
    color: "#71717a",
    lineHeight: 1.5,
  },
});
