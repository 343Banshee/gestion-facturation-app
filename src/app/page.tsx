import Link from "next/link";
import { Plus } from "lucide-react";
import { listProfiles } from "@/lib/actions/profiles.actions";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

export default async function Home() {
  const profiles = await listProfiles();

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          Qui travaille aujourd&apos;hui ?
        </h1>
        <p className="mt-2 text-muted-foreground">
          Choisis un profil pour accéder à ses clients, devis et factures.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
        {profiles.map((profile) => (
          <Link
            key={profile.id}
            href={`/p/${profile.slug}`}
            className="group flex flex-col items-center gap-3 rounded-2xl p-4 transition-colors hover:bg-accent"
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-2xl font-medium text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
              {initials(profile.name)}
            </div>
            <div className="text-center">
              <p className="font-medium">{profile.name}</p>
              <p className="text-sm text-muted-foreground">{profile.companyName}</p>
            </div>
          </Link>
        ))}

        <Link
          href="/profiles/new"
          className="group flex flex-col items-center gap-3 rounded-2xl p-4 transition-colors hover:bg-accent"
        >
          <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/40 text-muted-foreground transition-colors group-hover:border-foreground/60 group-hover:text-foreground">
            <Plus className="h-8 w-8" />
          </div>
          <div className="text-center">
            <p className="font-medium">Nouveau profil</p>
            <p className="text-sm text-muted-foreground">Créer</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
