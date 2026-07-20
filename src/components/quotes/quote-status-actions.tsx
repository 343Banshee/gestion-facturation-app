"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { setQuoteStatus, deleteDraftQuote } from "@/lib/actions/quotes.actions";
import { convertQuoteToInvoice } from "@/lib/actions/invoices.actions";
import { QuoteStatus } from "@/generated/prisma/enums";

function isRedirectError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "digest" in err &&
    typeof (err as { digest: unknown }).digest === "string" &&
    (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

export function QuoteStatusActions({
  quoteId,
  profileSlug,
  status,
  hasConvertedInvoice,
}: {
  quoteId: string;
  profileSlug: string;
  status: QuoteStatus;
  hasConvertedInvoice: boolean;
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

  return (
    <div className="flex flex-wrap gap-2">
      {status === QuoteStatus.DRAFT && (
        <>
          <Button
            disabled={isPending}
            onClick={() => run(() => setQuoteStatus(quoteId, profileSlug, QuoteStatus.SENT))}
          >
            Marquer comme envoyé
          </Button>
          <Button
            variant="outline"
            disabled={isPending}
            onClick={() =>
              run(() => deleteDraftQuote(quoteId, profileSlug))
            }
          >
            Supprimer le brouillon
          </Button>
        </>
      )}

      {status === QuoteStatus.SENT && (
        <>
          <Button
            disabled={isPending}
            onClick={() =>
              run(() => setQuoteStatus(quoteId, profileSlug, QuoteStatus.ACCEPTED))
            }
          >
            Marquer comme accepté
          </Button>
          <Button
            variant="outline"
            disabled={isPending}
            onClick={() =>
              run(() => setQuoteStatus(quoteId, profileSlug, QuoteStatus.REJECTED))
            }
          >
            Marquer comme refusé
          </Button>
          <Button
            variant="outline"
            disabled={isPending}
            onClick={() =>
              run(() => setQuoteStatus(quoteId, profileSlug, QuoteStatus.EXPIRED))
            }
          >
            Marquer comme expiré
          </Button>
        </>
      )}

      {status === QuoteStatus.ACCEPTED && !hasConvertedInvoice && (
        <Button
          disabled={isPending}
          onClick={() => run(() => convertQuoteToInvoice(quoteId, profileSlug))}
        >
          Convertir en facture
        </Button>
      )}
    </div>
  );
}
