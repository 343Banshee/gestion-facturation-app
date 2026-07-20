import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { getProfileBySlug } from "@/lib/actions/profiles.actions";
import { listQuotes } from "@/lib/actions/quotes.actions";
import { QuoteStatus } from "@/generated/prisma/enums";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/dates";
import { Button } from "@/components/ui/button";
import { QuoteStatusBadge } from "@/components/documents/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const STATUS_TABS: { value: QuoteStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Tous" },
  { value: QuoteStatus.DRAFT, label: "Brouillons" },
  { value: QuoteStatus.SENT, label: "Envoyés" },
  { value: QuoteStatus.ACCEPTED, label: "Acceptés" },
  { value: QuoteStatus.REJECTED, label: "Refusés" },
  { value: QuoteStatus.EXPIRED, label: "Expirés" },
  { value: QuoteStatus.CONVERTED, label: "Convertis" },
];

export default async function DevisPage({
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
    status && status in QuoteStatus ? (status as QuoteStatus) : undefined;
  const quotes = await listQuotes(profile.id, activeStatus);

  return (
    <div className="mx-auto max-w-5xl px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Devis</h1>
          <p className="text-muted-foreground">Suivi de tes devis en cours</p>
        </div>
        <Button nativeButton={false} render={<Link href={`/p/${profileSlug}/devis/new`} />}>
          <Plus className="h-4 w-4" />
          Nouveau devis
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-1 border-b pb-3">
        {STATUS_TABS.map((tab) => {
          const href =
            tab.value === "ALL"
              ? `/p/${profileSlug}/devis`
              : `/p/${profileSlug}/devis?status=${tab.value}`;
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

      {quotes.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
          Aucun devis dans cette catégorie.
        </div>
      ) : (
        <div className="rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numéro</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Émis le</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/p/${profileSlug}/devis/${quote.id}`}
                      className="hover:underline"
                    >
                      {quote.number}
                    </Link>
                  </TableCell>
                  <TableCell>{quote.client.name}</TableCell>
                  <TableCell>{formatDate(quote.issueDate)}</TableCell>
                  <TableCell>{formatMoney(quote.subtotalAmountCents)}</TableCell>
                  <TableCell>
                    <QuoteStatusBadge status={quote.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
