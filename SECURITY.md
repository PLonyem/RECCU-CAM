# Security boundaries

RECCU-CAM uses Clerk for authentication. `/admin`, `/dashboard`, `/affiliate-portal`, `/api/admin`, and `/api/affiliate-portal` are private route families. Public pages, static assets, metadata, and intentionally public submission handlers remain available without a session. Private mutations verify authorization inside Route Handlers or Server Actions as well as at the Proxy boundary.

The roles and permissions in `src/lib/auth/roles.ts` are active RBAC. Clerk public metadata is the assignment authority; signed session claims are checked server-side. Specialist roles are restricted to named modules, and only `super_admin` can manage users and roles. Legacy `credit_union` affiliate accounts remain compatible.

Public, affiliate-only, and staff-only documents are filtered server-side. Restricted production files must use private object storage and short-lived authorized delivery URLs; hiding a link is never treated as authorization.

Public form rate limiting is memory-backed per server instance. Production should add a shared edge/WAF limiter and CAPTCHA before high-volume use. A strict Content Security Policy remains deferred until Clerk, Leaflet, image, font, and analytics sources have been inventoried and a nonce-based policy has been exercised in report-only mode.

Uploaded chapter documents use a private storage bucket and short-lived signed URLs. Hero images use a separate public image bucket. File signatures, MIME allowlists, generated names, and size limits are enforced before storage. Production malware scanning and quarantine remain required work.

No code connects to an affiliate core-banking database or executes financial transfers. Any future integration requires a separate threat model, isolated service boundary, credential management, audit trail, and security review.

Never commit `.env` files or expose server credentials through a `NEXT_PUBLIC_` variable. Rotate a credential outside the repository if it may have been committed or logged.
