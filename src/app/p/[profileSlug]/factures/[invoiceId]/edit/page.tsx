import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfileBySlug } from "@/lib/actions/profiles.actions";
import { listClients } from "@/lib/actions/clients.actions";
import { listServiceItems } from "@/lib/actions/service-items.actions";
import { getInvoiceWithRelations, updateInvoice } from "@/lib/actions/invoices.actions";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { fromCents } from "@/lib/money";
import { toDateInputValue } from "@/lib/dates";
import type { InvoiceFormValues } from "@/lib/validations/invoice.schema";

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ profileSlug: string; invoiceId: string }>;
}) {
  const { profileSlug, invoiceId } = await params;
  const profile = await getProfileBySlug(profileSlug);
  if (!profile) notFound();

  const invoice = await getInvoiceWithRelations(invoiceId);
  if (!invoice || invoice.profileId !== profile.id) notFound();

  const [clients, catalogueItems] = await Promise.all([
    listClients(profile.id),
    listServiceItems(profile.id),
  ]);

  const defaultValues: InvoiceFormValues = {
    clientId: invoice.clientId,
    issueDate: toDateInputValue(invoice.issueDate),
    dueDate: toDateInputValue(invoice.dueDate),
    language: invoice.language,
    notes: invoice.notes ?? "",
    termsOverride: invoice.termsOverride ?? "",
    lines: invoice.lines.map((line) => ({
      serviceItemId: line.serviceItemId ?? undefined,
      description: line.description,
      quantity: line.quantity,
      unitPrice: fromCents(line.unitPriceCents),
      unit: line.unit,
    })),
  };

  async function submit(values: InvoiceFormValues) {
    "use server";
    await updateInvoice(invoiceId, profileSlug, values);
  }

  return (
    <div className="mx-auto max-w-5xl px-8 py-8">
      <Link
        href={`/p/${profileSlug}/factures/${invoiceId}`}
        className="text-sm text-muted-foreground hover:underline"
      >
        ← Retour à la facture
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-semibold tracking-tight">
        Modifier {invoice.number}
      </h1>
      <InvoiceForm
        defaultValues={defaultValues}
        onSubmit={submit}
        submitLabel="Enregistrer"
        clients={clients}
        catalogueItems={catalogueItems}
      />
    </div>
  );
}
