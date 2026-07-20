import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfileBySlug } from "@/lib/actions/profiles.actions";
import { getInvoiceWithRelations } from "@/lib/actions/invoices.actions";
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
import { InvoiceStatusBadge, OverdueBadge } from "@/components/documents/status-badge";
import { InvoiceStatusActions } from "@/components/invoices/invoice-status-actions";
import { PaymentDialog } from "@/components/invoices/payment-dialog";
import { DeletePaymentButton } from "@/components/invoices/delete-payment-button";
import { InvoiceStatus } from "@/generated/prisma/enums";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  BANK_TRANSFER: "Virement",
  CHECK: "Chèque",
  CASH: "Espèces",
  CARD: "Carte",
  OTHER: "Autre",
};

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ profileSlug: string; invoiceId: string }>;
}) {
  const { profileSlug, invoiceId } = await params;
  const profile = await getProfileBySlug(profileSlug);
  if (!profile) notFound();

  const invoice = await getInvoiceWithRelations(invoiceId);
  if (!invoice || invoice.profileId !== profile.id) notFound();

  const paidCents = invoice.payments.reduce((sum, p) => sum + p.amountCents, 0);
  const remainingCents = Math.max(invoice.subtotalAmountCents - paidCents, 0);
  const isOverdue =
    (invoice.status === InvoiceStatus.SENT ||
      invoice.status === InvoiceStatus.PARTIALLY_PAID) &&
    invoice.dueDate < new Date();

  return (
    <div className="mx-auto max-w-4xl px-8 py-8">
      <Link
        href={`/p/${profileSlug}/factures`}
        className="text-sm text-muted-foreground hover:underline"
      >
        ← Retour aux factures
      </Link>

      <div className="mt-2 mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{invoice.number}</h1>
            <InvoiceStatusBadge status={invoice.status} />
            {isOverdue && <OverdueBadge />}
          </div>
          <p className="text-muted-foreground">{invoice.client.name}</p>
          {invoice.sourceQuote && (
            <p className="text-sm text-muted-foreground">
              Issue du devis{" "}
              <Link
                href={`/p/${profileSlug}/devis/${invoice.sourceQuote.id}`}
                className="underline"
              >
                {invoice.sourceQuote.number}
              </Link>
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            nativeButton={false}
            render={
              <a href={`/api/pdf/invoice/${invoice.id}`} target="_blank" rel="noreferrer" />
            }
          >
            Télécharger le PDF
          </Button>
          {invoice.status !== InvoiceStatus.CANCELLED && (
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href={`/p/${profileSlug}/factures/${invoice.id}/edit`} />}
            >
              Modifier
            </Button>
          )}
        </div>
      </div>

      <div className="mb-6">
        <InvoiceStatusActions
          invoiceId={invoice.id}
          profileSlug={profileSlug}
          status={invoice.status}
        />
      </div>

      <Card className="mb-6">
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-4">
          <div>
            <p className="text-xs uppercase text-muted-foreground">Émise le</p>
            <p>{formatDate(invoice.issueDate, invoice.language)}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground">Échéance</p>
            <p>{formatDate(invoice.dueDate, invoice.language)}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground">Payé</p>
            <p>{formatMoney(paidCents)}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground">Reste dû</p>
            <p className="font-medium">{formatMoney(remainingCents)}</p>
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
            {invoice.lines.map((line) => (
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
            Total HT : {formatMoney(invoice.subtotalAmountCents)}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Encaissements</h2>
          {invoice.status !== InvoiceStatus.CANCELLED &&
            invoice.status !== InvoiceStatus.DRAFT && (
              <PaymentDialog
                invoiceId={invoice.id}
                profileSlug={profileSlug}
                remainingAmount={remainingCents / 100}
              />
            )}
        </div>
        {invoice.payments.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
            Aucun encaissement enregistré.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Moyen</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{formatDate(payment.paidAt)}</TableCell>
                    <TableCell>{PAYMENT_METHOD_LABELS[payment.method]}</TableCell>
                    <TableCell>{formatMoney(payment.amountCents)}</TableCell>
                    <TableCell>{payment.notes || "—"}</TableCell>
                    <TableCell>
                      <DeletePaymentButton
                        paymentId={payment.id}
                        invoiceId={invoice.id}
                        profileSlug={profileSlug}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {(invoice.notes || invoice.termsOverride) && (
        <Card>
          <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
            {invoice.notes && (
              <div>
                <p className="text-xs uppercase text-muted-foreground">Notes</p>
                <p className="whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}
            {invoice.termsOverride && (
              <div>
                <p className="text-xs uppercase text-muted-foreground">
                  Mentions spécifiques
                </p>
                <p className="whitespace-pre-wrap">{invoice.termsOverride}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
