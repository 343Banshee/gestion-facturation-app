"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  serviceItemFormSchema,
  type ServiceItemFormValues,
} from "@/lib/validations/service-item.schema";

function isRedirectError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "digest" in err &&
    typeof (err as { digest: unknown }).digest === "string" &&
    (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

export function ServiceItemForm({
  defaultValues,
  onSubmit,
  submitLabel,
}: {
  defaultValues: ServiceItemFormValues;
  onSubmit: (values: ServiceItemFormValues) => Promise<void>;
  submitLabel: string;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ServiceItemFormValues>({
    resolver: zodResolver(serviceItemFormSchema),
    defaultValues,
  });

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
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="name">
              Nom <span className="text-destructive">*</span>
            </Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="unitPrice">
              Prix unitaire HT (€) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="unitPrice"
              type="number"
              step="0.01"
              {...register("unitPrice", { valueAsNumber: true })}
            />
            {errors.unitPrice && (
              <p className="text-sm text-destructive">{errors.unitPrice.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="unit">
              Unité <span className="text-destructive">*</span>
            </Label>
            <Input id="unit" placeholder="heure, jour, forfait..." {...register("unit")} />
            {errors.unit && (
              <p className="text-sm text-destructive">{errors.unit.message}</p>
            )}
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="category">Catégorie</Label>
            <Input id="category" {...register("category")} />
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
