import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getProfileBySlug } from "@/lib/actions/profiles.actions";
import { computeUrssafDeclaration } from "@/lib/urssaf/calculator";
import { getPeriodBounds, shiftPeriod, formatPeriodLabel } from "@/lib/urssaf/period";
import { formatMoney } from "@/lib/money";
import { formatDate, toDateInputValue } from "@/lib/dates";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function UrssafPage({
  params,
  searchParams,
}: {
  params: Promise<{ profileSlug: string }>;
  searchParams: Promise<{ ref?: string }>;
}) {
  const { profileSlug } = await params;
  const { ref } = await searchParams;
  const profile = await getProfileBySlug(profileSlug);
  if (!profile) notFound();

  const refDate = ref ? new Date(ref) : new Date();
  const { start, end } = getPeriodBounds(profile.urssafPeriodicity, refDate);
  const declaration = await computeUrssafDeclaration(profile.id, start, end);

  const prevRef = toDateInputValue(shiftPeriod(profile.urssafPeriodicity, start, -1));
  const nextRef = toDateInputValue(shiftPeriod(profile.urssafPeriodicity, start, 1));
  const periodicityLabel = profile.urssafPeriodicity === "MONTHLY" ? "mensuelle" : "trimestrielle";

  return (
    <div className="mx-auto max-w-4xl px-8 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Déclaration URSSAF</h1>
      <p className="text-muted-foreground">
        Estimation basée sur les encaissements, périodicité {periodicityLabel}.
      </p>

      <div className="mt-6 mb-6 flex items-center justify-between rounded-2xl border px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          nativeButton={false}
          render={<Link href={`?ref=${prevRef}`} />}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <p className="text-lg font-medium capitalize">
          {formatPeriodLabel(profile.urssafPeriodicity, start)}
        </p>
        <Button
          variant="ghost"
          size="icon"
          nativeButton={false}
          render={<Link href={`?ref=${nextRef}`} />}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Encaissé sur la période
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatMoney(declaration.totalEncaisseCents)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Facturé sur la période
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-muted-foreground">
            {formatMoney(declaration.totalFactureCents)}
          </CardContent>
        </Card>
      </div>

      {declaration.totalFactureCents > declaration.totalEncaisseCents && (
        <p className="mt-3 text-sm text-muted-foreground">
          {formatMoney(declaration.totalFactureCents - declaration.totalEncaisseCents)} facturés
          mais non encore encaissés sur cette période — à déclarer seulement lors du paiement
          effectif.
        </p>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Montant à déclarer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              Cotisations sociales ({(profile.urssafCotisationRateBps / 100).toFixed(2)}%)
            </span>
            <span>{formatMoney(declaration.cotisationsCents)}</span>
          </div>
          {profile.versementLiberatoireEnabled && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                Versement libératoire (
                {((profile.versementLiberatoireRateBps ?? 0) / 100).toFixed(2)}%)
              </span>
              <span>{formatMoney(declaration.versementLiberatoireCents)}</span>
            </div>
          )}
          <div className="flex items-center justify-between border-t pt-2 text-lg font-semibold">
            <span>Total à charge</span>
            <span>{formatMoney(declaration.totalACharge)}</span>
          </div>
        </CardContent>
      </Card>

      <p className="mt-3 text-xs text-muted-foreground">
        Taux configurés dans les paramètres du profil — ils changent chaque année, pense à les
        vérifier sur{" "}
        <a
          href="https://www.urssaf.fr"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          urssaf.fr
        </a>{" "}
        avant de déclarer.
      </p>

      <div className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">
          Encaissements de la période ({declaration.payments.length})
        </h2>
        {declaration.payments.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
            Aucun encaissement sur cette période.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Facture</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {declaration.payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{formatDate(payment.paidAt)}</TableCell>
                    <TableCell>{payment.invoiceNumber}</TableCell>
                    <TableCell>{payment.clientName}</TableCell>
                    <TableCell className="text-right">
                      {formatMoney(payment.amountCents)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
