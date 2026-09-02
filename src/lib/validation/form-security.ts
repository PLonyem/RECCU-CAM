import { z } from "zod";

export const honeypotField = z.string().trim().max(0).optional();

export function isLikelyAutomatedSubmission(body: unknown) {
  if (!body || typeof body !== "object") return false;
  const value = (body as Record<string, unknown>).companyWebsite;
  return typeof value === "string" && value.trim().length > 0;
}

export const acceptedSubmissionResponse = { success: true } as const;

const sensitiveCredentialPattern =
  /\b(password|passcode|pin|one[- ]?time password|otp|banking credential|login credential)\b/i;

export function excludesSensitiveCredentials(value: string) {
  return !sensitiveCredentialPattern.test(value);
}
