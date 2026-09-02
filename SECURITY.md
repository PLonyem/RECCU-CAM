# Security boundaries

RECCU-CAM currently uses Clerk for authentication. The `/admin`,
`/dashboard`, and `/affiliate-portal` route families are private; public site,
metadata, static-asset, and intentionally public API routes remain accessible
without a session. Private API handlers retain server-side identity and legacy
role checks in addition to the Proxy boundary.

The production roles declared in `src/lib/auth/roles.ts` are an extension
blueprint, not active RBAC. Only the existing Clerk roles `admin` and
`credit_union` are admitted today. Specialist roles must remain denied until
authoritative Clerk assignments, endpoint-level permissions, audit logging,
and tests are implemented.

Public form rate limiting is memory-backed per server instance. Deployments
should add a shared edge/WAF limiter and CAPTCHA before high-volume use. A
strict Content Security Policy is also deferred until Clerk, Leaflet, image,
font, and any analytics sources have been inventoried and a nonce-based policy
has been exercised in report-only mode.

Uploaded chapter documents use a private storage bucket and short-lived signed
URLs. Hero images use a separate public image bucket. File signatures, MIME
allowlists, canonical generated names, and size limits are enforced before
storage, but production malware scanning and quarantine remain future work.

No code in this application connects to an affiliate core-banking database or
executes financial transfers. Any such integration requires a separate threat
model, isolated service/API boundary, credential management, audit trail, and
security review.

Never commit `.env` files or expose server credentials through a
`NEXT_PUBLIC_` variable. Rotate a credential outside the repository if there is
ever evidence it was committed or logged.
