import { NextResponse } from "next/server";

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const globalForRequestSecurity = globalThis as unknown as {
  requestSecurityBuckets?: Map<string, RateLimitBucket>;
};

const buckets =
  globalForRequestSecurity.requestSecurityBuckets ??
  new Map<string, RateLimitBucket>();
globalForRequestSecurity.requestSecurityBuckets = buckets;

type JsonBodyResult =
  | { ok: true; data: unknown }
  | { ok: false; response: NextResponse };

export async function readBoundedJson(
  request: Request,
  maxBytes = 32 * 1024,
): Promise<JsonBodyResult> {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.startsWith("application/json")) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Content-Type must be application/json." },
        { status: 415 },
      ),
    };
  }

  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Request body is too large." },
        { status: 413 },
      ),
    };
  }

  let text: string;
  try {
    text = await request.text();
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "Invalid request body." }, { status: 400 }),
    };
  }

  if (new TextEncoder().encode(text).byteLength > maxBytes) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Request body is too large." },
        { status: 413 },
      ),
    };
  }

  try {
    return { ok: true, data: JSON.parse(text) as unknown };
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "Invalid request body." }, { status: 400 }),
    };
  }
}

export function enforceRateLimit(
  request: Request,
  options: { scope: string; limit: number; windowMs: number },
) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const clientKey = forwardedFor || request.headers.get("x-real-ip") || "anonymous";
  const key = `${options.scope}:${clientKey}`;
  const now = Date.now();
  if (buckets.size > 10_000) {
    for (const [bucketKey, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(bucketKey);
    }
    if (buckets.size > 10_000) {
      const oldestKey = buckets.keys().next().value as string | undefined;
      if (oldestKey) buckets.delete(oldestKey);
    }
  }
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return null;
  }

  if (current.count >= options.limit) {
    return NextResponse.json(
      { error: "Too many requests. Please wait and try again." },
      {
        status: 429,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": String(Math.max(1, Math.ceil((current.resetAt - now) / 1000))),
        },
      },
    );
  }

  current.count += 1;
  return null;
}

// This memory-backed limit is a defense-in-depth control per server instance.
// Production should add a shared edge/WAF limiter and CAPTCHA for sustained abuse.
