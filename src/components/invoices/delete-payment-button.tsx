"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deletePayment } from "@/lib/actions/invoices.actions";

export function DeletePaymentButton({
  paymentId,
  invoiceId,
  profileSlug,
}: {
  paymentId: string;
  invoiceId: string;
  profileSlug: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await deletePayment(paymentId, invoiceId, profileSlug);
          toast.success("Encaissement supprimé");
        })
      }
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
