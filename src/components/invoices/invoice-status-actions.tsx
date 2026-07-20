"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { setInvoiceStatus, deleteDraftInvoice } from "@/lib/actions/invoices.actions";
import { InvoiceStatus } from "@/generated/prisma/enums";

function isRedirectError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "digest" in err &&
    typeof (err as { digest: unknown }).digest === "string" &&
    (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

export function InvoiceStatusActions({
  invoiceId,
  profileSlug,
  status,
}: {
  invoiceId: string;
  profileSlug: string;
  status: InvoiceStatus;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function run(action: () => Promise<unknown>) {
    startTransition(async () => {
      try {
        await action();
        router.refresh();
      } catch (err) {
        if (isRedirectError(err)) throw err;
        toast.error("Une erreur est survenue", {
          description: err instanceof Error ? err.message : undefined,
        });
      }
    });
  }

  if (status === InvoiceStatus.DRAFT) {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          disabled={isPending}
          onClick={() =>
            run(() => setInvoiceStatus(invoiceId, profileSlug, InvoiceStatus.SENT))
          }
        >
          Marquer comme envoyée
        </Button>
        <Button
          variant="outline"
          disabled={isPending}
          onClick={() => run(() => deleteDraftInvoice(invoiceId, profileSlug))}
        >
          Supprimer le brouillon
        </Button>
      </div>
    );
  }

  if (status === InvoiceStatus.SENT || status === InvoiceStatus.PARTIALLY_PAID) {
    return (
      <Button
        variant="outline"
        disabled={isPending}
        onClick={() =>
          run(() => setInvoiceStatus(invoiceId, profileSlug, InvoiceStatus.CANCELLED))
        }
      >
        Annuler la facture
      </Button>
    );
  }

  return null;
}
