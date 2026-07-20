import { z } from "zod";

export const serviceItemFormSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().optional(),
  unitPrice: z.number().nonnegative("Le prix doit être positif"),
  unit: z.string().min(1, "L'unité est requise"),
  category: z.string().optional(),
});

export type ServiceItemFormValues = z.infer<typeof serviceItemFormSchema>;

export const DEFAULT_SERVICE_ITEM_VALUES: ServiceItemFormValues = {
  name: "",
  description: "",
  unitPrice: 0,
  unit: "unité",
  category: "",
};
