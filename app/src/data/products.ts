// Type re-exports kept for backward compatibility; actual data flows through lib/api.ts.
export type { Product } from '../lib/api'
export type ProductCategory = 'all' | 'bread' | 'sweet' | 'fruit'

export const categoryColors: Record<Exclude<ProductCategory, 'all'>, string> = {
  bread: '#d97706',
  sweet: '#be123c',
  fruit: '#059669',
}

export const categoryBg: Record<Exclude<ProductCategory, 'all'>, string> = {
  bread: 'bg-amber-100 text-amber-800',
  sweet: 'bg-rose-100 text-rose-800',
  fruit: 'bg-emerald-100 text-emerald-800',
}
