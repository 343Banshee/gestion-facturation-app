"use client";

import { ArchiveToggleButton } from "@/components/common/archive-toggle-button";
import { setServiceItemArchived } from "@/lib/actions/service-items.actions";

export function ArchiveServiceItemButton({
  itemId,
  profileSlug,
  archived,
  itemName,
}: {
  itemId: string;
  profileSlug: string;
  archived: boolean;
  itemName: string;
}) {
  return (
    <ArchiveToggleButton
      archived={archived}
      itemLabel={itemName}
      archiveDescription="La prestation n'apparaîtra plus dans le catalogue lors de la création de devis/factures. Les lignes déjà émises restent inchangées."
      onSetArchived={(archived) => setServiceItemArchived(itemId, profileSlug, archived)}
    />
  );
}
