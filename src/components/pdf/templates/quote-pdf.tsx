import { Document, Page, Text, View } from "@react-pdf/renderer";
import { pdfStyles } from "./shared/pdf-styles";
import { PdfHeader } from "./shared/pdf-header";
import { PdfClientBlock } from "./shared/pdf-client-block";
import { PdfLineTable } from "./shared/pdf-line-table";
import { PdfFooter } from "./shared/pdf-footer";
import { PDF_LABELS, type PdfLang } from "@/components/pdf/i18n/labels";
import type { Quote, QuoteLine, Client, Profile } from "@/generated/prisma/client";

export type QuotePdfData = Quote & {
  lines: QuoteLine[];
  client: Client;
  profile: Profile;
};

export function QuotePdf({
  quote,
  logoDataUri,
}: {
  quote: QuotePdfData;
  logoDataUri?: string | null;
}) {
  const lang = quote.language as PdfLang;
  const t = PDF_LABELS[lang];

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader
          lang={lang}
          documentTitle={t.quoteTitle}
          number={quote.number}
          issueDate={quote.issueDate}
          secondaryDateLabel={t.validUntil}
          secondaryDate={quote.validUntil}
          logoUrl={logoDataUri}
          issuer={quote.profile}
        />

        <PdfClientBlock label={t.quotedTo} client={quote.client} />

        <PdfLineTable
          lang={lang}
          lines={quote.lines}
          subtotalAmountCents={quote.subtotalAmountCents}
        />

        {quote.notes && (
          <View style={pdfStyles.notesBlock}>
            <Text style={pdfStyles.notesLabel}>{t.notes}</Text>
            <Text>{quote.notes}</Text>
          </View>
        )}

        <PdfFooter
          lang={lang}
          iban={quote.profile.iban}
          bic={quote.profile.bic}
          otherPaymentInstructions={quote.profile.otherPaymentInstructions}
          vatMention={quote.profile.vatMention}
          latePaymentPenaltyText={quote.profile.latePaymentPenaltyText}
          additionalLegalMentions={quote.profile.additionalLegalMentions}
          overrideText={quote.termsOverride}
        />
      </Page>
    </Document>
  );
}
