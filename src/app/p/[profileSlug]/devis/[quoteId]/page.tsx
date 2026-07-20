import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfileBySlug } from "@/lib/actions/profiles.actions";
import { getQuoteWithRelations } from "@/lib/actions/quotes.actions";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/dates";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { QuoteStatusBadge } from "@/components/documents/status-badge";
import { QuoteStatusActions } from "@/components/quotes/quote-status-actions";
import { QuoteStatus } from "@/generated/prisma/enums";

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ profileSlug: string; quoteId: string }>;
}) {
  const { profileSlug, quoteId } = await params;
  const profile = await getProfileBySlug(profileSlug);
  if (!profile) notFound();

  const quote = await getQuoteWithRelations(quoteId);
  if (!quote || quote.profileId !== profile.id) notFound();

  return (
    <div className="mx-auto max-w-4xl px-8 py-8">
      <Link
        href={`/p/${profileSlug}/devis`}
        className="text-sm text-muted-foreground hover:underline"
      >
        ← Retour aux devis
      </Link>

      <div className="mt-2 mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{quote.number}</h1>
            <QuoteStatusBadge status={quote.status} />
          </div>
          <p className="text-muted-foreground">{quote.client.name}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            nativeButton={false}
            render={<a href={`/api/pdf/quote/${quote.id}`} target="_blank" rel="noreferrer" />}
          >
            Télécharger le PDF
          </Button>
          {quote.status !== QuoteStatus.CONVERTED && (
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href={`/p/${profileSlug}/devis/${quote.id}/edit`} />}
            >
              Modifier
            </Button>
          )}
        </div>
      </div>

      <div className="mb-6">
        <QuoteStatusActions
          quoteId={quote.id}
          profileSlug={profileSlug}
          status={quote.status}
          hasConvertedInvoice={Boolean(quote.convertedInvoiceId)}
        />
        {quote.convertedInvoice && (
          <p className="mt-2 text-sm text-muted-foreground">
            Converti en facture{" "}
            <Link
              href={`/p/${profileSlug}/factures/${quote.convertedInvoice.id}`}
              className="underline"
            >
              {quote.convertedInvoice.number}
            </Link>
          </p>
        )}
      </div>

      <Card className="mb-6">
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase text-muted-foreground">Émis le</p>
            <p>{formatDate(quote.issueDate, quote.language)}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground">Valable jusqu&apos;au</p>
            <p>{formatDate(quote.validUntil, quote.language)}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground">Langue</p>
            <p>{quote.language === "FR" ? "Français" : "English"}</p>
          </div>
        </CardContent>
      </Card>

      <div className="mb-6 overflow-x-auto rounded-2xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Qté</TableHead>
              <TableHead>Unité</TableHead>
              <TableHead>Prix unit.</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quote.lines.map((line) => (
              <TableRow key={line.id}>
                <TableCell>{line.description}</TableCell>
                <TableCell>{line.quantity}</TableCell>
                <TableCell>{line.unit}</TableCell>
                <TableCell>{formatMoney(line.unitPriceCents)}</TableCell>
                <TableCell className="text-right">{formatMoney(line.lineTotalCents)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex justify-end border-t p-4">
          <p className="text-lg font-semibold">
            Total HT : {formatMoney(quote.subtotalAmountCents)}
          </p>
        </div>
      </div>

      {(quote.notes || quote.termsOverride) && (
        <Card>
          <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
            {quote.notes && (
              <div>
                <p className="text-xs uppercase text-muted-foreground">Notes</p>
                <p className="whitespace-pre-wrap">{quote.notes}</p>
              </div>
            )}
            {quote.termsOverride && (
              <div>
                <p className="text-xs uppercase text-muted-foreground">
                  Mentions spécifiques
                </p>
                <p className="whitespace-pre-wrap">{quote.termsOverride}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
