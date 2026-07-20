import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfileBySlug } from "@/lib/actions/profiles.actions";
import { getClient, updateClient } from "@/lib/actions/clients.actions";
import { ClientForm } from "@/components/clients/client-form";
import type { ClientFormValues } from "@/lib/validations/client.schema";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ profileSlug: string; clientId: string }>;
}) {
  const { profileSlug, clientId } = await params;
  const profile = await getProfileBySlug(profileSlug);
  if (!profile) notFound();

  const client = await getClient(clientId);
  if (!client || client.profileId !== profile.id) notFound();

  const defaultValues: ClientFormValues = {
    name: client.name,
    contactName: client.contactName ?? "",
    addressLine1: client.addressLine1,
    addressLine2: client.addressLine2 ?? "",
    postalCode: client.postalCode,
    city: client.city,
    country: client.country,
    email: client.email ?? "",
    phone: client.phone ?? "",
    siret: client.siret ?? "",
    preferredLanguage: client.preferredLanguage,
    notes: client.notes ?? "",
  };

  async function submit(values: ClientFormValues) {
    "use server";
    await updateClient(clientId, profileSlug, values);
  }

  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <Link
        href={`/p/${profileSlug}/clients`}
        className="text-sm text-muted-foreground hover:underline"
      >
        ← Retour aux clients
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-semibold tracking-tight">{client.name}</h1>
      <ClientForm defaultValues={defaultValues} onSubmit={submit} submitLabel="Enregistrer" />
    </div>
  );
}
