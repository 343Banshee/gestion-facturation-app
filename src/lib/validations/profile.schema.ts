import { z } from "zod";

export const profileFormSchema = z.object({
  name: z.string().min(1, "Le nom du profil est requis"),
  companyName: z.string().min(1, "Le nom de l'entreprise est requis"),
  addressLine1: z.string().min(1, "L'adresse est requise"),
  addressLine2: z.string().optional(),
  postalCode: z.string().min(1, "Le code postal est requis"),
  city: z.string().min(1, "La ville est requise"),
  country: z.string().min(1),
  siret: z.string().min(1, "Le SIRET est requis"),
  apeCode: z.string().optional(),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
  iban: z.string().optional(),
  bic: z.string().optional(),
  otherPaymentInstructions: z.string().optional(),
  vatMention: z.string().min(1),
  latePaymentPenaltyText: z.string().min(1),
  additionalLegalMentions: z.string().optional(),
  defaultLanguage: z.enum(["FR", "EN"]),
  quoteNumberPrefix: z.string().min(1),
  invoiceNumberPrefix: z.string().min(1),
  quoteValidityDays: z.number().int().positive(),
  defaultPaymentTermDays: z.number().int().nonnegative(),
  urssafPeriodicity: z.enum(["MONTHLY", "QUARTERLY"]),
  urssafRatePresetKey: z.string().optional(),
  urssafCotisationRateBps: z.number().int().nonnegative(),
  versementLiberatoireEnabled: z.boolean(),
  versementLiberatoireRateBps: z.number().int().nonnegative().optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const DEFAULT_PROFILE_VALUES: ProfileFormValues = {
  name: "",
  companyName: "",
  addressLine1: "",
  addressLine2: "",
  postalCode: "",
  city: "",
  country: "France",
  siret: "",
  apeCode: "",
  email: "",
  phone: "",
  iban: "",
  bic: "",
  otherPaymentInstructions: "",
  vatMention: "TVA non applicable, art. 293B du CGI",
  latePaymentPenaltyText:
    "Pénalités de retard : taux BCE + 10 points. Indemnité forfaitaire pour frais de recouvrement : 40 €.",
  additionalLegalMentions: "",
  defaultLanguage: "FR",
  quoteNumberPrefix: "DEV",
  invoiceNumberPrefix: "FAC",
  quoteValidityDays: 30,
  defaultPaymentTermDays: 30,
  urssafPeriodicity: "QUARTERLY",
  urssafRatePresetKey: "",
  urssafCotisationRateBps: 0,
  versementLiberatoireEnabled: false,
  versementLiberatoireRateBps: undefined,
};

export const URSSAF_RATE_PRESETS: {
  key: string;
  label: string;
  cotisationRateBps: number;
  versementLiberatoireRateBps: number;
}[] = [
  {
    key: "BIC_VENTE",
    label: "Vente de marchandises (BIC)",
    cotisationRateBps: 1230,
    versementLiberatoireRateBps: 100,
  },
  {
    key: "BIC_SERVICES",
    label: "Prestations de services (BIC)",
    cotisationRateBps: 2120,
    versementLiberatoireRateBps: 170,
  },
  {
    key: "BNC",
    label: "Professions libérales (BNC)",
    cotisationRateBps: 2560,
    versementLiberatoireRateBps: 220,
  },
  {
    key: "CIPAV",
    label: "Professions libérales (CIPAV)",
    cotisationRateBps: 2320,
    versementLiberatoireRateBps: 220,
  },
];
