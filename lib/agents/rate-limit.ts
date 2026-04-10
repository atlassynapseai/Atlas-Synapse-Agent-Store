type RateLimitRecord = {
  count: number
  resetAt: number
}

type RateLimitResult = {
  allowed: boolean
  remaining: number
  resetAt: number
}

const globalStore = globalThis as typeof globalThis & {
  __atlasAgentRateLimitStore?: Map<string, RateLimitRecord>
}

const store = globalStore.__atlasAgentRateLimitStore ?? new Map<string, RateLimitRecord>()
globalStore.__atlasAgentRateLimitStore = store

export function checkRateLimit({
  key,
  limit,
  windowMs,
}: {
  key: string
  limit: number
  windowMs: number
}): RateLimitResult {
  const now = Date.now()
  const existing = store.get(key)

  if (!existing || existing.resetAt <= now) {
    const next = { count: 1, resetAt: now + windowMs }
    store.set(key, next)
    return { allowed: true, remaining: Math.max(limit - 1, 0), resetAt: next.resetAt }
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt }
  }

  existing.count += 1
  store.set(key, existing)

  return {
    allowed: true,
    remaining: Math.max(limit - existing.count, 0),
    resetAt: existing.resetAt,
  }
}
