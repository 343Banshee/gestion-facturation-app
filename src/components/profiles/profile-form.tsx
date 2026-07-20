"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  profileFormSchema,
  URSSAF_RATE_PRESETS,
  type ProfileFormValues,
} from "@/lib/validations/profile.schema";

type Field = {
  label: string;
  id: keyof ProfileFormValues;
  placeholder?: string;
  optional?: boolean;
  number?: boolean;
};

function TextField({
  field,
  register,
  error,
  textarea,
}: {
  field: Field;
  register: ReturnType<typeof useForm<ProfileFormValues>>["register"];
  error?: string;
  textarea?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={field.id}>
        {field.label}
        {!field.optional && <span className="text-destructive"> *</span>}
      </Label>
      {textarea ? (
        <Textarea id={field.id} placeholder={field.placeholder} {...register(field.id)} />
      ) : (
        <Input
          id={field.id}
          type={field.number ? "number" : "text"}
          placeholder={field.placeholder}
          {...register(field.id, field.number ? { valueAsNumber: true } : undefined)}
        />
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function ProfileForm({
  defaultValues,
  onSubmit,
  submitLabel,
}: {
  defaultValues: ProfileFormValues;
  onSubmit: (values: ProfileFormValues) => Promise<void>;
  submitLabel: string;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
  });

  const versementLiberatoireEnabled = watch("versementLiberatoireEnabled");
  const defaultLanguage = watch("defaultLanguage");
  const urssafPeriodicity = watch("urssafPeriodicity");

  const submit = handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (err) {
      const isRedirect =
        typeof err === "object" &&
        err !== null &&
        "digest" in err &&
        typeof err.digest === "string" &&
        err.digest.startsWith("NEXT_REDIRECT");
      if (isRedirect) throw err;
      toast.error("Une erreur est survenue", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  function applyPreset(key: string | null) {
    const preset = URSSAF_RATE_PRESETS.find((p) => p.key === key);
    if (!preset) return;
    setValue("urssafRatePresetKey", preset.key);
    setValue("urssafCotisationRateBps", preset.cotisationRateBps);
    setValue("versementLiberatoireRateBps", preset.versementLiberatoireRateBps);
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <Tabs defaultValue="identite" className="w-full">
        <TabsList>
          <TabsTrigger value="identite">Identité</TabsTrigger>
          <TabsTrigger value="paiement">Paiement &amp; mentions</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="urssaf">URSSAF</TabsTrigger>
        </TabsList>

        <TabsContent value="identite" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profil</CardTitle>
              <CardDescription>
                Le nom du profil sert uniquement en interne pour le distinguer (ex.
                &laquo;&nbsp;Dev Web&nbsp;&raquo;, &laquo;&nbsp;Conseil&nbsp;&raquo;).
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <TextField
                field={{ label: "Nom du profil", id: "name", placeholder: "Dev Web" }}
                register={register}
                error={errors.name?.message}
              />
              <div className="space-y-1.5">
                <Label>Langue par défaut des documents</Label>
                <Select
                  value={defaultLanguage}
                  onValueChange={(v) => setValue("defaultLanguage", v as "FR" | "EN")}
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Identité de facturation</CardTitle>
              <CardDescription>
                Ces informations apparaissent en émetteur sur tes devis et factures.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <TextField
                field={{ label: "Nom / raison sociale", id: "companyName" }}
                register={register}
                error={errors.companyName?.message}
              />
              <TextField
                field={{ label: "SIRET", id: "siret" }}
                register={register}
                error={errors.siret?.message}
              />
              <TextField
                field={{ label: "Adresse", id: "addressLine1" }}
                register={register}
                error={errors.addressLine1?.message}
              />
              <TextField
                field={{ label: "Complément d'adresse", id: "addressLine2", optional: true }}
                register={register}
              />
              <TextField
                field={{ label: "Code postal", id: "postalCode" }}
                register={register}
                error={errors.postalCode?.message}
              />
              <TextField
                field={{ label: "Ville", id: "city" }}
                register={register}
                error={errors.city?.message}
              />
              <TextField field={{ label: "Pays", id: "country" }} register={register} />
              <TextField
                field={{ label: "Code APE/NAF", id: "apeCode", optional: true }}
                register={register}
              />
              <TextField
                field={{ label: "Email", id: "email" }}
                register={register}
                error={errors.email?.message}
              />
              <TextField
                field={{ label: "Téléphone", id: "phone", optional: true }}
                register={register}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paiement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Coordonnées de paiement</CardTitle>
              <CardDescription>
                Affichées sur les factures pour indiquer comment être payé.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <TextField field={{ label: "IBAN", id: "iban", optional: true }} register={register} />
              <TextField field={{ label: "BIC", id: "bic", optional: true }} register={register} />
              <div className="sm:col-span-2">
                <TextField
                  field={{
                    label: "Autres instructions de paiement",
                    id: "otherPaymentInstructions",
                    optional: true,
                    placeholder: "Ex : PayPal, Wise, chèque à l'ordre de...",
                  }}
                  register={register}
                  textarea
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mentions légales</CardTitle>
              <CardDescription>Pré-remplies pour la franchise en base de TVA, modifiables.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <TextField
                field={{ label: "Mention TVA", id: "vatMention" }}
                register={register}
                error={errors.vatMention?.message}
                textarea
              />
              <TextField
                field={{ label: "Pénalités de retard", id: "latePaymentPenaltyText" }}
                register={register}
                error={errors.latePaymentPenaltyText?.message}
                textarea
              />
              <TextField
                field={{
                  label: "Mentions additionnelles",
                  id: "additionalLegalMentions",
                  optional: true,
                }}
                register={register}
                textarea
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Numérotation &amp; échéances</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <TextField
                field={{ label: "Préfixe devis", id: "quoteNumberPrefix" }}
                register={register}
              />
              <TextField
                field={{ label: "Préfixe facture", id: "invoiceNumberPrefix" }}
                register={register}
              />
              <TextField
                field={{
                  label: "Validité du devis (jours)",
                  id: "quoteValidityDays",
                  number: true,
                }}
                register={register}
              />
              <TextField
                field={{
                  label: "Délai de paiement par défaut (jours)",
                  id: "defaultPaymentTermDays",
                  number: true,
                }}
                register={register}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="urssaf" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Déclaration URSSAF</CardTitle>
              <CardDescription>
                Les taux changent chaque année : vérifie-les sur urssaf.fr avant de les
                appliquer. Ils ne sont utilisés que pour t&apos;aider à estimer.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Périodicité de déclaration</Label>
                <Select
                  value={urssafPeriodicity}
                  onValueChange={(v) =>
                    setValue("urssafPeriodicity", v as "MONTHLY" | "QUARTERLY")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">Mensuelle</SelectItem>
                    <SelectItem value="QUARTERLY">Trimestrielle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Préréglage de taux</Label>
                <Select onValueChange={applyPreset}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un préréglage" />
                  </SelectTrigger>
                  <SelectContent>
                    {URSSAF_RATE_PRESETS.map((preset) => (
                      <SelectItem key={preset.key} value={preset.key}>
                        {preset.label} — {(preset.cotisationRateBps / 100).toFixed(2)}%
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="urssafCotisationRateBps">
                  Taux de cotisations (en points de base, ex 2120 = 21,20%)
                </Label>
                <Input
                  id="urssafCotisationRateBps"
                  type="number"
                  {...register("urssafCotisationRateBps", { valueAsNumber: true })}
                />
              </div>
              <div className="flex items-end gap-2 pb-2">
                <Checkbox
                  id="versementLiberatoireEnabled"
                  checked={versementLiberatoireEnabled}
                  onCheckedChange={(checked) =>
                    setValue("versementLiberatoireEnabled", checked === true)
                  }
                />
                <Label htmlFor="versementLiberatoireEnabled">
                  Versement libératoire de l&apos;impôt sur le revenu
                </Label>
              </div>
              {versementLiberatoireEnabled && (
                <div className="space-y-1.5">
                  <Label htmlFor="versementLiberatoireRateBps">
                    Taux versement libératoire (points de base)
                  </Label>
                  <Input
                    id="versementLiberatoireRateBps"
                    type="number"
                    {...register("versementLiberatoireRateBps", { valueAsNumber: true })}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
