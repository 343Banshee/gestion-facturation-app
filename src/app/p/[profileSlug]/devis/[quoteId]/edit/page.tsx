import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfileBySlug } from "@/lib/actions/profiles.actions";
import { listClients } from "@/lib/actions/clients.actions";
import { listServiceItems } from "@/lib/actions/service-items.actions";
import { getQuoteWithRelations, updateQuote } from "@/lib/actions/quotes.actions";
import { QuoteForm } from "@/components/quotes/quote-form";
import { fromCents } from "@/lib/money";
import { toDateInputValue } from "@/lib/dates";
import type { QuoteFormValues } from "@/lib/validations/quote.schema";

export default async function EditQuotePage({
  params,
}: {
  params: Promise<{ profileSlug: string; quoteId: string }>;
}) {
  const { profileSlug, quoteId } = await params;
  const profile = await getProfileBySlug(profileSlug);
  if (!profile) notFound();

  const quote = await getQuoteWithRelations(quoteId);
  if (!quote || quote.profileId !== profile.id) notFound();

  const [clients, catalogueItems] = await Promise.all([
    listClients(profile.id),
    listServiceItems(profile.id),
  ]);

  const defaultValues: QuoteFormValues = {
    clientId: quote.clientId,
    issueDate: toDateInputValue(quote.issueDate),
    validUntil: toDateInputValue(quote.validUntil),
    language: quote.language,
    notes: quote.notes ?? "",
    termsOverride: quote.termsOverride ?? "",
    lines: quote.lines.map((line) => ({
      serviceItemId: line.serviceItemId ?? undefined,
      description: line.description,
      quantity: line.quantity,
      unitPrice: fromCents(line.unitPriceCents),
      unit: line.unit,
    })),
  };

  async function submit(values: QuoteFormValues) {
    "use server";
    await updateQuote(quoteId, profileSlug, values);
  }

  return (
    <div className="mx-auto max-w-5xl px-8 py-8">
      <Link
        href={`/p/${profileSlug}/devis/${quoteId}`}
        className="text-sm text-muted-foreground hover:underline"
      >
        ← Retour au devis
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-semibold tracking-tight">
        Modifier {quote.number}
      </h1>
      <QuoteForm
        defaultValues={defaultValues}
        onSubmit={submit}
        submitLabel="Enregistrer"
        clients={clients}
        catalogueItems={catalogueItems}
      />
    </div>
  );
}
