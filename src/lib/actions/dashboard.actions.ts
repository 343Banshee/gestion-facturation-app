import { format, startOfMonth, subMonths } from "date-fns";
import { prisma } from "@/lib/prisma";
import { QuoteStatus, InvoiceStatus } from "@/generated/prisma/enums";

export type DashboardData = {
  quoteStats: { status: QuoteStatus; count: number; amountCents: number }[];
  openQuotesCount: number;
  openQuotesAmountCents: number;
  unpaidInvoices: {
    id: string;
    number: string;
    clientName: string;
    dueDate: Date;
    remainingCents: number;
    isOverdue: boolean;
  }[];
  totalUnpaidCents: number;
  totalOverdueCents: number;
  monthlyRevenue: { month: string; label: string; invoicedCents: number; collectedCents: number }[];
  ytdCollectedCents: number;
};

const OPEN_QUOTE_STATUSES: QuoteStatus[] = [
  QuoteStatus.DRAFT,
  QuoteStatus.SENT,
  QuoteStatus.ACCEPTED,
];

export async function getDashboardData(profileId: string): Promise<DashboardData> {
  const [quotes, invoices] = await Promise.all([
    prisma.quote.findMany({
      where: { profileId },
      select: { status: true, subtotalAmountCents: true },
    }),
    prisma.invoice.findMany({
      where: { profileId, status: { not: InvoiceStatus.CANCELLED } },
      include: { client: true, payments: true },
    }),
  ]);

  const quoteStatsMap = new Map<QuoteStatus, { count: number; amountCents: number }>();
  for (const quote of quotes) {
    const entry = quoteStatsMap.get(quote.status) ?? { count: 0, amountCents: 0 };
    entry.count += 1;
    entry.amountCents += quote.subtotalAmountCents;
    quoteStatsMap.set(quote.status, entry);
  }
  const quoteStats = Array.from(quoteStatsMap.entries()).map(([status, v]) => ({
    status,
    ...v,
  }));

  const openQuotes = quotes.filter((q) => OPEN_QUOTE_STATUSES.includes(q.status));
  const openQuotesCount = openQuotes.length;
  const openQuotesAmountCents = openQuotes.reduce((sum, q) => sum + q.subtotalAmountCents, 0);

  const today = new Date();
  const unpaidInvoices = invoices
    .filter(
      (inv) => inv.status === InvoiceStatus.SENT || inv.status === InvoiceStatus.PARTIALLY_PAID,
    )
    .map((inv) => {
      const paidCents = inv.payments.reduce((s, p) => s + p.amountCents, 0);
      return {
        id: inv.id,
        number: inv.number,
        clientName: inv.client.name,
        dueDate: inv.dueDate,
        remainingCents: inv.subtotalAmountCents - paidCents,
        isOverdue: inv.dueDate < today,
      };
    })
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  const totalUnpaidCents = unpaidInvoices.reduce((s, i) => s + i.remainingCents, 0);
  const totalOverdueCents = unpaidInvoices
    .filter((i) => i.isOverdue)
    .reduce((s, i) => s + i.remainingCents, 0);

  const months = Array.from({ length: 6 }, (_, i) =>
    startOfMonth(subMonths(today, 5 - i)),
  );
  const monthlyRevenue = months.map((monthStart) => {
    const key = format(monthStart, "yyyy-MM");
    return { month: key, label: format(monthStart, "MMM yy"), invoicedCents: 0, collectedCents: 0 };
  });
  const bucketByKey = new Map(monthlyRevenue.map((b) => [b.month, b]));

  for (const inv of invoices) {
    const key = format(inv.issueDate, "yyyy-MM");
    const bucket = bucketByKey.get(key);
    if (bucket) bucket.invoicedCents += inv.subtotalAmountCents;

    for (const payment of inv.payments) {
      const paidKey = format(payment.paidAt, "yyyy-MM");
      const paidBucket = bucketByKey.get(paidKey);
      if (paidBucket) paidBucket.collectedCents += payment.amountCents;
    }
  }

  const yearStart = new Date(today.getFullYear(), 0, 1);
  const ytdCollectedCents = invoices.reduce((sum, inv) => {
    return (
      sum +
      inv.payments
        .filter((p) => p.paidAt >= yearStart)
        .reduce((s, p) => s + p.amountCents, 0)
    );
  }, 0);

  return {
    quoteStats,
    openQuotesCount,
    openQuotesAmountCents,
    unpaidInvoices,
    totalUnpaidCents,
    totalOverdueCents,
    monthlyRevenue,
    ytdCollectedCents,
  };
}
