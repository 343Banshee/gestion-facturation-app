import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfileBySlug } from "@/lib/actions/profiles.actions";
import { getServiceItem, updateServiceItem } from "@/lib/actions/service-items.actions";
import { ServiceItemForm } from "@/components/catalogue/service-item-form";
import { fromCents } from "@/lib/money";
import type { ServiceItemFormValues } from "@/lib/validations/service-item.schema";

export default async function EditServiceItemPage({
  params,
}: {
  params: Promise<{ profileSlug: string; itemId: string }>;
}) {
  const { profileSlug, itemId } = await params;
  const profile = await getProfileBySlug(profileSlug);
  if (!profile) notFound();

  const item = await getServiceItem(itemId);
  if (!item || item.profileId !== profile.id) notFound();

  const defaultValues: ServiceItemFormValues = {
    name: item.name,
    description: item.description ?? "",
    unitPrice: fromCents(item.unitPriceCents),
    unit: item.unit,
    category: item.category ?? "",
  };

  async function submit(values: ServiceItemFormValues) {
    "use server";
    await updateServiceItem(itemId, profileSlug, values);
  }

  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <Link
        href={`/p/${profileSlug}/catalogue`}
        className="text-sm text-muted-foreground hover:underline"
      >
        ← Retour au catalogue
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-semibold tracking-tight">{item.name}</h1>
      <ServiceItemForm
        defaultValues={defaultValues}
        onSubmit={submit}
        submitLabel="Enregistrer"
      />
    </div>
  );
}
