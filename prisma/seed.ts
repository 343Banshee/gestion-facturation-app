import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const devProfile = await prisma.profile.upsert({
    where: { slug: "dev-web" },
    update: {},
    create: {
      slug: "dev-web",
      name: "Développement Web",
      companyName: "Camille Dupont",
      addressLine1: "12 rue de la République",
      postalCode: "75011",
      city: "Paris",
      siret: "12345678900012",
      email: "contact@example.com",
      iban: "FR76 1234 5678 9012 3456 7890 123",
      bic: "BNPAFRPPXXX",
      defaultLanguage: "FR",
      urssafPeriodicity: "QUARTERLY",
      urssafRatePresetKey: "BIC_SERVICES",
      urssafCotisationRateBps: 2120,
      clients: {
        create: [
          {
            name: "Acme Corp",
            addressLine1: "1 avenue des Champs-Élysées",
            postalCode: "75008",
            city: "Paris",
            email: "contact@acme.example",
            siret: "98765432100011",
            preferredLanguage: "FR",
          },
          {
            name: "Globex Inc.",
            addressLine1: "221B Baker Street",
            postalCode: "NW16XE",
            city: "London",
            country: "United Kingdom",
            email: "hello@globex.example",
            preferredLanguage: "EN",
          },
        ],
      },
      serviceItems: {
        create: [
          {
            name: "Développement site vitrine",
            description: "Forfait création site vitrine sur-mesure",
            unitPriceCents: 150000,
            unit: "forfait",
            category: "Développement",
          },
          {
            name: "Journée de développement",
            description: "Prestation de développement à la journée",
            unitPriceCents: 55000,
            unit: "jour",
            category: "Développement",
          },
          {
            name: "Maintenance mensuelle",
            description: "Forfait maintenance et support",
            unitPriceCents: 20000,
            unit: "mois",
            category: "Maintenance",
          },
        ],
      },
    },
  });

  console.log("Profil de démonstration créé :", devProfile.slug);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
