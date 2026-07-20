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
  clientFormSchema,
  type ClientFormValues,
} from "@/lib/validations/client.schema";

function isRedirectError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "digest" in err &&
    typeof (err as { digest: unknown }).digest === "string" &&
    (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

export function ClientForm({
  defaultValues,
  onSubmit,
  submitLabel,
}: {
  defaultValues: ClientFormValues;
  onSubmit: (values: ClientFormValues) => Promise<void>;
  submitLabel: string;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues,
  });

  const preferredLanguage = watch("preferredLanguage");

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
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">
              Nom / société <span className="text-destructive">*</span>
            </Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contactName">Nom du contact</Label>
            <Input id="contactName" {...register("contactName")} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="addressLine1">
              Adresse <span className="text-destructive">*</span>
            </Label>
            <Input id="addressLine1" {...register("addressLine1")} />
            {errors.addressLine1 && (
              <p className="text-sm text-destructive">{errors.addressLine1.message}</p>
            )}
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="addressLine2">Complément d&apos;adresse</Label>
            <Input id="addressLine2" {...register("addressLine2")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="postalCode">
              Code postal <span className="text-destructive">*</span>
            </Label>
            <Input id="postalCode" {...register("postalCode")} />
            {errors.postalCode && (
              <p className="text-sm text-destructive">{errors.postalCode.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="city">
              Ville <span className="text-destructive">*</span>
            </Label>
            <Input id="city" {...register("city")} />
            {errors.city && (
              <p className="text-sm text-destructive">{errors.city.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="country">Pays</Label>
            <Input id="country" {...register("country")} />
          </div>
          <div className="space-y-1.5">
            <Label>Langue préférée des documents</Label>
            <Select
              value={preferredLanguage}
              onValueChange={(v) => setValue("preferredLanguage", v as "FR" | "EN")}
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
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" {...register("phone")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="siret">SIRET</Label>
            <Input id="siret" {...register("siret")} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="notes">Notes internes</Label>
            <Textarea id="notes" {...register("notes")} />
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
