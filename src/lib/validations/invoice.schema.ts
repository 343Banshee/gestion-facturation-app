import { z } from "zod";
import { documentLineSchema } from "@/lib/validations/quote.schema";

export const invoiceFormSchema = z.object({
  clientId: z.string().min(1, "Le client est requis"),
  issueDate: z.string().min(1, "La date d'émission est requise"),
  dueDate: z.string().min(1, "La date d'échéance est requise"),
  language: z.enum(["FR", "EN"]),
  notes: z.string().optional(),
  termsOverride: z.string().optional(),
  lines: z.array(documentLineSchema).min(1, "Ajoute au moins une ligne"),
});

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

export const paymentFormSchema = z.object({
  amount: z.number().positive("Le montant doit être positif"),
  paidAt: z.string().min(1, "La date est requise"),
  method: z.enum(["BANK_TRANSFER", "CHECK", "CASH", "CARD", "OTHER"]),
  notes: z.string().optional(),
});

export type PaymentFormValues = z.infer<typeof paymentFormSchema>;
