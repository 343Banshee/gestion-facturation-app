import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfileBySlug } from "@/lib/actions/profiles.actions";
import { createClient } from "@/lib/actions/clients.actions";
import { ClientForm } from "@/components/clients/client-form";
import { DEFAULT_CLIENT_VALUES } from "@/lib/validations/client.schema";

export default async function NewClientPage({
  params,
}: {
  params: Promise<{ profileSlug: string }>;
}) {
  const { profileSlug } = await params;
  const profile = await getProfileBySlug(profileSlug);
  if (!profile) notFound();

  const profileId = profile.id;
  async function submit(values: Parameters<typeof createClient>[2]) {
    "use server";
    await createClient(profileId, profileSlug, values);
  }

  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <Link
        href={`/p/${profileSlug}/clients`}
        className="text-sm text-muted-foreground hover:underline"
      >
        ← Retour aux clients
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-semibold tracking-tight">Nouveau client</h1>
      <ClientForm
        defaultValues={DEFAULT_CLIENT_VALUES}
        onSubmit={submit}
        submitLabel="Créer le client"
      />
    </div>
  );
}
