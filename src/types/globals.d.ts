export {};

// role is "admin" or "credit_union"; the affiliate* fields are only ever
// set for "credit_union" accounts — a chapter's own affiliate, assigned by
// an admin via the Clerk Dashboard's publicMetadata editor, never chosen by
// the user themselves. Both interfaces describe the same shape because
// Clerk types the JWT session claims and the User resource separately:
// CustomJwtSessionClaims is what `auth()` (proxy/server/API routes) reads
// from the signed session token — requires the Dashboard's session token
// customization (Configure > Sessions > Customize session token) to include
// `{ "metadata": "{{user.public_metadata}}" }`, or `sessionClaims.metadata`
// will always be undefined. UserPublicMetadata is what `useUser()`
// (client components) and `currentUser()` (server) read directly off the
// user object — no Dashboard configuration needed for that path.
declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: "admin" | "credit_union";
      affiliateId?: string;
      affiliateName?: string;
      affiliateCode?: string;
      chapter?: string;
    };
  }

  interface UserPublicMetadata {
    role?: "admin" | "credit_union";
    affiliateId?: string;
    affiliateName?: string;
    affiliateCode?: string;
    chapter?: string;
  }
}
