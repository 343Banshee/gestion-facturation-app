import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfileBySlug } from "@/lib/actions/profiles.actions";
import { listClients } from "@/lib/actions/clients.actions";
import { listServiceItems } from "@/lib/actions/service-items.actions";
import { createInvoice } from "@/lib/actions/invoices.actions";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { EMPTY_LINE } from "@/lib/validations/quote.schema";
import type { InvoiceFormValues } from "@/lib/validations/invoice.schema";
import { addDaysToToday, toDateInputValue } from "@/lib/dates";

export default async function NewInvoicePage({
  params,
}: {
  params: Promise<{ profileSlug: string }>;
}) {
  const { profileSlug } = await params;
  const profile = await getProfileBySlug(profileSlug);
  if (!profile) notFound();

  const [clients, catalogueItems] = await Promise.all([
    listClients(profile.id),
    listServiceItems(profile.id),
  ]);

  const defaultValues: InvoiceFormValues = {
    clientId: "",
    issueDate: toDateInputValue(new Date()),
    dueDate: toDateInputValue(addDaysToToday(profile.defaultPaymentTermDays)),
    language: profile.defaultLanguage,
    notes: "",
    termsOverride: "",
    lines: [EMPTY_LINE],
  };

  const profileId = profile.id;
  async function submit(values: InvoiceFormValues) {
    "use server";
    await createInvoice(profileId, profileSlug, values);
  }

  return (
    <div className="mx-auto max-w-5xl px-8 py-8">
      <Link
        href={`/p/${profileSlug}/factures`}
        className="text-sm text-muted-foreground hover:underline"
      >
        ← Retour aux factures
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-semibold tracking-tight">Nouvelle facture</h1>
      <InvoiceForm
        defaultValues={defaultValues}
        onSubmit={submit}
        submitLabel="Créer la facture"
        clients={clients}
        catalogueItems={catalogueItems}
      />
    </div>
  );
}
