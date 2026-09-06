# RECCU-CAM Digital Apex Platform operations

## Deployment

1. Configure `DATABASE_URL`, Clerk keys, and the public site URL from `.env.example`.
2. Apply committed database changes with `pnpm exec prisma migrate deploy`.
3. Configure Clerk's session token template to include public metadata:

```json
{ "metadata": "{{user.public_metadata}}" }
```

4. Keep Clerk sign-ups enabled when public account creation is required. Registration never assigns an application role automatically.
5. Build with `pnpm build` and deploy. Production builds cannot activate the local demo bypass and contain no hard-coded password.

## Demo users

Create test users in the Clerk development instance. Assign roles in trusted `publicMetadata`; never let the browser choose a role.

Admin demo metadata:

```json
{ "role": "super_admin" }
```

Affiliate demo metadata (use a real `Affiliate.id`, name, and code from the database):

```json
{
  "role": "affiliate_user",
  "affiliateId": "<affiliate-database-id>",
  "affiliateName": "<verified-institution-name>",
  "affiliateCode": "<verified-code>"
}
```

Supported staff roles are `super_admin`, `admin`, `communications`, `network_manager`, `compliance_officer`, `training_manager`, and `editor`. Affiliate accounts must use `affiliate_user`; the legacy `credit_union` value no longer grants protected access.

## Account lifecycle

The public website exposes Clerk account creation at `/sign-up`. New accounts
receive no application role and therefore cannot access staff or affiliate
workspaces. An authorized administrator separately assigns the trusted
`publicMetadata.role` (plus a verified `affiliateId` for an affiliate). The
user is then routed server-side to the appropriate workspace. Accounts without
a recognized role are sent to the no-index `/access-denied` page and never
receive dashboard access.

The legacy `/signup` URL redirects to the canonical `/sign-up` route.

## Security boundaries

- Public pages and submission endpoints do not require Clerk.
- `/affiliate-portal/*` and `/api/affiliate-portal/*` require an affiliate role and institution assignment.
- `/admin/*` and `/api/admin/*` require a staff role plus the module permission in `src/proxy.ts`.
- Server Actions repeat permission checks before every write.
- Clerk owns credentials; administrators cannot read passwords.

## Executive proposal mode

For local development only, `NEXT_PUBLIC_DEMO_MODE=true` makes read-only
`/admin` page requests available without Clerk. The interface uses a simulated
`RECCU-CAM Demo Administrator`, while API routes and Server Actions retain
their normal authentication and permission checks.

Proposal mode is fail-closed and requires both the exact lowercase value
`true` and `NODE_ENV=development`. Production and test builds ignore the flag,
even if it is accidentally configured. Affiliate Portal access always requires
a real affiliate identity.
- There is no core-banking connection, transaction processing, or financial credential storage.
- Public forms are validated and locally rate limited. Production should add a shared edge/WAF limiter and bot protection.
- Restricted documents require private storage and short-lived authorized downloads before production use.

## Content workflow

Homepage content supports draft and publish states. Published changes invalidate the public route. Organization settings feed verified phone, email, address, office hours, and footer content into the public site. News, notices, VTIME programs, and Knowledge Centre documents retain explicit publication controls.

## Storage

The existing Supabase upload integrations operate only when their server-side environment variables are configured. Media Library entries marked `metadata-only` are records, not claims that a file was uploaded. Configure malware scanning and quarantine before accepting high-risk production documents.
