import { randomBytes } from "node:crypto";

// `@clerk/backend`'s ClerkAPIResponseError.errors is the documented shape
// for validation failures (e.g. "That email address is taken"), but the
// package itself is only a transitive dependency here (pulled in by
// @clerk/nextjs), not one we can import types from directly — so this
// checks the same shape structurally instead of importing the class.
// Shared by every route that creates a Clerk user (currently the
// affiliate-scoped credit union login and the general /admin/users/create
// flow) so both surface Clerk's real rejection reason the same way.
export function extractClerkErrorMessage(error: unknown): string | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "errors" in error &&
    Array.isArray((error as { errors: unknown }).errors)
  ) {
    const first = (error as { errors: { message?: string }[] }).errors[0];
    return first?.message ?? null;
  }
  return null;
}

// Base64url avoids +, /, and = so the password is safe to paste anywhere
// without escaping, and is long enough to clear Clerk's default strength
// checks without needing a "memorable" shape — it's meant to be copied
// once and handed to the new account holder, not typed by hand.
export function generateClerkPassword() {
  return randomBytes(18).toString("base64url");
}
