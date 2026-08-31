interface Bucket {
  count: number;
  resetAt: number;
}

const globalForLoanRateLimit = globalThis as unknown as {
  loanSimulationBuckets?: Map<string, Bucket>;
};

const buckets = globalForLoanRateLimit.loanSimulationBuckets ?? new Map<string, Bucket>();
if (process.env.NODE_ENV !== "production") globalForLoanRateLimit.loanSimulationBuckets = buckets;

// This is a defensive per-instance limit. Production deployments should also
// enforce a distributed edge/WAF limit because serverless instances do not
// share memory with one another.
export function checkSimulationRateLimit(key: string, limit = 20, windowMs = 60_000) {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }
  if (current.count >= limit) {
    return { allowed: false, remaining: 0, retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) };
  }
  current.count += 1;
  return { allowed: true, remaining: limit - current.count, retryAfterSeconds: 0 };
}
