interface RateLimitEntry {
  count: number
  windowStart: number
}

const store = new Map<string, RateLimitEntry>()

// Prune stale entries every 5 minutes to prevent unbounded memory growth.
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store) {
      if (now - entry.windowStart > 60_000) store.delete(key)
    }
  }, 5 * 60_000)
}

export function getClientIp(req: { headers: { get(name: string): string | null } }): string {
  const forwarded = req.headers.get('x-forwarded-for')
  return (forwarded ? forwarded.split(',')[0] : 'unknown').trim()
}

/**
 * Returns true if the request is within limits, false if rate-limited.
 * Uses a fixed 60-second window per IP per key.
 */
export function checkRateLimit(key: string, maxRequests: number): boolean {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now - entry.windowStart > 60_000) {
    store.set(key, { count: 1, windowStart: now })
    return true
  }

  if (entry.count >= maxRequests) return false

  entry.count++
  return true
}

export function rateLimitResponse() {
  return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
    status: 429,
    headers: { 'Content-Type': 'application/json', 'Retry-After': '60' },
  })
}
