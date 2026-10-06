import { RequestHandler } from 'express'

/**
 * Minimal in-memory fixed-window limiter, keyed by client IP.
 * Enough for a single-process API; resets on restart.
 */
export function rateLimit(opts: { windowMs: number; max: number; message?: string }): RequestHandler {
  const hits = new Map<string, { count: number; resetAt: number }>()

  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of hits) if (entry.resetAt <= now) hits.delete(key)
  }, opts.windowMs).unref()

  return (req, res, next) => {
    const key = req.ip || 'unknown'
    const now = Date.now()
    let entry = hits.get(key)
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + opts.windowMs }
      hits.set(key, entry)
    }
    entry.count++
    if (entry.count > opts.max) {
      res.setHeader('Retry-After', Math.ceil((entry.resetAt - now) / 1000))
      res.status(429).json({ error: opts.message || 'Слишком много запросов, попробуйте позже' })
      return
    }
    next()
  }
}
