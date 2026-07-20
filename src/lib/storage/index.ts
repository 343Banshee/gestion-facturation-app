import { mkdir, writeFile, readFile, unlink } from "node:fs/promises";
import path from "node:path";

const UPLOADS_ROOT = path.join(process.cwd(), "data", "uploads");

export const IMAGE_MIME_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  svg: "image/svg+xml",
  webp: "image/webp",
};

function resolveSafePath(key: string): string {
  const normalized = path.normalize(key).replace(/^(\.\.[/\\])+/, "");
  return path.join(UPLOADS_ROOT, normalized);
}

export async function saveFile(key: string, buffer: Buffer): Promise<void> {
  const filePath = resolveSafePath(key);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, buffer);
}

export async function readStoredFile(key: string): Promise<Buffer> {
  return readFile(resolveSafePath(key));
}

export async function deleteStoredFile(key: string): Promise<void> {
  await unlink(resolveSafePath(key)).catch(() => {});
}

export async function resolveLogoDataUri(logoKey: string | null): Promise<string | null> {
  if (!logoKey) return null;
  const extension = logoKey.split(".").pop()?.toLowerCase() ?? "";
  const mime = IMAGE_MIME_TYPES[extension];
  if (!mime) return null;
  try {
    const buffer = await readStoredFile(logoKey);
    return `data:${mime};base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}
