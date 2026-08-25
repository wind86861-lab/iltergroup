import imgBread from '../img/image copy.png'
import imgSweet from '../img/image copy 2.png'
import imgFruit from '../img/image copy 3.png'
import { resolveUpload, type Product } from './api'

export const FALLBACK_IMAGES: Record<string, string> = {
  bread: imgBread,
  sweet: imgSweet,
  fruit: imgFruit,
}

export function productImage(p: Pick<Product, 'image' | 'category'>): string {
  const url = resolveUpload(p.image)
  return url || FALLBACK_IMAGES[p.category] || imgBread
}
