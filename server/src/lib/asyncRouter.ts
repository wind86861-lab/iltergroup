import { Router, RequestHandler } from 'express'

/**
 * Express 4 does not catch rejected promises from async handlers: an unhandled
 * rejection kills the whole process. This Router forwards them to next(err) so
 * the global error handler answers instead.
 */
const METHODS = ['get', 'post', 'put', 'patch', 'delete'] as const

export function asyncRouter(): Router {
  const router = Router()
  for (const method of METHODS) {
    const original = router[method].bind(router) as (...args: unknown[]) => Router
    ;(router as any)[method] = (path: unknown, ...handlers: unknown[]) =>
      original(path, ...handlers.map(h => (typeof h === 'function' ? wrap(h as RequestHandler) : h)))
  }
  return router
}

function wrap(fn: RequestHandler): RequestHandler {
  return (req, res, next) => {
    try {
      const result = fn(req, res, next) as unknown
      if (result && typeof (result as Promise<unknown>).catch === 'function') {
        ;(result as Promise<unknown>).catch(next)
      }
    } catch (err) {
      next(err)
    }
  }
}
