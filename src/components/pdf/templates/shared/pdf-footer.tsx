import { Text, View } from "@react-pdf/renderer";
import { pdfStyles } from "./pdf-styles";
import type { PdfLang } from "@/components/pdf/i18n/labels";
import { PDF_LABELS } from "@/components/pdf/i18n/labels";

export function PdfFooter({
  lang,
  iban,
  bic,
  otherPaymentInstructions,
  vatMention,
  latePaymentPenaltyText,
  additionalLegalMentions,
  overrideText,
}: {
  lang: PdfLang;
  iban?: string | null;
  bic?: string | null;
  otherPaymentInstructions?: string | null;
  vatMention: string;
  latePaymentPenaltyText: string;
  additionalLegalMentions?: string | null;
  /** When set, replaces vatMention/latePaymentPenaltyText/additionalLegalMentions for this document. */
  overrideText?: string | null;
}) {
  const t = PDF_LABELS[lang];
  const hasPaymentInfo = iban || bic || otherPaymentInstructions;

  return (
    <View style={pdfStyles.footer} fixed>
      {hasPaymentInfo && (
        <Text>
          {t.paymentInfo} — {iban && `${t.iban}: ${iban}`}
          {iban && bic ? " · " : ""}
          {bic && `${t.bic}: ${bic}`}
          {otherPaymentInstructions && (iban || bic ? " · " : "")}
          {otherPaymentInstructions}
        </Text>
      )}
      {overrideText ? (
        <Text>{overrideText}</Text>
      ) : (
        <>
          <Text>{vatMention}</Text>
          <Text>{latePaymentPenaltyText}</Text>
          {additionalLegalMentions && <Text>{additionalLegalMentions}</Text>}
        </>
      )}
    </View>
  );
}
