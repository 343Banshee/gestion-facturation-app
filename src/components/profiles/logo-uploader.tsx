"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LogoUploader({
  profileId,
  currentLogoKey,
}: {
  profileId: string;
  currentLogoKey: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(
    currentLogoKey ? `/api/uploads/${currentLogoKey}` : null,
  );
  const router = useRouter();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profileId", profileId);
    formData.append("file", file);

    startTransition(async () => {
      const res = await fetch("/api/uploads/logo", { method: "POST", body: formData });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error("Échec de l'envoi du logo", { description: body.error });
        return;
      }
      setPreview(URL.createObjectURL(file));
      toast.success("Logo mis à jour");
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logo</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border bg-muted">
          {preview ? (
            <Image src={preview} alt="Logo" width={64} height={64} className="object-contain" unoptimized />
          ) : (
            <span className="text-xs text-muted-foreground">Aucun</span>
          )}
        </div>
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            {isPending ? "Envoi..." : "Changer le logo"}
          </Button>
          <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, SVG ou WEBP, 2 Mo max.</p>
        </div>
      </CardContent>
    </Card>
  );
}
