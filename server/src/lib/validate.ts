/** Trimmed string of at most `max` chars, or null if missing/empty/not a string. */
export function str(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null
  const s = v.trim()
  return s ? s.slice(0, max) : null
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}
