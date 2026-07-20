import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { getProfileBySlug } from "@/lib/actions/profiles.actions";
import { listClients } from "@/lib/actions/clients.actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArchiveClientButton } from "@/components/clients/archive-client-button";

export default async function ClientsPage({
  params,
  searchParams,
}: {
  params: Promise<{ profileSlug: string }>;
  searchParams: Promise<{ archived?: string }>;
}) {
  const { profileSlug } = await params;
  const { archived } = await searchParams;
  const showArchived = archived === "1";

  const profile = await getProfileBySlug(profileSlug);
  if (!profile) notFound();

  const clients = await listClients(profile.id, { includeArchived: showArchived });
  const visibleClients = showArchived ? clients.filter((c) => c.archived) : clients;

  return (
    <div className="mx-auto max-w-5xl px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">
            {showArchived ? "Clients archivés" : "Tes clients actifs"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            nativeButton={false}
            render={
              <Link href={`/p/${profileSlug}/clients${showArchived ? "" : "?archived=1"}`} />
            }
          >
            {showArchived ? "Voir les actifs" : "Voir les archivés"}
          </Button>
          <Button nativeButton={false} render={<Link href={`/p/${profileSlug}/clients/new`} />}>
            <Plus className="h-4 w-4" />
            Nouveau client
          </Button>
        </div>
      </div>

      {visibleClients.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
          {showArchived ? "Aucun client archivé." : "Aucun client pour l'instant."}
        </div>
      ) : (
        <div className="rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Ville</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Langue</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/p/${profileSlug}/clients/${client.id}`}
                      className="hover:underline"
                    >
                      {client.name}
                    </Link>
                  </TableCell>
                  <TableCell>{client.city}</TableCell>
                  <TableCell>{client.email || "—"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{client.preferredLanguage}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <ArchiveClientButton
                      clientId={client.id}
                      profileSlug={profileSlug}
                      archived={client.archived}
                      clientName={client.name}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
