import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveFile } from "@/lib/storage";

export const runtime = "nodejs";

const ALLOWED_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/svg+xml": "svg",
  "image/webp": "webp",
};

export async function POST(req: Request) {
  const formData = await req.formData();
  const profileId = formData.get("profileId");
  const file = formData.get("file");

  if (typeof profileId !== "string" || !(file instanceof File)) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const extension = ALLOWED_TYPES[file.type];
  if (!extension) {
    return NextResponse.json({ error: "Format d'image non supporté" }, { status: 400 });
  }
  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: "Image trop lourde (max 2 Mo)" }, { status: 400 });
  }

  const profile = await prisma.profile.findUnique({ where: { id: profileId } });
  if (!profile) {
    return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
  }

  const key = `logos/${profileId}-${Date.now()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await saveFile(key, buffer);

  await prisma.profile.update({ where: { id: profileId }, data: { logoKey: key } });

  return NextResponse.json({ logoKey: key });
}
