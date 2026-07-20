"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toCents } from "@/lib/money";
import {
  serviceItemFormSchema,
  type ServiceItemFormValues,
} from "@/lib/validations/service-item.schema";

export async function listServiceItems(profileId: string, { includeArchived = false } = {}) {
  return prisma.serviceItem.findMany({
    where: { profileId, ...(includeArchived ? {} : { archived: false }) },
    orderBy: { name: "asc" },
  });
}

export async function getServiceItem(itemId: string) {
  return prisma.serviceItem.findUnique({ where: { id: itemId } });
}

function toData(values: ServiceItemFormValues) {
  const parsed = serviceItemFormSchema.parse(values);
  return {
    name: parsed.name,
    description: parsed.description || null,
    unitPriceCents: toCents(parsed.unitPrice),
    unit: parsed.unit,
    category: parsed.category || null,
  };
}

export async function createServiceItem(
  profileId: string,
  profileSlug: string,
  values: ServiceItemFormValues,
) {
  await prisma.serviceItem.create({ data: { profileId, ...toData(values) } });
  revalidatePath(`/p/${profileSlug}/catalogue`);
  redirect(`/p/${profileSlug}/catalogue`);
}

export async function updateServiceItem(
  itemId: string,
  profileSlug: string,
  values: ServiceItemFormValues,
) {
  await prisma.serviceItem.update({ where: { id: itemId }, data: toData(values) });
  revalidatePath(`/p/${profileSlug}/catalogue`);
  redirect(`/p/${profileSlug}/catalogue`);
}

export async function setServiceItemArchived(
  itemId: string,
  profileSlug: string,
  archived: boolean,
) {
  await prisma.serviceItem.update({ where: { id: itemId }, data: { archived } });
  revalidatePath(`/p/${profileSlug}/catalogue`);
}
