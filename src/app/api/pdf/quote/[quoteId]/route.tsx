import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { resolveLogoDataUri } from "@/lib/storage";
import { QuotePdf } from "@/components/pdf/templates/quote-pdf";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ quoteId: string }> },
) {
  const { quoteId } = await params;

  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: {
      lines: { orderBy: { position: "asc" } },
      client: true,
      profile: true,
    },
  });

  if (!quote) {
    return NextResponse.json({ error: "Devis introuvable" }, { status: 404 });
  }

  const logoDataUri = await resolveLogoDataUri(quote.profile.logoKey);
  const buffer = await renderToBuffer(<QuotePdf quote={quote} logoDataUri={logoDataUri} />);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${quote.number}.pdf"`,
    },
  });
}
