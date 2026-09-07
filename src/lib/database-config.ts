export const RUNTIME_DATABASE_ENV_NAMES = [
  "DATABASE_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL",
] as const;

export const DIRECT_DATABASE_ENV_NAMES = [
  "DIRECT_URL",
  "POSTGRES_URL_NON_POOLING",
  "DATABASE_URL",
  "POSTGRES_URL",
] as const;

type DatabaseEnvironment = Readonly<Record<string, string | undefined>>;

export interface ResolvedDatabaseUrl {
  name: string | null;
  url: string | undefined;
  isLoopback: boolean;
}

export class DatabaseConfigurationError extends Error {
  readonly code = "DATABASE_CONFIGURATION_ERROR";

  constructor() {
    super("The database connection is not configured for this deployment.");
    this.name = "DatabaseConfigurationError";
  }
}

export function resolveDatabaseUrl(
  environment: DatabaseEnvironment,
  names: readonly string[] = RUNTIME_DATABASE_ENV_NAMES,
): ResolvedDatabaseUrl {
  for (const name of names) {
    const url = environment[name]?.trim();
    if (!url) continue;

    let hostname = "";
    try {
      hostname = new URL(url).hostname.toLowerCase();
    } catch {
      // Prisma supplies detailed URL validation without us logging credentials.
    }

    return {
      name,
      url,
      isLoopback: ["localhost", "127.0.0.1", "::1", "[::1]"].includes(hostname),
    };
  }

  return { name: null, url: undefined, isLoopback: false };
}

export function databaseConfigurationMessage(
  configuration: ResolvedDatabaseUrl,
  nodeEnvironment: string | undefined,
) {
  if (!configuration.url) {
    return "No supported database connection variable is configured.";
  }
  if (nodeEnvironment === "production" && configuration.isLoopback) {
    return `${configuration.name} points to a loopback host that is unreachable from production.`;
  }
  return null;
}

export function hasUsableDatabaseConfiguration(
  configuration: ResolvedDatabaseUrl,
  nodeEnvironment: string | undefined,
) {
  return databaseConfigurationMessage(configuration, nodeEnvironment) === null;
}
