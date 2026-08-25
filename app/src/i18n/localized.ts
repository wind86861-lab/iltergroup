import { SUPPORTED_LANGS, type Lang } from './index'

export type Localized = { uz: string; ru: string; en: string; tr: string }

export const EMPTY_LOCALIZED: Localized = { uz: '', ru: '', en: '', tr: '' }

export function isLocalized(v: unknown): v is Localized {
  return !!v && typeof v === 'object' && 'ru' in (v as object)
}

/** Wrap a plain string into a Localized object, mirroring the value into every locale.
 *  Idempotent — passing an already-localized value returns it unchanged. */
export function toLocalized(v: string | Localized | null | undefined): Localized {
  if (isLocalized(v)) {
    return {
      uz: v.uz ?? '',
      ru: v.ru ?? '',
      en: v.en ?? '',
      tr: v.tr ?? '',
    }
  }
  const s = (v ?? '').toString()
  return { uz: s, ru: s, en: s, tr: s }
}

/** Resolve a Localized value for the current language, falling back to ru, then any non-empty locale. */
export function pickLocale(v: Localized | string | null | undefined, lang: string): string {
  if (!v) return ''
  if (typeof v === 'string') return v
  const l = (lang || 'ru') as Lang
  if (SUPPORTED_LANGS.includes(l) && v[l]) return v[l]
  if (v.ru) return v.ru
  for (const k of SUPPORTED_LANGS) if (v[k]) return v[k]
  return ''
}
