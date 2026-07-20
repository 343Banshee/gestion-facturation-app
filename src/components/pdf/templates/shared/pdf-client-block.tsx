import { Text, View } from "@react-pdf/renderer";
import { pdfStyles } from "./pdf-styles";

export function PdfClientBlock({
  label,
  client,
}: {
  label: string;
  client: {
    name: string;
    addressLine1: string;
    addressLine2?: string | null;
    postalCode: string;
    city: string;
    country: string;
    siret?: string | null;
  };
}) {
  return (
    <View style={pdfStyles.clientBlock}>
      <Text style={pdfStyles.sectionLabel}>{label}</Text>
      <Text style={pdfStyles.clientName}>{client.name}</Text>
      <Text style={pdfStyles.muted}>{client.addressLine1}</Text>
      {client.addressLine2 && <Text style={pdfStyles.muted}>{client.addressLine2}</Text>}
      <Text style={pdfStyles.muted}>
        {client.postalCode} {client.city}, {client.country}
      </Text>
      {client.siret && <Text style={pdfStyles.muted}>SIRET : {client.siret}</Text>}
    </View>
  );
}
