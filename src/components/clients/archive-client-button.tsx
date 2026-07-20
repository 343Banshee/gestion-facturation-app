"use client";

import { ArchiveToggleButton } from "@/components/common/archive-toggle-button";
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
  return (
    <ArchiveToggleButton
      archived={archived}
      itemLabel={clientName}
      archiveDescription="Le client n'apparaîtra plus dans les listes actives, mais ses devis et factures existants restent inchangés. Tu pourras le réactiver à tout moment."
      onSetArchived={(archived) => setClientArchived(clientId, profileSlug, archived)}
    />
  );
}
