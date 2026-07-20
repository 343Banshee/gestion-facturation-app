import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfileBySlug } from "@/lib/actions/profiles.actions";
import { createServiceItem } from "@/lib/actions/service-items.actions";
import { ServiceItemForm } from "@/components/catalogue/service-item-form";
import { DEFAULT_SERVICE_ITEM_VALUES } from "@/lib/validations/service-item.schema";

export default async function NewServiceItemPage({
  params,
}: {
  params: Promise<{ profileSlug: string }>;
}) {
  const { profileSlug } = await params;
  const profile = await getProfileBySlug(profileSlug);
  if (!profile) notFound();

  const profileId = profile.id;
  async function submit(values: Parameters<typeof createServiceItem>[2]) {
    "use server";
    await createServiceItem(profileId, profileSlug, values);
  }

  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <Link
        href={`/p/${profileSlug}/catalogue`}
        className="text-sm text-muted-foreground hover:underline"
      >
        ← Retour au catalogue
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-semibold tracking-tight">
        Nouvelle prestation
      </h1>
      <ServiceItemForm
        defaultValues={DEFAULT_SERVICE_ITEM_VALUES}
        onSubmit={submit}
        submitLabel="Créer la prestation"
      />
    </div>
  );
}
