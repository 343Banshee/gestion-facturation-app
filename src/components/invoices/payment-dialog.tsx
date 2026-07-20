"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { addPayment } from "@/lib/actions/invoices.actions";
import {
  paymentFormSchema,
  type PaymentFormValues,
} from "@/lib/validations/invoice.schema";
import { toDateInputValue } from "@/lib/dates";

const PAYMENT_METHOD_LABELS: Record<PaymentFormValues["method"], string> = {
  BANK_TRANSFER: "Virement",
  CHECK: "Chèque",
  CASH: "Espèces",
  CARD: "Carte",
  OTHER: "Autre",
};

export function PaymentDialog({
  invoiceId,
  profileSlug,
  remainingAmount,
}: {
  invoiceId: string;
  profileSlug: string;
  remainingAmount: number;
}) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: remainingAmount,
      paidAt: toDateInputValue(new Date()),
      method: "BANK_TRANSFER",
      notes: "",
    },
  });

  const method = watch("method");

  const submit = handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      await addPayment(invoiceId, profileSlug, values);
      toast.success("Encaissement enregistré");
      setOpen(false);
      reset();
    } catch (err) {
      toast.error("Une erreur est survenue", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="h-4 w-4" />
        Enregistrer un encaissement
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvel encaissement</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="amount">Montant (€)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              {...register("amount", { valueAsNumber: true })}
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="paidAt">Date de l&apos;encaissement</Label>
            <Input id="paidAt" type="date" {...register("paidAt")} />
          </div>
          <div className="space-y-1.5">
            <Label>Moyen de paiement</Label>
            <Select
              items={PAYMENT_METHOD_LABELS}
              value={method}
              onValueChange={(v) => v && setValue("method", v as PaymentFormValues["method"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...register("notes")} />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
