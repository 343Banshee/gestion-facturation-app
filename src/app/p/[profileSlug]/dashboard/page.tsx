import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfileBySlug } from "@/lib/actions/profiles.actions";
import { getDashboardData } from "@/lib/actions/dashboard.actions";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/dates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { OverdueBadge } from "@/components/documents/status-badge";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ profileSlug: string }>;
}) {
  const { profileSlug } = await params;
  const profile = await getProfileBySlug(profileSlug);
  if (!profile) notFound();

  const data = await getDashboardData(profile.id);

  return (
    <div className="mx-auto max-w-6xl px-8 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Tableau de bord</h1>
      <p className="text-muted-foreground">Bienvenue, {profile.companyName}.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Devis en cours"
          value={String(data.openQuotesCount)}
          subLabel={formatMoney(data.openQuotesAmountCents)}
        />
        <KpiCard
          label="Factures impayées"
          value={String(data.unpaidInvoices.length)}
          subLabel={formatMoney(data.totalUnpaidCents)}
        />
        <KpiCard
          label="Dont en retard"
          value={String(data.unpaidInvoices.filter((i) => i.isOverdue).length)}
          subLabel={formatMoney(data.totalOverdueCents)}
          tone={data.totalOverdueCents > 0 ? "warning" : "default"}
        />
        <KpiCard
          label="Encaissé cette année"
          value={formatMoney(data.ytdCollectedCents)}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Chiffre d&apos;affaires — 6 derniers mois</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={data.monthlyRevenue} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Factures impayées</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.unpaidInvoices.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune facture impayée.</p>
            ) : (
              data.unpaidInvoices.slice(0, 6).map((invoice) => (
                <Link
                  key={invoice.id}
                  href={`/p/${profileSlug}/factures/${invoice.id}`}
                  className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-accent"
                >
                  <div>
                    <p className="font-medium">{invoice.number}</p>
                    <p className="text-xs text-muted-foreground">
                      {invoice.clientName} · échéance {formatDate(invoice.dueDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{formatMoney(invoice.remainingCents)}</span>
                    {invoice.isOverdue && <OverdueBadge />}
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
