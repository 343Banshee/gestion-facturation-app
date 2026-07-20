import { Badge } from "@/components/ui/badge";
import type { QuoteStatus, InvoiceStatus } from "@/generated/prisma/enums";

const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  DRAFT: "Brouillon",
  SENT: "Envoyé",
  ACCEPTED: "Accepté",
  REJECTED: "Refusé",
  EXPIRED: "Expiré",
  CONVERTED: "Converti en facture",
};

const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  DRAFT: "Brouillon",
  SENT: "Envoyée",
  PARTIALLY_PAID: "Partiellement payée",
  PAID: "Payée",
  CANCELLED: "Annulée",
};

const STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  DRAFT: "outline",
  SENT: "secondary",
  ACCEPTED: "default",
  PAID: "default",
  PARTIALLY_PAID: "secondary",
  REJECTED: "destructive",
  EXPIRED: "destructive",
  CANCELLED: "destructive",
  CONVERTED: "secondary",
};

export function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  return <Badge variant={STATUS_VARIANTS[status]}>{QUOTE_STATUS_LABELS[status]}</Badge>;
}

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return <Badge variant={STATUS_VARIANTS[status]}>{INVOICE_STATUS_LABELS[status]}</Badge>;
}

export function OverdueBadge() {
  return <Badge variant="destructive">En retard</Badge>;
}
