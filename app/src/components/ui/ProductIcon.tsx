import { Wheat, Cake, Apple, Cookie, Grape, Croissant } from 'lucide-react'
import { ProductCategory } from '../../data/products'

interface Props {
  category: Exclude<ProductCategory, 'all'>
  className?: string
  color?: string
}

const icons: Record<Exclude<ProductCategory, 'all'>, typeof Wheat> = {
  bread: Wheat,
  sweet: Cake,
  fruit: Apple,
}

const altIcons: Record<string, typeof Wheat> = {
  '3': Cake,
  '6': Cookie,
  '7': Grape,
  '5': Croissant,
  '9': Cake,
  '12': Cookie,
}

export default function ProductIcon({ category, className = 'w-12 h-12', color }: Props) {
  const Icon = icons[category]
  return (
    <Icon
      className={className}
      style={{ color: color || '#004FF1' }}
      strokeWidth={1.5}
    />
  )
}

export { altIcons }
