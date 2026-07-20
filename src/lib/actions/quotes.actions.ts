"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toCents } from "@/lib/money";
import { getNextDocumentNumber } from "@/lib/numbering";
import { DocumentType, QuoteStatus } from "@/generated/prisma/enums";
import {
  quoteFormSchema,
  type QuoteFormValues,
} from "@/lib/validations/quote.schema";

export async function listQuotes(profileId: string, status?: QuoteStatus) {
  return prisma.quote.findMany({
    where: { profileId, ...(status ? { status } : {}) },
    include: { client: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getQuoteWithRelations(quoteId: string) {
  return prisma.quote.findUnique({
    where: { id: quoteId },
    include: {
      client: true,
      profile: true,
      lines: { orderBy: { position: "asc" } },
      convertedInvoice: true,
    },
  });
}

function computeLines(values: QuoteFormValues) {
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

export async function createQuote(
  profileId: string,
  profileSlug: string,
  values: QuoteFormValues,
) {
  const parsed = quoteFormSchema.parse(values);
  const { lines, subtotalAmountCents } = computeLines(parsed);

  const quote = await prisma.$transaction(async (tx) => {
    const profile = await tx.profile.findUniqueOrThrow({ where: { id: profileId } });
    const number = await getNextDocumentNumber(
      tx,
      profileId,
      DocumentType.QUOTE,
      profile.quoteNumberPrefix,
    );

    return tx.quote.create({
      data: {
        profileId,
        clientId: parsed.clientId,
        number,
        status: QuoteStatus.DRAFT,
        issueDate: new Date(parsed.issueDate),
        validUntil: new Date(parsed.validUntil),
        language: parsed.language,
        notes: parsed.notes || null,
        termsOverride: parsed.termsOverride || null,
        subtotalAmountCents,
        lines: { create: lines },
      },
    });
  });

  revalidatePath(`/p/${profileSlug}/devis`);
  redirect(`/p/${profileSlug}/devis/${quote.id}`);
}

export async function updateQuote(
  quoteId: string,
  profileSlug: string,
  values: QuoteFormValues,
) {
  const parsed = quoteFormSchema.parse(values);
  const { lines, subtotalAmountCents } = computeLines(parsed);

  await prisma.$transaction(async (tx) => {
    await tx.quoteLine.deleteMany({ where: { quoteId } });
    await tx.quote.update({
      where: { id: quoteId },
      data: {
        clientId: parsed.clientId,
        issueDate: new Date(parsed.issueDate),
        validUntil: new Date(parsed.validUntil),
        language: parsed.language,
        notes: parsed.notes || null,
        termsOverride: parsed.termsOverride || null,
        subtotalAmountCents,
        lines: { create: lines },
      },
    });
  });

  revalidatePath(`/p/${profileSlug}/devis`);
  redirect(`/p/${profileSlug}/devis/${quoteId}`);
}

export async function setQuoteStatus(
  quoteId: string,
  profileSlug: string,
  status: QuoteStatus,
) {
  await prisma.quote.update({ where: { id: quoteId }, data: { status } });
  revalidatePath(`/p/${profileSlug}/devis`);
  revalidatePath(`/p/${profileSlug}/devis/${quoteId}`);
}

export async function deleteDraftQuote(quoteId: string, profileSlug: string) {
  const quote = await prisma.quote.findUniqueOrThrow({ where: { id: quoteId } });
  if (quote.status !== QuoteStatus.DRAFT) {
    throw new Error("Seul un devis en brouillon peut être supprimé.");
  }
  await prisma.quote.delete({ where: { id: quoteId } });
  revalidatePath(`/p/${profileSlug}/devis`);
  redirect(`/p/${profileSlug}/devis`);
}
