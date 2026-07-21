# Gestion facturation

Application locale de gestion de devis et factures pour freelance (auto-entrepreneur,
franchise en base de TVA). Multi-profils, PDF bilingue FR/EN, suivi des paiements et
calculateur d'aide à la déclaration URSSAF.

L'app tourne **entièrement en local sur ta machine** : pas de compte, pas de cloud,
toutes les données (clients, devis, factures) restent dans un simple fichier sur ton
ordinateur. Rien n'est envoyé nulle part.

## Installation (pour les testeurs)

Il te faut deux choses avant de commencer : **Node.js** (le moteur qui fait tourner
l'app) et **le code de l'application**. Compte 10 minutes la première fois.

### 1. Installer Node.js

- Va sur **[nodejs.org](https://nodejs.org)**
- Télécharge la version **LTS** (le gros bouton recommandé) et installe-la normalement
  (double-clique, "Suivant" partout)
- Vérifie que ça a marché en ouvrant un terminal :
  - **Mac** : Cmd+Espace, tape `Terminal`, Entrée
  - **Windows** : touche Windows, tape `PowerShell`, Entrée
  - Puis tape `node -v` et Entrée → tu dois voir un numéro de version (ex. `v22.x.x`)

### 2. Récupérer le code

Deux options selon comment tu l'as reçu :

- **On t'a envoyé un lien GitHub** (repo privé, il faut être invité dessus) :
  clique sur le bouton vert `Code` → `Download ZIP`, puis décompresse le dossier
  quelque part (ex. Bureau).
- **On t'a envoyé un dossier/ZIP directement** (mail, clé USB, cloud) : décompresse-le
  simplement.

Note le chemin du dossier obtenu (ex. `Bureau/gestion-facturation-app`), tu en as
besoin juste après.

### 3. Ouvrir un terminal dans le dossier

- **Mac** : ouvre le Terminal (Cmd+Espace → `Terminal`), tape `cd ` (avec l'espace,
  sans Entrée), glisse le dossier depuis le Finder dans la fenêtre du Terminal, puis
  appuie sur Entrée.
- **Windows** : ouvre le dossier dans l'explorateur de fichiers, clique dans la barre
  d'adresse en haut (là où le chemin est écrit), tape `powershell` et appuie sur
  Entrée — un terminal s'ouvre directement dans ce dossier.

### 4. Installer et lancer

Dans ce terminal, colle ces commandes **une par une** (Entrée après chacune, attends
qu'elle finisse avant la suivante) :

```bash
npm install
```

*(télécharge tout ce dont l'app a besoin — peut prendre 1-2 minutes, c'est normal)*

```bash
cp .env.example .env
```

*(sur Windows, si `cp` ne fonctionne pas, utilise plutôt : `copy .env.example .env`)*

```bash
npx prisma migrate deploy
```

*(crée la base de données locale, un simple fichier `dev.db` dans ce dossier)*

```bash
npm run dev
```

Laisse cette dernière fenêtre de terminal **ouverte** (l'app tourne tant qu'elle est
ouverte) et va sur **[http://localhost:3000](http://localhost:3000)** dans ton
navigateur. Tu devrais voir l'écran de sélection de profil — clique sur
"Nouveau profil" pour créer le tien et commencer.

Pour les fois suivantes, il suffit de refaire `npm run dev` dans ce dossier (plus
besoin de refaire `npm install` ni les étapes 1-3).

### Lancer / couper l'app au quotidien

**Pour lancer l'app :**
1. Ouvre un terminal dans le dossier du projet (voir étape 3 ci-dessus)
2. Tape `npm run dev` et appuie sur Entrée
3. Va sur [http://localhost:3000](http://localhost:3000) dans ton navigateur

**Pour couper l'app :**
- Retourne dans la fenêtre de terminal où elle tourne (celle qui affiche les logs) et
  appuie sur **Ctrl+C**. C'est tout — le serveur s'arrête immédiatement.
- Tu peux aussi simplement fermer la fenêtre du terminal, ça coupe l'app en même temps.
- Si tu as fermé le terminal sans faire Ctrl+C et que l'app tourne encore en arrière-plan
  (le navigateur affiche toujours le site alors qu'aucun terminal n'est ouvert), tu peux
  la forcer à s'arrêter :
  - **Mac/Linux** : `kill $(lsof -ti:3000)` dans un nouveau terminal
  - **Windows** : `netstat -ano | findstr :3000` pour trouver le PID (dernier nombre de
    la ligne), puis `taskkill /PID <le-numéro> /F`

Fermer l'app ne supprime **jamais** tes données (clients, devis, factures) — elles
restent dans le fichier `dev.db` du dossier, prêtes pour la prochaine fois que tu
relances `npm run dev`.

### Problèmes fréquents

- **`command not found: node` / `node n'est pas reconnu`** → Node.js n'est pas
  installé ou le terminal a été ouvert avant l'installation ; ferme et rouvre le
  terminal, ou réinstalle Node.js (étape 1).
- **Windows : "l'exécution de scripts est désactivée sur ce système"** → PowerShell
  bloque `npm` par défaut sur certains PC. Ouvre plutôt une invite de commandes
  classique (`cmd` au lieu de `powershell` à l'étape 3) et refais les commandes.
- **Le port 3000 est déjà utilisé** → une autre app tourne déjà dessus ; ferme-la, ou
  lance `npm run dev -- -p 3001` et ouvre `http://localhost:3001` à la place.
- **Tes données ont disparu après une mise à jour du code** → normalement non : le
  fichier `dev.db` et le dossier `data/uploads/` (logos) ne sont jamais touchés par
  une mise à jour du code (ils sont ignorés par git). Tu peux aussi exporter une
  sauvegarde complète de ton profil à tout moment depuis Paramètres → "Exporter mes
  données".

## Pour les développeurs

### Stack

- Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind CSS + shadcn/ui (Base UI)
- Prisma 7 + SQLite (fichier local `dev.db`, via `@prisma/adapter-better-sqlite3`)
- `@react-pdf/renderer` pour la génération de PDF
- Vitest pour les tests unitaires

### Démarrer

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

### Base de données

```bash
npx prisma migrate dev    # appliquer les migrations (dev)
npx prisma migrate deploy # appliquer les migrations (sans prompt, pour un premier setup)
npx prisma db seed        # (re)générer des données de démonstration
npx prisma studio         # explorer les données
```

### Tests

```bash
npm test
npm run lint
npx tsc --noEmit
```

### Sauvegarde

L'app est locale — `dev.db` et `data/uploads/` (logos) sont la seule copie des
données tant qu'aucun hébergement n'est configuré.

```bash
npm run backup
```

Crée une archive horodatée dans `backups/` (à copier ailleurs : Time Machine, cloud...).

### Structure

- `src/app/p/[profileSlug]/` — pages de l'app par profil (clients, catalogue, devis,
  factures, URSSAF, paramètres)
- `src/lib/actions/` — server actions (accès données)
- `src/lib/validations/` — schémas zod
- `src/components/pdf/` — templates PDF bilingues
- `prisma/schema.prisma` — modèle de données
