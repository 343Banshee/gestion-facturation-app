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

export function ArchiveToggleButton({
  archived,
  itemLabel,
  archiveDescription,
  onSetArchived,
}: {
  archived: boolean;
  itemLabel: string;
  archiveDescription: string;
  onSetArchived: (archived: boolean) => Promise<void>;
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
            await onSetArchived(false);
            toast.success("Réactivé");
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
          <AlertDialogTitle>Archiver {itemLabel} ?</AlertDialogTitle>
          <AlertDialogDescription>{archiveDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await onSetArchived(true);
                toast.success("Archivé");
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
