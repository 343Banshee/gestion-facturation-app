"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  DocumentLineEditor,
  type CatalogueItem,
} from "@/components/documents/document-line-editor";
import { quoteFormSchema, type QuoteFormValues } from "@/lib/validations/quote.schema";

function isRedirectError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "digest" in err &&
    typeof (err as { digest: unknown }).digest === "string" &&
    (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

export function QuoteForm({
  defaultValues,
  onSubmit,
  submitLabel,
  clients,
  catalogueItems,
}: {
  defaultValues: QuoteFormValues;
  onSubmit: (values: QuoteFormValues) => Promise<void>;
  submitLabel: string;
  clients: { id: string; name: string }[];
  catalogueItems: CatalogueItem[];
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues,
  });

  const clientId = watch("clientId");
  const language = watch("language");
  const lines = watch("lines");

  const submit = handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (err) {
      if (isRedirectError(err)) throw err;
      toast.error("Une erreur est survenue", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <form onSubmit={submit} className="space-y-6">
      <Card>
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>
              Client <span className="text-destructive">*</span>
            </Label>
            <Select
              items={Object.fromEntries(clients.map((c) => [c.id, c.name]))}
              value={clientId}
              onValueChange={(v) => v && setValue("clientId", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir un client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.clientId && (
              <p className="text-sm text-destructive">{errors.clientId.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Langue du document</Label>
            <Select
              items={{ FR: "Français", EN: "English" }}
              value={language}
              onValueChange={(v) => v && setValue("language", v as "FR" | "EN")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FR">Français</SelectItem>
                <SelectItem value="EN">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="issueDate">Date d&apos;émission</Label>
            <Input id="issueDate" type="date" {...register("issueDate")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="validUntil">Valable jusqu&apos;au</Label>
            <Input id="validUntil" type="date" {...register("validUntil")} />
          </div>
        </CardContent>
      </Card>

      <DocumentLineEditor
        control={control}
        register={register}
        catalogueItems={catalogueItems}
        lineValues={lines}
        setValue={setValue}
      />
      {errors.lines && !Array.isArray(errors.lines) && (
        <p className="text-sm text-destructive">{errors.lines.message}</p>
      )}

      <Card>
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes (ex : acompte demandé)</Label>
            <Textarea id="notes" {...register("notes")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="termsOverride">
              Mentions spécifiques à ce devis (remplace les mentions par défaut du profil)
            </Label>
            <Textarea id="termsOverride" {...register("termsOverride")} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
