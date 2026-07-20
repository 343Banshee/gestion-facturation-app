"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import {
  profileFormSchema,
  type ProfileFormValues,
} from "@/lib/validations/profile.schema";

export async function listProfiles() {
  return prisma.profile.findMany({ orderBy: { createdAt: "asc" } });
}

export async function getProfileBySlug(slug: string) {
  return prisma.profile.findUnique({ where: { slug } });
}

async function generateUniqueSlug(name: string) {
  const base = slugify(name) || "profil";
  let candidate = base;
  let suffix = 2;
  while (await prisma.profile.findUnique({ where: { slug: candidate } })) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

export async function createProfile(values: ProfileFormValues) {
  const parsed = profileFormSchema.parse(values);
  const slug = await generateUniqueSlug(parsed.name);

  const profile = await prisma.profile.create({
    data: {
      slug,
      name: parsed.name,
      companyName: parsed.companyName,
      addressLine1: parsed.addressLine1,
      addressLine2: parsed.addressLine2 || null,
      postalCode: parsed.postalCode,
      city: parsed.city,
      country: parsed.country,
      siret: parsed.siret,
      apeCode: parsed.apeCode || null,
      email: parsed.email,
      phone: parsed.phone || null,
      iban: parsed.iban || null,
      bic: parsed.bic || null,
      otherPaymentInstructions: parsed.otherPaymentInstructions || null,
      vatMention: parsed.vatMention,
      latePaymentPenaltyText: parsed.latePaymentPenaltyText,
      additionalLegalMentions: parsed.additionalLegalMentions || null,
      defaultLanguage: parsed.defaultLanguage,
      quoteNumberPrefix: parsed.quoteNumberPrefix,
      invoiceNumberPrefix: parsed.invoiceNumberPrefix,
      quoteValidityDays: parsed.quoteValidityDays,
      defaultPaymentTermDays: parsed.defaultPaymentTermDays,
      urssafPeriodicity: parsed.urssafPeriodicity,
      urssafRatePresetKey: parsed.urssafRatePresetKey || null,
      urssafCotisationRateBps: parsed.urssafCotisationRateBps,
      versementLiberatoireEnabled: parsed.versementLiberatoireEnabled,
      versementLiberatoireRateBps: parsed.versementLiberatoireRateBps ?? null,
    },
  });

  revalidatePath("/");
  redirect(`/p/${profile.slug}`);
}

export async function updateProfile(profileId: string, values: ProfileFormValues) {
  const parsed = profileFormSchema.parse(values);

  const profile = await prisma.profile.update({
    where: { id: profileId },
    data: {
      name: parsed.name,
      companyName: parsed.companyName,
      addressLine1: parsed.addressLine1,
      addressLine2: parsed.addressLine2 || null,
      postalCode: parsed.postalCode,
      city: parsed.city,
      country: parsed.country,
      siret: parsed.siret,
      apeCode: parsed.apeCode || null,
      email: parsed.email,
      phone: parsed.phone || null,
      iban: parsed.iban || null,
      bic: parsed.bic || null,
      otherPaymentInstructions: parsed.otherPaymentInstructions || null,
      vatMention: parsed.vatMention,
      latePaymentPenaltyText: parsed.latePaymentPenaltyText,
      additionalLegalMentions: parsed.additionalLegalMentions || null,
      defaultLanguage: parsed.defaultLanguage,
      quoteNumberPrefix: parsed.quoteNumberPrefix,
      invoiceNumberPrefix: parsed.invoiceNumberPrefix,
      quoteValidityDays: parsed.quoteValidityDays,
      defaultPaymentTermDays: parsed.defaultPaymentTermDays,
      urssafPeriodicity: parsed.urssafPeriodicity,
      urssafRatePresetKey: parsed.urssafRatePresetKey || null,
      urssafCotisationRateBps: parsed.urssafCotisationRateBps,
      versementLiberatoireEnabled: parsed.versementLiberatoireEnabled,
      versementLiberatoireRateBps: parsed.versementLiberatoireRateBps ?? null,
    },
  });

  revalidatePath(`/p/${profile.slug}`);
  revalidatePath(`/p/${profile.slug}/parametres`);
  return profile;
}
