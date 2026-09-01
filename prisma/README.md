# Prisma migration workflow

This repository uses pnpm and Prisma ORM 7.

- Validate the schema: `pnpm prisma validate`
- Generate the client: `pnpm prisma generate`
- Create a development migration: `pnpm prisma migrate dev --name <change>`
- Apply committed migrations in deployment: `pnpm prisma migrate deploy`

`00000000000000_init` is the baseline generated from the schema that existed
when migration history was introduced. For an existing database that already
matches that schema, inspect it first and then mark only the baseline as applied:

`pnpm prisma migrate resolve --applied 00000000000000_init`

Do not run the baseline against an existing populated database without first
confirming its schema state. The later identity migration is intentionally
guarded so it updates only known CamCCUL prototype defaults.
