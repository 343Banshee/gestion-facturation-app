import { redirect } from "next/navigation";

export default async function ProfileRootPage({
  params,
}: {
  params: Promise<{ profileSlug: string }>;
}) {
  const { profileSlug } = await params;
  redirect(`/p/${profileSlug}/dashboard`);
}
