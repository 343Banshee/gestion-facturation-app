#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const dbPath = path.join(root, "dev.db");

if (!existsSync(dbPath)) {
  console.error("Aucune base de données trouvée (dev.db). Rien à sauvegarder.");
  process.exit(1);
}

const backupsDir = path.join(root, "backups");
mkdirSync(backupsDir, { recursive: true });

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const archivePath = path.join(backupsDir, `backup-${timestamp}.zip`);

const filesToBackup = ["dev.db"];
if (existsSync(path.join(root, "data", "uploads"))) {
  filesToBackup.push("data/uploads");
}

execFileSync("zip", ["-r", archivePath, ...filesToBackup], { cwd: root, stdio: "inherit" });

console.log(`\nSauvegarde créée : ${path.relative(root, archivePath)}`);
console.log("Conserve ce fichier en lieu sûr (ex : Time Machine, cloud) — c'est ta seule copie tant que l'app reste locale.");
