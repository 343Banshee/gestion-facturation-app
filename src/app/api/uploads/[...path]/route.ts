import { NextResponse } from "next/server";
import { readStoredFile, IMAGE_MIME_TYPES } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  const key = segments.join("/");
  const extension = key.split(".").pop()?.toLowerCase() ?? "";
  const contentType = IMAGE_MIME_TYPES[extension];

  if (!contentType) {
    return NextResponse.json({ error: "Type de fichier non supporté" }, { status: 400 });
  }

  try {
    const buffer = await readStoredFile(key);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Fichier introuvable" }, { status: 404 });
  }
}
