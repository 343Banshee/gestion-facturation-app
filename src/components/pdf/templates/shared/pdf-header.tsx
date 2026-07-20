import { Text, View, Image } from "@react-pdf/renderer";
import { pdfStyles } from "./pdf-styles";
import { formatDate } from "@/lib/dates";
import type { PdfLang } from "@/components/pdf/i18n/labels";
import { PDF_LABELS } from "@/components/pdf/i18n/labels";

export function PdfHeader({
  lang,
  documentTitle,
  number,
  issueDate,
  secondaryDateLabel,
  secondaryDate,
  logoUrl,
  issuer,
}: {
  lang: PdfLang;
  documentTitle: string;
  number: string;
  issueDate: Date;
  secondaryDateLabel: string;
  secondaryDate: Date;
  logoUrl?: string | null;
  issuer: {
    companyName: string;
    addressLine1: string;
    addressLine2?: string | null;
    postalCode: string;
    city: string;
    country: string;
    siret: string;
    email: string;
    phone?: string | null;
  };
}) {
  const t = PDF_LABELS[lang];

  return (
    <View style={pdfStyles.headerRow}>
      <View style={pdfStyles.issuerBlock}>
        {logoUrl && <Image src={logoUrl} style={pdfStyles.logo} />}
        <Text style={pdfStyles.issuerName}>{issuer.companyName}</Text>
        <Text style={pdfStyles.muted}>{issuer.addressLine1}</Text>
        {issuer.addressLine2 && <Text style={pdfStyles.muted}>{issuer.addressLine2}</Text>}
        <Text style={pdfStyles.muted}>
          {issuer.postalCode} {issuer.city}, {issuer.country}
        </Text>
        <Text style={pdfStyles.muted}>
          {t.siret} : {issuer.siret}
        </Text>
        <Text style={pdfStyles.muted}>{issuer.email}</Text>
        {issuer.phone && <Text style={pdfStyles.muted}>{issuer.phone}</Text>}
      </View>
      <View style={pdfStyles.titleBlock}>
        <Text style={pdfStyles.title}>{documentTitle}</Text>
        <View style={pdfStyles.metaRow}>
          <Text style={pdfStyles.metaLabel}>{t.number}</Text>
          <Text>{number}</Text>
        </View>
        <View style={pdfStyles.metaRow}>
          <Text style={pdfStyles.metaLabel}>{t.issueDate}</Text>
          <Text>{formatDate(issueDate, lang)}</Text>
        </View>
        <View style={pdfStyles.metaRow}>
          <Text style={pdfStyles.metaLabel}>{secondaryDateLabel}</Text>
          <Text>{formatDate(secondaryDate, lang)}</Text>
        </View>
      </View>
    </View>
  );
}
