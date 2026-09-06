import "server-only";

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  databaseConfigurationMessage,
  resolveDatabaseUrl,
} from "@/lib/database-config";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const databaseConfiguration = resolveDatabaseUrl(process.env);
const configurationMessage = databaseConfigurationMessage(
  databaseConfiguration,
  process.env.NODE_ENV,
);

if (configurationMessage) {
  console.error(`[database] ${configurationMessage}`);
}

const adapter = new PrismaPg({ connectionString: databaseConfiguration.url });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
