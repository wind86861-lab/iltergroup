/**
 * Product categories, stored on the server (`/api/categories`).
 * A product references its category by `slug` (Product.category).
 */
import type { Localized } from '../i18n/localized'
import { API_BASE, getToken } from './api'

export interface Category {
  id: number
  name: Localized
  slug: string
  iconColor: string
  gradient: string
  order: number
}

export type CategoryInput = Omit<Category, 'id'>

// Last list fetched from the API, so render-time lookups by slug stay synchronous.
let cache: Category[] = []

// Older builds kept categories in the browser only; drop that stale copy.
try {
  localStorage.removeItem('ilter_categories')
  localStorage.removeItem('ilter_categories_v')
} catch { /* storage unavailable */ }

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  if (init.body) headers.set('Content-Type', 'application/json')
  const token = getToken()
  if (token && init.method && init.method !== 'GET') headers.set('Authorization', `Bearer ${token}`)
  const res = await fetch(`${API_BASE}/api/categories${path}`, { ...init, headers })
  if (!res.ok) {
    let msg = res.statusText
    try { msg = (await res.json()).error || msg } catch { /* ignore */ }
    throw new Error(msg)
  }
  return res.json() as Promise<T>
}

export async function loadCategories(): Promise<Category[]> {
  try {
    cache = await call<Category[]>('')
  } catch (err) {
    console.warn('Failed to load categories:', err)
  }
  return cache
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  const c = await call<Category>('', { method: 'POST', body: JSON.stringify(input) })
  cache = [...cache, c]
  return c
}

export async function updateCategory(id: number, input: CategoryInput): Promise<Category> {
  const c = await call<Category>(`/${id}`, { method: 'PUT', body: JSON.stringify(input) })
  cache = cache.map(x => (x.id === id ? c : x))
  return c
}

export async function deleteCategory(id: number): Promise<void> {
  await call<{ success: boolean }>(`/${id}`, { method: 'DELETE' })
  cache = cache.filter(x => x.id !== id)
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return cache.find(c => c.slug === slug)
}
