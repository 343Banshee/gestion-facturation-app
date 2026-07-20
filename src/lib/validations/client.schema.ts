import { z } from "zod";

export const clientFormSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  contactName: z.string().optional(),
  addressLine1: z.string().min(1, "L'adresse est requise"),
  addressLine2: z.string().optional(),
  postalCode: z.string().min(1, "Le code postal est requis"),
  city: z.string().min(1, "La ville est requise"),
  country: z.string().min(1),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  phone: z.string().optional(),
  siret: z.string().optional(),
  preferredLanguage: z.enum(["FR", "EN"]),
  notes: z.string().optional(),
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;

export const DEFAULT_CLIENT_VALUES: ClientFormValues = {
  name: "",
  contactName: "",
  addressLine1: "",
  addressLine2: "",
  postalCode: "",
  city: "",
  country: "France",
  email: "",
  phone: "",
  siret: "",
  preferredLanguage: "FR",
  notes: "",
};
