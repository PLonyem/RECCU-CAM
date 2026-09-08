import { spawnSync } from "node:child_process";

const databaseEnvironmentNames = [
  "DIRECT_URL",
  "POSTGRES_URL_NON_POOLING",
  "DATABASE_URL",
  "POSTGRES_URL",
];

const configuredName = databaseEnvironmentNames.find((name) => process.env[name]?.trim());

if (!configuredName) {
  if (process.env.POSTGRES_PRISMA_URL?.trim()) {
    console.error("[database] A pooled runtime URL is configured, but migrations require DIRECT_URL, POSTGRES_URL_NON_POOLING, DATABASE_URL, or POSTGRES_URL.");
    process.exit(1);
  }
  console.log("[database] No migration database URL is configured; skipping prisma migrate deploy.");
  process.exit(0);
}

console.log(`[database] Applying pending Prisma migrations using ${configuredName}.`);
const command = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const result = spawnSync(command, ["exec", "prisma", "migrate", "deploy"], {
  env: process.env,
  stdio: "inherit",
});

if (result.error) {
  console.error(`[database] Unable to start Prisma migration deployment: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
