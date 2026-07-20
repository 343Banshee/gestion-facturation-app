import { Text, View } from "@react-pdf/renderer";
import { pdfStyles } from "./pdf-styles";
import { formatMoneyForPdf } from "@/lib/money";
import type { PdfLang } from "@/components/pdf/i18n/labels";
import { PDF_LABELS } from "@/components/pdf/i18n/labels";

export type PdfLine = {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPriceCents: number;
  lineTotalCents: number;
};

export function PdfLineTable({
  lang,
  lines,
  subtotalAmountCents,
}: {
  lang: PdfLang;
  lines: PdfLine[];
  subtotalAmountCents: number;
}) {
  const t = PDF_LABELS[lang];

  return (
    <>
      <View style={pdfStyles.table}>
        <View style={pdfStyles.tableHeaderRow}>
          <Text style={[pdfStyles.tableHeaderCell, pdfStyles.colDescription]}>
            {t.description}
          </Text>
          <Text style={[pdfStyles.tableHeaderCell, pdfStyles.colQty]}>{t.quantity}</Text>
          <Text style={[pdfStyles.tableHeaderCell, pdfStyles.colUnit]}>{t.unit}</Text>
          <Text style={[pdfStyles.tableHeaderCell, pdfStyles.colUnitPrice]}>
            {t.unitPrice}
          </Text>
          <Text style={[pdfStyles.tableHeaderCell, pdfStyles.colTotal]}>{t.total}</Text>
        </View>
        {lines.map((line) => (
          <View key={line.id} style={pdfStyles.tableRow}>
            <Text style={pdfStyles.colDescription}>{line.description}</Text>
            <Text style={pdfStyles.colQty}>{line.quantity}</Text>
            <Text style={pdfStyles.colUnit}>{line.unit}</Text>
            <Text style={pdfStyles.colUnitPrice}>{formatMoneyForPdf(line.unitPriceCents, lang)}</Text>
            <Text style={pdfStyles.colTotal}>{formatMoneyForPdf(line.lineTotalCents, lang)}</Text>
          </View>
        ))}
      </View>
      <View style={pdfStyles.totalsBlock}>
        <Text style={pdfStyles.totalLabel}>{t.subtotal}</Text>
        <Text style={pdfStyles.totalValue}>{formatMoneyForPdf(subtotalAmountCents, lang)}</Text>
      </View>
    </>
  );
}
