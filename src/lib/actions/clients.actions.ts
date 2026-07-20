"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  clientFormSchema,
  type ClientFormValues,
} from "@/lib/validations/client.schema";

export async function listClients(profileId: string, { includeArchived = false } = {}) {
  return prisma.client.findMany({
    where: { profileId, ...(includeArchived ? {} : { archived: false }) },
    orderBy: { name: "asc" },
  });
}

export async function getClient(clientId: string) {
  return prisma.client.findUnique({ where: { id: clientId } });
}

function toData(values: ClientFormValues) {
  const parsed = clientFormSchema.parse(values);
  return {
    name: parsed.name,
    contactName: parsed.contactName || null,
    addressLine1: parsed.addressLine1,
    addressLine2: parsed.addressLine2 || null,
    postalCode: parsed.postalCode,
    city: parsed.city,
    country: parsed.country,
    email: parsed.email || null,
    phone: parsed.phone || null,
    siret: parsed.siret || null,
    preferredLanguage: parsed.preferredLanguage,
    notes: parsed.notes || null,
  };
}

export async function createClient(
  profileId: string,
  profileSlug: string,
  values: ClientFormValues,
) {
  await prisma.client.create({
    data: { profileId, ...toData(values) },
  });
  revalidatePath(`/p/${profileSlug}/clients`);
  redirect(`/p/${profileSlug}/clients`);
}

export async function updateClient(
  clientId: string,
  profileSlug: string,
  values: ClientFormValues,
) {
  await prisma.client.update({
    where: { id: clientId },
    data: toData(values),
  });
  revalidatePath(`/p/${profileSlug}/clients`);
  redirect(`/p/${profileSlug}/clients`);
}

export async function setClientArchived(
  clientId: string,
  profileSlug: string,
  archived: boolean,
) {
  await prisma.client.update({ where: { id: clientId }, data: { archived } });
  revalidatePath(`/p/${profileSlug}/clients`);
}
