import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { getProfileBySlug } from "@/lib/actions/profiles.actions";
import { listServiceItems } from "@/lib/actions/service-items.actions";
import { formatMoney } from "@/lib/money";
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
import { ArchiveServiceItemButton } from "@/components/catalogue/archive-service-item-button";

export default async function CataloguePage({
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

  const items = await listServiceItems(profile.id, { includeArchived: showArchived });
  const visibleItems = showArchived ? items.filter((i) => i.archived) : items;

  return (
    <div className="mx-auto max-w-5xl px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Catalogue</h1>
          <p className="text-muted-foreground">
            {showArchived ? "Prestations archivées" : "Tes prestations & produits"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            render={
              <Link
                href={`/p/${profileSlug}/catalogue${showArchived ? "" : "?archived=1"}`}
              />
            }
          >
            {showArchived ? "Voir les actives" : "Voir les archivées"}
          </Button>
          <Button render={<Link href={`/p/${profileSlug}/catalogue/new`} />}>
            <Plus className="h-4 w-4" />
            Nouvelle prestation
          </Button>
        </div>
      </div>

      {visibleItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
          {showArchived ? "Aucune prestation archivée." : "Aucune prestation pour l'instant."}
        </div>
      ) : (
        <div className="rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Unité</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/p/${profileSlug}/catalogue/${item.id}`}
                      className="hover:underline"
                    >
                      {item.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {item.category ? (
                      <Badge variant="secondary">{item.category}</Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>{formatMoney(item.unitPriceCents)}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell className="text-right">
                    <ArchiveServiceItemButton
                      itemId={item.id}
                      profileSlug={profileSlug}
                      archived={item.archived}
                      itemName={item.name}
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
