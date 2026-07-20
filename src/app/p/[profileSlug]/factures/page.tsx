import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { getProfileBySlug } from "@/lib/actions/profiles.actions";
import { listInvoices } from "@/lib/actions/invoices.actions";
import { InvoiceStatus } from "@/generated/prisma/enums";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/dates";
import { Button } from "@/components/ui/button";
import { InvoiceStatusBadge, OverdueBadge } from "@/components/documents/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const STATUS_TABS: { value: InvoiceStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Toutes" },
  { value: InvoiceStatus.DRAFT, label: "Brouillons" },
  { value: InvoiceStatus.SENT, label: "Envoyées" },
  { value: InvoiceStatus.PARTIALLY_PAID, label: "Partiellement payées" },
  { value: InvoiceStatus.PAID, label: "Payées" },
  { value: InvoiceStatus.CANCELLED, label: "Annulées" },
];

export default async function FacturesPage({
  params,
  searchParams,
}: {
  params: Promise<{ profileSlug: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { profileSlug } = await params;
  const { status } = await searchParams;
  const profile = await getProfileBySlug(profileSlug);
  if (!profile) notFound();

  const activeStatus =
    status && status in InvoiceStatus ? (status as InvoiceStatus) : undefined;
  const invoices = await listInvoices(profile.id, activeStatus);
  const today = new Date();

  return (
    <div className="mx-auto max-w-5xl px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Factures</h1>
          <p className="text-muted-foreground">Suivi de tes factures</p>
        </div>
        <Button nativeButton={false} render={<Link href={`/p/${profileSlug}/factures/new`} />}>
          <Plus className="h-4 w-4" />
          Nouvelle facture
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-1 border-b pb-3">
        {STATUS_TABS.map((tab) => {
          const href =
            tab.value === "ALL"
              ? `/p/${profileSlug}/factures`
              : `/p/${profileSlug}/factures?status=${tab.value}`;
          const active = (activeStatus ?? "ALL") === tab.value;
          return (
            <Link
              key={tab.value}
              href={href}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {invoices.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
          Aucune facture dans cette catégorie.
        </div>
      ) : (
        <div className="rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numéro</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Échéance</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => {
                const paidCents = invoice.payments.reduce((s, p) => s + p.amountCents, 0);
                const isOverdue =
                  (invoice.status === InvoiceStatus.SENT ||
                    invoice.status === InvoiceStatus.PARTIALLY_PAID) &&
                  invoice.dueDate < today;
                return (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/p/${profileSlug}/factures/${invoice.id}`}
                        className="hover:underline"
                      >
                        {invoice.number}
                      </Link>
                    </TableCell>
                    <TableCell>{invoice.client.name}</TableCell>
                    <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                    <TableCell>
                      {formatMoney(paidCents)} / {formatMoney(invoice.subtotalAmountCents)}
                    </TableCell>
                    <TableCell className="flex flex-wrap gap-1">
                      <InvoiceStatusBadge status={invoice.status} />
                      {isOverdue && <OverdueBadge />}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
