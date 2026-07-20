import Link from "next/link";
import { ProfileForm } from "@/components/profiles/profile-form";
import { createProfile } from "@/lib/actions/profiles.actions";
import { DEFAULT_PROFILE_VALUES } from "@/lib/validations/profile.schema";

export default function NewProfilePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6">
        <Link href="/" className="text-sm text-muted-foreground hover:underline">
          ← Retour aux profils
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Nouveau profil
        </h1>
        <p className="text-muted-foreground">
          Un profil regroupe une identité de facturation complète : clients,
          catalogue, devis et factures indépendants.
        </p>
      </div>
      <ProfileForm
        defaultValues={DEFAULT_PROFILE_VALUES}
        onSubmit={createProfile}
        submitLabel="Créer le profil"
      />
    </main>
  );
}
