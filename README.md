# Gestion facturation

Application locale de gestion de devis et factures pour freelance (auto-entrepreneur,
franchise en base de TVA). Multi-profils, PDF bilingue FR/EN, suivi des paiements et
calculateur d'aide à la déclaration URSSAF.

## Stack

- Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind CSS + shadcn/ui (Base UI)
- Prisma 7 + SQLite (fichier local `dev.db`, via `@prisma/adapter-better-sqlite3`)
- `@react-pdf/renderer` pour la génération de PDF
- Vitest pour les tests unitaires

## Démarrer

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Base de données

```bash
npx prisma migrate dev   # appliquer les migrations
npx prisma db seed       # (re)générer les données de démonstration
npx prisma studio        # explorer les données
```

## Tests

```bash
npm test
```

## Sauvegarde

L'app est locale — `dev.db` et `data/uploads/` (logos) sont la seule copie des
données tant qu'aucun hébergement n'est configuré.

```bash
npm run backup
```

Crée une archive horodatée dans `backups/` (à copier ailleurs : Time Machine, cloud...).

## Structure

- `src/app/p/[profileSlug]/` — pages de l'app par profil (clients, catalogue, devis,
  factures, URSSAF, paramètres)
- `src/lib/actions/` — server actions (accès données)
- `src/lib/validations/` — schémas zod
- `src/components/pdf/` — templates PDF bilingues
- `prisma/schema.prisma` — modèle de données
