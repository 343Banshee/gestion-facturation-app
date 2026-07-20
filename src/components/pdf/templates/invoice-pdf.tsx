import { Document, Page, Text, View } from "@react-pdf/renderer";
import { pdfStyles } from "./shared/pdf-styles";
import { PdfHeader } from "./shared/pdf-header";
import { PdfClientBlock } from "./shared/pdf-client-block";
import { PdfLineTable } from "./shared/pdf-line-table";
import { PdfFooter } from "./shared/pdf-footer";
import { PDF_LABELS, type PdfLang } from "@/components/pdf/i18n/labels";
import type { Invoice, InvoiceLine, Client, Profile, Quote } from "@/generated/prisma/client";

export type InvoicePdfData = Invoice & {
  lines: InvoiceLine[];
  client: Client;
  profile: Profile;
  sourceQuote: Quote | null;
};

export function InvoicePdf({
  invoice,
  logoDataUri,
}: {
  invoice: InvoicePdfData;
  logoDataUri?: string | null;
}) {
  const lang = invoice.language as PdfLang;
  const t = PDF_LABELS[lang];

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader
          lang={lang}
          documentTitle={t.invoiceTitle}
          number={invoice.number}
          issueDate={invoice.issueDate}
          secondaryDateLabel={t.dueDate}
          secondaryDate={invoice.dueDate}
          logoUrl={logoDataUri}
          issuer={invoice.profile}
        />

        <PdfClientBlock label={t.billedTo} client={invoice.client} />

        {invoice.sourceQuote && (
          <Text style={[pdfStyles.muted, { marginTop: -20, marginBottom: 20 }]}>
            {t.quoteConvertedFrom} : {invoice.sourceQuote.number}
          </Text>
        )}

        <PdfLineTable
          lang={lang}
          lines={invoice.lines}
          subtotalAmountCents={invoice.subtotalAmountCents}
        />

        {invoice.notes && (
          <View style={pdfStyles.notesBlock}>
            <Text style={pdfStyles.notesLabel}>{t.notes}</Text>
            <Text>{invoice.notes}</Text>
          </View>
        )}

        <PdfFooter
          lang={lang}
          iban={invoice.profile.iban}
          bic={invoice.profile.bic}
          otherPaymentInstructions={invoice.profile.otherPaymentInstructions}
          vatMention={invoice.profile.vatMention}
          latePaymentPenaltyText={invoice.profile.latePaymentPenaltyText}
          additionalLegalMentions={invoice.profile.additionalLegalMentions}
          overrideText={invoice.termsOverride}
        />
      </Page>
    </Document>
  );
}
