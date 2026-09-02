import { z } from "zod";

export function isSafeInternalPath(value: string) {
  return (
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("\\") &&
    !/[\u0000-\u001f\u007f]/.test(value)
  );
}

export function isHttpsUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" && !parsed.username && !parsed.password;
  } catch {
    return false;
  }
}

export const internalPathSchema = z
  .string()
  .trim()
  .max(2048)
  .refine(isSafeInternalPath, "Use an internal path beginning with a single /.");

export const httpsUrlSchema = z
  .string()
  .trim()
  .max(2048)
  .refine(isHttpsUrl, "Use a valid HTTPS URL.");

export const safePublicUrlSchema = z
  .string()
  .trim()
  .max(2048)
  .refine(
    (value) => isSafeInternalPath(value) || isHttpsUrl(value),
    "Use an internal path or a valid HTTPS URL.",
  );
