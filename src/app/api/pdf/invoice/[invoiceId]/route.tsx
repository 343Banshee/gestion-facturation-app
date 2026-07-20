import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { resolveLogoDataUri } from "@/lib/storage";
import { InvoicePdf } from "@/components/pdf/templates/invoice-pdf";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ invoiceId: string }> },
) {
  const { invoiceId } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      lines: { orderBy: { position: "asc" } },
      client: true,
      profile: true,
      sourceQuote: true,
    },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
  }

  const logoDataUri = await resolveLogoDataUri(invoice.profile.logoKey);
  const buffer = await renderToBuffer(<InvoicePdf invoice={invoice} logoDataUri={logoDataUri} />);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoice.number}.pdf"`,
    },
  });
}
