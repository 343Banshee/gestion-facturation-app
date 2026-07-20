import { notFound } from "next/navigation";
import { getProfileBySlug } from "@/lib/actions/profiles.actions";
import { Sidebar } from "@/components/layout/sidebar";

export default async function ProfileLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ profileSlug: string }>;
}) {
  const { profileSlug } = await params;
  const profile = await getProfileBySlug(profileSlug);

  if (!profile) {
    notFound();
  }

  return (
    <div className="flex flex-1">
      <Sidebar profileSlug={profile.slug} profileName={profile.name} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
