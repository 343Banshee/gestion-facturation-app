"use client";

import { useTransition } from "react";
import { Archive, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { setClientArchived } from "@/lib/actions/clients.actions";

export function ArchiveClientButton({
  clientId,
  profileSlug,
  archived,
  clientName,
}: {
  clientId: string;
  profileSlug: string;
  archived: boolean;
  clientName: string;
}) {
  const [isPending, startTransition] = useTransition();

  if (archived) {
    return (
      <Button
        variant="ghost"
        size="icon"
        disabled={isPending}
        title="Réactiver"
        onClick={() =>
          startTransition(async () => {
            await setClientArchived(clientId, profileSlug, false);
            toast.success("Client réactivé");
          })
        }
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="ghost" size="icon" title="Archiver" />}>
        <Archive className="h-4 w-4" />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Archiver {clientName} ?</AlertDialogTitle>
          <AlertDialogDescription>
            Le client n&apos;apparaîtra plus dans les listes actives, mais ses devis et
            factures existants restent inchangés. Tu pourras le réactiver à tout moment.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await setClientArchived(clientId, profileSlug, true);
                toast.success("Client archivé");
              })
            }
          >
            Archiver
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
