import { z } from "zod";

export const documentLineSchema = z.object({
  serviceItemId: z.string().optional(),
  description: z.string().min(1, "La description est requise"),
  quantity: z.number().positive("La quantité doit être positive"),
  unitPrice: z.number().nonnegative("Le prix doit être positif"),
  unit: z.string().min(1),
});

export type DocumentLineValues = z.infer<typeof documentLineSchema>;

export const quoteFormSchema = z.object({
  clientId: z.string().min(1, "Le client est requis"),
  issueDate: z.string().min(1, "La date d'émission est requise"),
  validUntil: z.string().min(1, "La date de validité est requise"),
  language: z.enum(["FR", "EN"]),
  notes: z.string().optional(),
  termsOverride: z.string().optional(),
  lines: z.array(documentLineSchema).min(1, "Ajoute au moins une ligne"),
});

export type QuoteFormValues = z.infer<typeof quoteFormSchema>;

export const EMPTY_LINE: DocumentLineValues = {
  serviceItemId: undefined,
  description: "",
  quantity: 1,
  unitPrice: 0,
  unit: "unité",
};
