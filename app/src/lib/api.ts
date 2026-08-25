/**
 * Single source of truth for talking to the IlterGroup REST API.
 * No mock data anywhere — everything goes through here.
 */
import type { Localized } from '../i18n/localized'

export const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) || ''

const TOKEN_KEY = 'ilter_admin_token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

function handleAuthError(status: number) {
  if (status === 401 && typeof window !== 'undefined') {
    clearToken()
    window.location.href = '/admin/login'
  }
}

/* ── Simple GET cache (deduplicates parallel requests, 30s TTL) ── */
const cache = new Map<string, { promise: Promise<unknown>; ts: number }>()
const CACHE_TTL = 30000 // 30 seconds

async function request<T>(
  path: string,
  init: RequestInit = {},
  auth = false,
): Promise<T> {
  const isGet = !init.method || init.method === 'GET'
  const cacheKey = isGet ? `${path}:${JSON.stringify(init.headers || {})}` : ''

  // Return cached promise for identical GET within TTL
  if (isGet && cache.has(cacheKey)) {
    const entry = cache.get(cacheKey)!
    if (Date.now() - entry.ts < CACHE_TTL) {
      return entry.promise as Promise<T>
    }
    cache.delete(cacheKey)
  }

  const headers = new Headers(init.headers)
  if (auth) {
    const token = getToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }
  if (init.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const promise = fetch(`${API_BASE}${path}`, { ...init, headers }).then(async res => {
    if (!res.ok) {
      handleAuthError(res.status)
      let msg = res.statusText
      try { const j = await res.json(); msg = j.error || msg } catch { /* ignore */ }
      throw new Error(msg)
    }
    if (res.status === 204) return undefined as T
    return res.json() as Promise<T>
  })

  if (isGet) {
    cache.set(cacheKey, { promise, ts: Date.now() })
  } else {
    // Invalidate all GET cache entries on mutation so lists refresh immediately
    const basePath = path.split('?')[0].replace(/\/\d+$/, '')
    for (const key of cache.keys()) {
      if (key.startsWith(basePath)) cache.delete(key)
    }
  }
  return promise as Promise<T>
}

export const resolveUpload = (image: string | null | undefined): string | null => {
  if (!image) return null
  if (image.startsWith('http') || image.startsWith('data:')) return image
  return `${API_BASE}${image}`
}

/* ── Types as returned by the API ── */

export interface ApiProduct {
  id: number
  name: string         // JSON-stringified Localized
  description: string  // JSON-stringified Localized
  label: string        // JSON-stringified Localized
  category: string
  gradient: string
  iconColor: string
  image: string | null
  stock: number
  price: number
  uzumLink?: string | null
  features?: string | null  // JSON-stringified Localized[]
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: number
  name: Localized
  description: Localized
  label: Localized
  category: string
  gradient: string
  iconColor: string
  image: string | null
  stock: number
  price: number
  isTop: boolean
  uzumLink?: string
  features: Localized[]
  createdAt: string
  updatedAt: string
}

export interface ApiOrderItem {
  productId: number | string
  name: string
  qty: number
  price: number
}

export interface ApiOrder {
  id: number
  customer: string
  phone: string
  email: string
  items: ApiOrderItem[]
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  notes: string
  createdAt: string
  updatedAt: string
}

export interface ApiMessage {
  id: number
  name: string
  phone: string
  comment: string
  isRead: boolean
  createdAt: string
}

/* ── Localized helpers ── */

function parseLocalized(raw: string): Localized {
  if (!raw) return { uz: '', ru: '', en: '', tr: '' }
  if (raw[0] === '{') {
    try {
      const v = JSON.parse(raw) as Partial<Localized>
      const ru = v.ru ?? ''
      return { uz: v.uz ?? ru, ru, en: v.en ?? ru, tr: v.tr ?? ru }
    } catch { /* fall through */ }
  }
  return { uz: raw, ru: raw, en: raw, tr: raw }
}

function fromApi(p: ApiProduct): Product {
  let features: Localized[] = []
  if (p.features) {
    try {
      const parsed = JSON.parse(p.features)
      features = Array.isArray(parsed) ? parsed.map((f: string | Localized) =>
        typeof f === 'string' ? parseLocalized(f) : f
      ) : []
    } catch {
      features = []
    }
  }
  return {
    ...p,
    name: parseLocalized(p.name),
    description: parseLocalized(p.description),
    label: parseLocalized(p.label),
    category: p.category,
    isTop: (p as any).isTop ?? false,
    uzumLink: p.uzumLink || undefined,
    features,
  }
}

/* ── Auth ── */

export async function login(email: string, password: string): Promise<{ token: string; admin: { id: number; email: string; name: string } }> {
  const res = await request<{ token: string; admin: { id: number; email: string; name: string } }>(
    '/api/auth/login',
    { method: 'POST', body: JSON.stringify({ email, password }) },
  )
  setToken(res.token)
  return res
}

export const logout = () => clearToken()
export const isAuthenticated = () => !!getToken()

/* ── Products ── */

export async function fetchProducts(): Promise<Product[]> {
  try {
    const list = await request<ApiProduct[]>('/api/products')
    return list.map(fromApi)
  } catch (err) {
    console.warn('API unavailable, using fallback data:', err)
    const { FALLBACK_PRODUCTS } = await import('./fallback')
    return FALLBACK_PRODUCTS
  }
}

export interface ProductInput {
  name: Localized
  description: Localized
  label: Localized
  category: string
  gradient: string
  iconColor: string
  stock: number
  price: number
  isTop?: boolean
  image?: File | null
  uzumLink?: string
  features: Localized[]
}

function toFormData(input: ProductInput): FormData {
  const fd = new FormData()
  fd.append('name', JSON.stringify(input.name))
  fd.append('description', JSON.stringify(input.description))
  fd.append('label', JSON.stringify(input.label))
  fd.append('category', input.category)
  fd.append('gradient', input.gradient)
  fd.append('iconColor', input.iconColor)
  fd.append('stock', String(input.stock))
  fd.append('price', String(input.price))
  fd.append('isTop', input.isTop ? 'true' : 'false')
  if (input.image) fd.append('image', input.image)
  fd.append('uzumLink', input.uzumLink || '')
  fd.append('features', JSON.stringify(input.features))
  return fd
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const p = await request<ApiProduct>('/api/products', { method: 'POST', body: toFormData(input) }, true)
  return fromApi(p)
}

export async function updateProduct(id: number, input: ProductInput): Promise<Product> {
  const p = await request<ApiProduct>(`/api/products/${id}`, { method: 'PUT', body: toFormData(input) }, true)
  return fromApi(p)
}

export async function fetchTopProducts(): Promise<Product[]> {
  try {
    const list = await request<ApiProduct[]>('/api/products/top')
    return list.map(fromApi)
  } catch {
    return []
  }
}

export async function deleteProduct(id: number): Promise<void> {
  await request<{ success: boolean }>(`/api/products/${id}`, { method: 'DELETE' }, true)
}

/* ── Orders ── */

export async function fetchOrders(): Promise<ApiOrder[]> {
  return request<ApiOrder[]>('/api/orders', {}, true)
}

export async function createOrder(payload: {
  customer: string; phone: string; email?: string;
  items: ApiOrderItem[]; total: number; notes?: string;
}): Promise<ApiOrder> {
  return request<ApiOrder>('/api/orders', {
    method: 'POST', body: JSON.stringify(payload),
  })
}

export async function updateOrderStatus(id: number, status: ApiOrder['status']): Promise<ApiOrder> {
  return request<ApiOrder>(`/api/orders/${id}/status`, {
    method: 'PATCH', body: JSON.stringify({ status }),
  }, true)
}

export async function deleteOrder(id: number): Promise<void> {
  await request<{ success: boolean }>(`/api/orders/${id}`, { method: 'DELETE' }, true)
}

/* ── Catalog ── */

export interface CatalogInfo {
  exists: boolean
  url?: string
  updatedAt?: string
  size?: number
}

export async function fetchCatalog(): Promise<CatalogInfo> {
  return request<CatalogInfo>('/api/catalog')
}

export async function uploadCatalog(file: File): Promise<CatalogInfo> {
  const fd = new FormData()
  fd.append('file', file)
  return request<CatalogInfo>('/api/catalog/upload', { method: 'POST', body: fd }, true)
}

export async function deleteCatalog(): Promise<CatalogInfo> {
  return request<CatalogInfo>('/api/catalog', { method: 'DELETE' }, true)
}

/* ── Steps ── */
export interface ApiStep { id: number; num: number; icon: string; title: string | Localized; text: string | Localized }
export async function fetchSteps(): Promise<ApiStep[]> { return request<ApiStep[]>('/api/steps') }
export async function createStep(data: Partial<ApiStep>): Promise<ApiStep> { return request<ApiStep>('/api/steps', { method: 'POST', body: JSON.stringify(data) }, true) }
export async function updateStep(id: number, data: Partial<ApiStep>): Promise<ApiStep> { return request<ApiStep>(`/api/steps/${id}`, { method: 'PUT', body: JSON.stringify(data) }, true) }
export async function deleteStep(id: number): Promise<void> { await request<{ success: boolean }>(`/api/steps/${id}`, { method: 'DELETE' }, true) }

/* ── Partners ── */
export interface ApiPartner { id: number; name: string; type: string; color: string; image: string; order: number; createdAt: string; updatedAt: string }
export async function fetchPartners(): Promise<ApiPartner[]> { return request<ApiPartner[]>('/api/partners') }
export async function createPartner(formData: FormData): Promise<ApiPartner> { return request<ApiPartner>('/api/partners', { method: 'POST', body: formData }, true) }
export async function updatePartner(id: number, formData: FormData): Promise<ApiPartner> { return request<ApiPartner>(`/api/partners/${id}`, { method: 'PUT', body: formData }, true) }
export async function deletePartner(id: number): Promise<void> { await request<{ success: boolean }>(`/api/partners/${id}`, { method: 'DELETE' }, true) }

/* ── Site Config ── */
export interface SiteConfig { id: number; phone: string; email: string; address: string; tagline: string; updatedAt: string }
export interface FooterLink { id: number; label: string; href: string; column: string; order: number; createdAt: string }
export async function fetchSiteConfig(): Promise<SiteConfig> { return request<SiteConfig>('/api/site/config') }
export async function updateSiteConfig(data: Partial<SiteConfig>): Promise<SiteConfig> { return request<SiteConfig>('/api/site/config', { method: 'PUT', body: JSON.stringify(data) }, true) }
export async function fetchFooterLinks(): Promise<FooterLink[]> { return request<FooterLink[]>('/api/site/footer-links') }
export async function createFooterLink(data: Partial<FooterLink>): Promise<FooterLink> { return request<FooterLink>('/api/site/footer-links', { method: 'POST', body: JSON.stringify(data) }, true) }
export async function updateFooterLink(id: number, data: Partial<FooterLink>): Promise<FooterLink> { return request<FooterLink>(`/api/site/footer-links/${id}`, { method: 'PUT', body: JSON.stringify(data) }, true) }
export async function deleteFooterLink(id: number): Promise<void> { await request<{ success: boolean }>(`/api/site/footer-links/${id}`, { method: 'DELETE' }, true) }

/* ── Benefits ── */
export interface ApiBenefit { id: number; icon: string; title: string | Localized; text: string | Localized; color: string; order: number }
export async function fetchBenefits(): Promise<ApiBenefit[]> { return request<ApiBenefit[]>('/api/benefits') }
export async function createBenefit(data: Partial<ApiBenefit>): Promise<ApiBenefit> { return request<ApiBenefit>('/api/benefits', { method: 'POST', body: JSON.stringify(data) }, true) }
export async function updateBenefit(id: number, data: Partial<ApiBenefit>): Promise<ApiBenefit> { return request<ApiBenefit>(`/api/benefits/${id}`, { method: 'PUT', body: JSON.stringify(data) }, true) }
export async function deleteBenefit(id: number): Promise<void> { await request<{ success: boolean }>(`/api/benefits/${id}`, { method: 'DELETE' }, true) }

/* ── Section Texts ── */
export interface SectionTextMap { [key: string]: Record<string, string> }
export async function fetchSectionTexts(): Promise<SectionTextMap> { return request<SectionTextMap>('/api/sections') }
export async function updateSectionText(key: string, text: Record<string, string>): Promise<void> { await request<void>(`/api/sections/${key}`, { method: 'PUT', body: JSON.stringify({ text }) }, true) }

/* ── Messages ── */

export async function fetchMessages(): Promise<ApiMessage[]> {
  return request<ApiMessage[]>('/api/messages', {}, true)
}

export async function createMessage(payload: { name: string; phone: string; comment: string }): Promise<ApiMessage> {
  return request<ApiMessage>('/api/messages', { method: 'POST', body: JSON.stringify(payload) })
}

export async function setMessageRead(id: number, isRead: boolean): Promise<ApiMessage> {
  return request<ApiMessage>(`/api/messages/${id}/read`, {
    method: 'PATCH', body: JSON.stringify({ isRead }),
  }, true)
}

export async function deleteMessage(id: number): Promise<void> {
  await request<{ success: boolean }>(`/api/messages/${id}`, { method: 'DELETE' }, true)
}
