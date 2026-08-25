/**
 * Centralized category management system
 * Categories are stored in localStorage and used throughout the app
 */
import type { Localized } from '../i18n/localized'

export interface Category {
  id: string
  name: Localized
  slug: string
  iconColor: string
  gradient: string
  order: number
}

const STORAGE_KEY = 'ilter_categories'
const STORAGE_VERSION_KEY = 'ilter_categories_v'
const CURRENT_VERSION = '2'

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'baby-food',
    name: { uz: "Bolalar ovqati", ru: "Детское питание", en: "Baby Food", tr: "Bebek mamaları" },
    slug: 'baby-food',
    iconColor: '#f97316',
    gradient: 'from-orange-50 to-amber-100',
    order: 1,
  },
  {
    id: 'sauces',
    name: { uz: "Souslar", ru: "Соусы", en: "Sauces", tr: "Soslar" },
    slug: 'sauces',
    iconColor: '#dc2626',
    gradient: 'from-red-50 to-rose-100',
    order: 2,
  },
  {
    id: 'sweets',
    name: { uz: "Shirinliklar", ru: "Сладости", en: "Sweets", tr: "Tatlılar" },
    slug: 'sweets',
    iconColor: '#9333ea',
    gradient: 'from-purple-50 to-violet-100',
    order: 3,
  },
  {
    id: 'beverages',
    name: { uz: "Ichimliklar", ru: "Напитки", en: "Beverages", tr: "İçecekler" },
    slug: 'beverages',
    iconColor: '#dc2626',
    gradient: 'from-red-50 to-red-100',
    order: 4,
  },
  {
    id: 'groceries',
    name: { uz: "Oziq-ovqat", ru: "Бакалея", en: "Groceries", tr: "Bakkaliye" },
    slug: 'groceries',
    iconColor: '#f59e0b',
    gradient: 'from-yellow-50 to-amber-100',
    order: 5,
  },
  {
    id: 'snacks',
    name: { uz: "Sneklar", ru: "Снеки", en: "Snacks", tr: "Cipsler" },
    slug: 'snacks',
    iconColor: '#eab308',
    gradient: 'from-yellow-50 to-yellow-100',
    order: 6,
  },
  {
    id: 'dairy',
    name: { uz: "Sut mahsulotlari", ru: "Молочные продукты", en: "Dairy", tr: "Süt ürünleri" },
    slug: 'dairy',
    iconColor: '#10b981',
    gradient: 'from-green-50 to-emerald-100',
    order: 7,
  },
  {
    id: 'bread',
    name: { uz: 'Non mahsulotlari', ru: 'Хлебобулочные', en: 'Bakery', tr: 'Fırın ürünleri' },
    slug: 'bread',
    iconColor: '#d97706',
    gradient: 'from-amber-50 to-orange-100',
    order: 8,
  },
  {
    id: 'fruit',
    name: { uz: 'Mevalar', ru: 'Фрукты', en: 'Fruits', tr: 'Meyveler' },
    slug: 'fruit',
    iconColor: '#059669',
    gradient: 'from-emerald-50 to-green-100',
    order: 9,
  },
]

export function getCategories(): Category[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as Category[]
      return parsed.sort((a, b) => a.order - b.order)
    }
  } catch (err) {
    console.warn('Failed to load categories from localStorage:', err)
  }
  return DEFAULT_CATEGORIES
}

export function saveCategories(categories: Category[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories))
  } catch (err) {
    console.error('Failed to save categories to localStorage:', err)
  }
}

export function getCategoryById(id: string): Category | undefined {
  return getCategories().find(c => c.id === id || c.slug === id)
}

export function getCategoryStyle(id: string): { bg: string; color: string } {
  const cat = getCategoryById(id)
  if (!cat) return { bg: '#e5e7eb', color: '#374151' }
  return {
    bg: cat.gradient,
    color: cat.iconColor,
  }
}

// Initialize default categories - reset on version change or corrupted data
if (typeof window !== 'undefined') {
  const storedVersion = localStorage.getItem(STORAGE_VERSION_KEY)
  const stored = localStorage.getItem(STORAGE_KEY)
  let needsReset = storedVersion !== CURRENT_VERSION || !stored
  if (!needsReset && stored) {
    try {
      const parsed = JSON.parse(stored) as Category[]
      // Reset if any category has a placeholder ID like cat_123... or 'test'
      if (parsed.some(c => /^cat_\d+$/.test(c.id) || c.id === 'test' || !c.slug)) {
        needsReset = true
      }
    } catch {
      needsReset = true
    }
  }
  if (needsReset) {
    localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION)
    saveCategories(DEFAULT_CATEGORIES)
  }
}
