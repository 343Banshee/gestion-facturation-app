import { prisma } from "@/lib/prisma";

export type UrssafDeclaration = {
  periodStart: Date;
  periodEnd: Date;
  payments: {
    id: string;
    amountCents: number;
    paidAt: Date;
    invoiceNumber: string;
    clientName: string;
  }[];
  totalEncaisseCents: number;
  totalFactureCents: number;
  cotisationsCents: number;
  versementLiberatoireCents: number;
  totalACharge: number;
};

export async function computeUrssafDeclaration(
  profileId: string,
  periodStart: Date,
  periodEnd: Date,
): Promise<UrssafDeclaration> {
  const profile = await prisma.profile.findUniqueOrThrow({ where: { id: profileId } });

  const payments = await prisma.payment.findMany({
    where: {
      invoice: { profileId },
      paidAt: { gte: periodStart, lt: periodEnd },
    },
    include: { invoice: { select: { number: true, client: { select: { name: true } } } } },
    orderBy: { paidAt: "asc" },
  });

  const invoicedInPeriod = await prisma.invoice.findMany({
    where: {
      profileId,
      issueDate: { gte: periodStart, lt: periodEnd },
      status: { not: "CANCELLED" },
    },
    select: { subtotalAmountCents: true },
  });

  const totalEncaisseCents = payments.reduce((sum, p) => sum + p.amountCents, 0);
  const totalFactureCents = invoicedInPeriod.reduce((sum, i) => sum + i.subtotalAmountCents, 0);

  const cotisationsCents = Math.round(
    (totalEncaisseCents * profile.urssafCotisationRateBps) / 10_000,
  );
  const versementLiberatoireCents = profile.versementLiberatoireEnabled
    ? Math.round((totalEncaisseCents * (profile.versementLiberatoireRateBps ?? 0)) / 10_000)
    : 0;

  return {
    periodStart,
    periodEnd,
    payments: payments.map((p) => ({
      id: p.id,
      amountCents: p.amountCents,
      paidAt: p.paidAt,
      invoiceNumber: p.invoice.number,
      clientName: p.invoice.client.name,
    })),
    totalEncaisseCents,
    totalFactureCents,
    cotisationsCents,
    versementLiberatoireCents,
    totalACharge: cotisationsCents + versementLiberatoireCents,
  };
}
