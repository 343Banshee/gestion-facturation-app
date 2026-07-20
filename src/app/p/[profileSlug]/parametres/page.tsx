import { notFound } from "next/navigation";
import { getProfileBySlug, updateProfile } from "@/lib/actions/profiles.actions";
import { ProfileForm } from "@/components/profiles/profile-form";
import type { ProfileFormValues } from "@/lib/validations/profile.schema";

export default async function ParametresPage({
  params,
}: {
  params: Promise<{ profileSlug: string }>;
}) {
  const { profileSlug } = await params;
  const profile = await getProfileBySlug(profileSlug);
  if (!profile) notFound();

  const defaultValues: ProfileFormValues = {
    name: profile.name,
    companyName: profile.companyName,
    addressLine1: profile.addressLine1,
    addressLine2: profile.addressLine2 ?? "",
    postalCode: profile.postalCode,
    city: profile.city,
    country: profile.country,
    siret: profile.siret,
    apeCode: profile.apeCode ?? "",
    email: profile.email,
    phone: profile.phone ?? "",
    iban: profile.iban ?? "",
    bic: profile.bic ?? "",
    otherPaymentInstructions: profile.otherPaymentInstructions ?? "",
    vatMention: profile.vatMention,
    latePaymentPenaltyText: profile.latePaymentPenaltyText,
    additionalLegalMentions: profile.additionalLegalMentions ?? "",
    defaultLanguage: profile.defaultLanguage,
    quoteNumberPrefix: profile.quoteNumberPrefix,
    invoiceNumberPrefix: profile.invoiceNumberPrefix,
    quoteValidityDays: profile.quoteValidityDays,
    defaultPaymentTermDays: profile.defaultPaymentTermDays,
    urssafPeriodicity: profile.urssafPeriodicity,
    urssafRatePresetKey: profile.urssafRatePresetKey ?? "",
    urssafCotisationRateBps: profile.urssafCotisationRateBps,
    versementLiberatoireEnabled: profile.versementLiberatoireEnabled,
    versementLiberatoireRateBps: profile.versementLiberatoireRateBps ?? undefined,
  };

  const profileId = profile.id;
  async function submitUpdate(values: ProfileFormValues) {
    "use server";
    await updateProfile(profileId, values);
  }

  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Paramètres du profil</h1>
      <p className="mb-6 text-muted-foreground">
        Identité de facturation, mentions légales et réglages de déclaration.
      </p>
      <ProfileForm
        defaultValues={defaultValues}
        onSubmit={submitUpdate}
        submitLabel="Enregistrer"
      />
    </div>
  );
}
