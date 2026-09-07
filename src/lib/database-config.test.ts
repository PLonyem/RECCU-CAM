import assert from "node:assert/strict";
import test from "node:test";
import {
  DatabaseConfigurationError,
  databaseConfigurationMessage,
  DIRECT_DATABASE_ENV_NAMES,
  hasUsableDatabaseConfiguration,
  resolveDatabaseUrl,
} from "./database-config";

test("prefers the canonical pooled runtime URL", () => {
  const configuration = resolveDatabaseUrl({
    DATABASE_URL: "postgresql://app:secret@db.example.test:5432/app",
    POSTGRES_PRISMA_URL: "postgresql://app:secret@pool.example.test:6543/app",
  });

  assert.equal(configuration.name, "DATABASE_URL");
  assert.equal(configuration.isLoopback, false);
});

test("supports standard Vercel Postgres runtime and direct URL aliases", () => {
  assert.equal(
    resolveDatabaseUrl({ POSTGRES_PRISMA_URL: "postgresql://app:secret@pool.example.test/app" }).name,
    "POSTGRES_PRISMA_URL",
  );
  assert.equal(
    resolveDatabaseUrl(
      { POSTGRES_URL_NON_POOLING: "postgresql://app:secret@db.example.test/app" },
      DIRECT_DATABASE_ENV_NAMES,
    ).name,
    "POSTGRES_URL_NON_POOLING",
  );
});

test("detects missing and production loopback database configuration without exposing URLs", () => {
  const missing = resolveDatabaseUrl({});
  assert.equal(
    databaseConfigurationMessage(missing, "production"),
    "No supported database connection variable is configured.",
  );

  const loopback = resolveDatabaseUrl({
    DATABASE_URL: "postgresql://admin:do-not-log@127.0.0.1:5432/reccucam",
  });
  const message = databaseConfigurationMessage(loopback, "production");
  assert.equal(loopback.isLoopback, true);
  assert.equal(message, "DATABASE_URL points to a loopback host that is unreachable from production.");
  assert.equal(message?.includes("do-not-log"), false);
});

test("rejects missing and production-loopback configuration before pg defaults to localhost", () => {
  const missing = resolveDatabaseUrl({});
  const loopback = resolveDatabaseUrl({
    DATABASE_URL: "postgresql://user:password@127.0.0.1:5432/reccucam",
  });
  const remote = resolveDatabaseUrl({
    DATABASE_URL: "postgresql://user:password@db.example.test:5432/reccucam",
  });

  assert.equal(hasUsableDatabaseConfiguration(missing, "production"), false);
  assert.equal(hasUsableDatabaseConfiguration(loopback, "production"), false);
  assert.equal(hasUsableDatabaseConfiguration(remote, "production"), true);
  assert.equal(new DatabaseConfigurationError().code, "DATABASE_CONFIGURATION_ERROR");
});
