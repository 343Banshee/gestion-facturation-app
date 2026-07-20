import type { Prisma } from "@/generated/prisma/client";
import { DocumentType } from "@/generated/prisma/enums";

export async function getNextDocumentNumber(
  tx: Prisma.TransactionClient,
  profileId: string,
  documentType: DocumentType,
  prefix: string,
  year: number = new Date().getFullYear(),
): Promise<string> {
  const counter = await tx.documentCounter.upsert({
    where: {
      profileId_documentType_year: { profileId, documentType, year },
    },
    update: { lastNumber: { increment: 1 } },
    create: { profileId, documentType, year, lastNumber: 1 },
  });

  return `${prefix}-${year}-${String(counter.lastNumber).padStart(4, "0")}`;
}
