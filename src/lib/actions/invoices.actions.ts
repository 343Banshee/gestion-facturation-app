"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { toCents } from "@/lib/money";
import { getNextDocumentNumber } from "@/lib/numbering";
import type { Prisma } from "@/generated/prisma/client";
import { DocumentType, InvoiceStatus, QuoteStatus } from "@/generated/prisma/enums";
import {
  invoiceFormSchema,
  paymentFormSchema,
  type InvoiceFormValues,
  type PaymentFormValues,
} from "@/lib/validations/invoice.schema";

export async function listInvoices(profileId: string, status?: InvoiceStatus) {
  return prisma.invoice.findMany({
    where: { profileId, ...(status ? { status } : {}) },
    include: { client: true, payments: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getInvoiceWithRelations(invoiceId: string) {
  return prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      client: true,
      profile: true,
      lines: { orderBy: { position: "asc" } },
      payments: { orderBy: { paidAt: "desc" } },
      sourceQuote: true,
    },
  });
}

function computeLines(values: InvoiceFormValues) {
  const lines = values.lines.map((line, index) => {
    const unitPriceCents = toCents(line.unitPrice);
    const lineTotalCents = Math.round(line.quantity * unitPriceCents);
    return {
      serviceItemId: line.serviceItemId || null,
      description: line.description,
      quantity: line.quantity,
      unitPriceCents,
      unit: line.unit,
      position: index,
      lineTotalCents,
    };
  });
  const subtotalAmountCents = lines.reduce((sum, l) => sum + l.lineTotalCents, 0);
  return { lines, subtotalAmountCents };
}

export async function createInvoice(
  profileId: string,
  profileSlug: string,
  values: InvoiceFormValues,
) {
  const parsed = invoiceFormSchema.parse(values);
  const { lines, subtotalAmountCents } = computeLines(parsed);

  const invoice = await prisma.$transaction(async (tx) => {
    const profile = await tx.profile.findUniqueOrThrow({ where: { id: profileId } });
    const number = await getNextDocumentNumber(
      tx,
      profileId,
      DocumentType.INVOICE,
      profile.invoiceNumberPrefix,
    );

    return tx.invoice.create({
      data: {
        profileId,
        clientId: parsed.clientId,
        number,
        status: InvoiceStatus.DRAFT,
        issueDate: new Date(parsed.issueDate),
        dueDate: new Date(parsed.dueDate),
        language: parsed.language,
        notes: parsed.notes || null,
        termsOverride: parsed.termsOverride || null,
        subtotalAmountCents,
        lines: { create: lines },
      },
    });
  });

  revalidatePath(`/p/${profileSlug}/factures`);
  redirect(`/p/${profileSlug}/factures/${invoice.id}`);
}

export async function updateInvoice(
  invoiceId: string,
  profileSlug: string,
  values: InvoiceFormValues,
) {
  const parsed = invoiceFormSchema.parse(values);
  const { lines, subtotalAmountCents } = computeLines(parsed);

  await prisma.$transaction(async (tx) => {
    await tx.invoiceLine.deleteMany({ where: { invoiceId } });
    await tx.invoice.update({
      where: { id: invoiceId },
      data: {
        clientId: parsed.clientId,
        issueDate: new Date(parsed.issueDate),
        dueDate: new Date(parsed.dueDate),
        language: parsed.language,
        notes: parsed.notes || null,
        termsOverride: parsed.termsOverride || null,
        subtotalAmountCents,
        lines: { create: lines },
      },
    });
  });

  revalidatePath(`/p/${profileSlug}/factures`);
  redirect(`/p/${profileSlug}/factures/${invoiceId}`);
}

export async function setInvoiceStatus(
  invoiceId: string,
  profileSlug: string,
  status: typeof InvoiceStatus.DRAFT | typeof InvoiceStatus.SENT | typeof InvoiceStatus.CANCELLED,
) {
  await prisma.invoice.update({ where: { id: invoiceId }, data: { status } });
  revalidatePath(`/p/${profileSlug}/factures`);
  revalidatePath(`/p/${profileSlug}/factures/${invoiceId}`);
}

export async function deleteDraftInvoice(invoiceId: string, profileSlug: string) {
  const invoice = await prisma.invoice.findUniqueOrThrow({ where: { id: invoiceId } });
  if (invoice.status !== InvoiceStatus.DRAFT) {
    throw new Error("Seule une facture en brouillon peut être supprimée.");
  }
  await prisma.invoice.delete({ where: { id: invoiceId } });
  revalidatePath(`/p/${profileSlug}/factures`);
  redirect(`/p/${profileSlug}/factures`);
}

async function recomputeInvoiceStatus(tx: Prisma.TransactionClient, invoiceId: string) {
  const invoice = await tx.invoice.findUniqueOrThrow({
    where: { id: invoiceId },
    include: { payments: true },
  });
  if (invoice.status === InvoiceStatus.CANCELLED) return;

  const paidCents = invoice.payments.reduce((sum, p) => sum + p.amountCents, 0);
  let nextStatus = invoice.status;
  if (paidCents >= invoice.subtotalAmountCents && invoice.subtotalAmountCents > 0) {
    nextStatus = InvoiceStatus.PAID;
  } else if (paidCents > 0) {
    nextStatus = InvoiceStatus.PARTIALLY_PAID;
  } else if (invoice.status === InvoiceStatus.PAID || invoice.status === InvoiceStatus.PARTIALLY_PAID) {
    nextStatus = InvoiceStatus.SENT;
  }

  if (nextStatus !== invoice.status) {
    await tx.invoice.update({ where: { id: invoiceId }, data: { status: nextStatus } });
  }
}

export async function addPayment(
  invoiceId: string,
  profileSlug: string,
  values: PaymentFormValues,
) {
  const parsed = paymentFormSchema.parse(values);

  await prisma.$transaction(async (tx) => {
    await tx.payment.create({
      data: {
        invoiceId,
        amountCents: toCents(parsed.amount),
        paidAt: new Date(parsed.paidAt),
        method: parsed.method,
        notes: parsed.notes || null,
      },
    });
    await recomputeInvoiceStatus(tx, invoiceId);
  });

  revalidatePath(`/p/${profileSlug}/factures`);
  revalidatePath(`/p/${profileSlug}/factures/${invoiceId}`);
}

export async function deletePayment(
  paymentId: string,
  invoiceId: string,
  profileSlug: string,
) {
  await prisma.$transaction(async (tx) => {
    await tx.payment.delete({ where: { id: paymentId } });
    await recomputeInvoiceStatus(tx, invoiceId);
  });

  revalidatePath(`/p/${profileSlug}/factures`);
  revalidatePath(`/p/${profileSlug}/factures/${invoiceId}`);
}

export async function convertQuoteToInvoice(quoteId: string, profileSlug: string) {
  const quote = await prisma.quote.findUniqueOrThrow({
    where: { id: quoteId },
    include: { lines: true, profile: true },
  });

  if (quote.status !== QuoteStatus.ACCEPTED) {
    throw new Error("Seul un devis accepté peut être converti en facture.");
  }
  if (quote.convertedInvoiceId) {
    throw new Error("Ce devis a déjà été converti en facture.");
  }

  const invoice = await prisma.$transaction(async (tx) => {
    const number = await getNextDocumentNumber(
      tx,
      quote.profileId,
      DocumentType.INVOICE,
      quote.profile.invoiceNumberPrefix,
    );
    const issueDate = new Date();
    const dueDate = addDays(issueDate, quote.profile.defaultPaymentTermDays);

    const created = await tx.invoice.create({
      data: {
        profileId: quote.profileId,
        clientId: quote.clientId,
        number,
        status: InvoiceStatus.DRAFT,
        issueDate,
        dueDate,
        language: quote.language,
        notes: quote.notes,
        termsOverride: quote.termsOverride,
        sourceQuoteId: quote.id,
        subtotalAmountCents: quote.subtotalAmountCents,
        lines: {
          create: quote.lines.map((line) => ({
            serviceItemId: line.serviceItemId,
            description: line.description,
            quantity: line.quantity,
            unitPriceCents: line.unitPriceCents,
            unit: line.unit,
            position: line.position,
            lineTotalCents: line.lineTotalCents,
          })),
        },
      },
    });

    await tx.quote.update({
      where: { id: quote.id },
      data: { status: QuoteStatus.CONVERTED, convertedInvoiceId: created.id },
    });

    return created;
  });

  revalidatePath(`/p/${profileSlug}/devis`);
  revalidatePath(`/p/${profileSlug}/devis/${quoteId}`);
  revalidatePath(`/p/${profileSlug}/factures`);
  redirect(`/p/${profileSlug}/factures/${invoice.id}`);
}
