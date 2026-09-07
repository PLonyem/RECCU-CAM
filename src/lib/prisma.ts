import "server-only";

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  DatabaseConfigurationError,
  databaseConfigurationMessage,
  hasUsableDatabaseConfiguration,
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

function unavailablePrismaClient(): PrismaClient {
  return new Proxy({} as PrismaClient, {
    get() {
      throw new DatabaseConfigurationError();
    },
  });
}

function createPrismaClient() {
  if (!hasUsableDatabaseConfiguration(databaseConfiguration, process.env.NODE_ENV)) {
    return unavailablePrismaClient();
  }

  const adapter = new PrismaPg({ connectionString: databaseConfiguration.url! });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
