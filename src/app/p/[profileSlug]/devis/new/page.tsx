import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfileBySlug } from "@/lib/actions/profiles.actions";
import { listClients } from "@/lib/actions/clients.actions";
import { listServiceItems } from "@/lib/actions/service-items.actions";
import { createQuote } from "@/lib/actions/quotes.actions";
import { QuoteForm } from "@/components/quotes/quote-form";
import { EMPTY_LINE, type QuoteFormValues } from "@/lib/validations/quote.schema";
import { addDaysToToday, toDateInputValue } from "@/lib/dates";

export default async function NewQuotePage({
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

  const defaultValues: QuoteFormValues = {
    clientId: "",
    issueDate: toDateInputValue(new Date()),
    validUntil: toDateInputValue(addDaysToToday(profile.quoteValidityDays)),
    language: profile.defaultLanguage,
    notes: "",
    termsOverride: "",
    lines: [EMPTY_LINE],
  };

  const profileId = profile.id;
  async function submit(values: QuoteFormValues) {
    "use server";
    await createQuote(profileId, profileSlug, values);
  }

  return (
    <div className="mx-auto max-w-5xl px-8 py-8">
      <Link
        href={`/p/${profileSlug}/devis`}
        className="text-sm text-muted-foreground hover:underline"
      >
        ← Retour aux devis
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-semibold tracking-tight">Nouveau devis</h1>
      <QuoteForm
        defaultValues={defaultValues}
        onSubmit={submit}
        submitLabel="Créer le devis"
        clients={clients}
        catalogueItems={catalogueItems}
      />
    </div>
  );
}
