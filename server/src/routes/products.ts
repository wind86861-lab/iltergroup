import { Response } from 'express'
import { prisma } from '../lib/prisma'
import { asyncRouter } from '../lib/asyncRouter'
import { imageUpload, publicPath, deleteUpload } from '../lib/uploads'
import { protect } from '../middleware/auth'
import { AuthRequest } from '../types'

const router = asyncRouter()
const upload = imageUpload({ prefix: '', maxMb: 10 })

type Lang = 'uz' | 'ru' | 'en' | 'tr'
type Localized = Record<Lang, string>

/**
 * Accept either a plain string (legacy) or a JSON-string / object describing a Localized value
 * `{ uz, ru, en, tr }`. Always store JSON-stringified Localized.
 * Plain strings are mirrored into every locale so admins can refine translations later.
 */
function normalizeLocalized(input: unknown): string {
  if (input == null) return JSON.stringify({ uz: '', ru: '', en: '', tr: '' })
  let v: unknown = input
  if (typeof v === 'string') {
    const trimmed = v.trim()
    if (trimmed.startsWith('{')) {
      try { v = JSON.parse(trimmed) } catch { /* fall through to string-mirror */ }
    }
  }
  if (typeof v === 'object' && v !== null) {
    const o = v as Partial<Localized>
    const ru = o.ru ?? ''
    return JSON.stringify({
      uz: o.uz ?? ru, ru, en: o.en ?? ru, tr: o.tr ?? ru,
    })
  }
  const s = String(v)
  return JSON.stringify({ uz: s, ru: s, en: s, tr: s })
}

const toInt = (v: unknown) => {
  const n = Math.round(Number(v))
  return Number.isFinite(n) && n >= 0 ? n : 0
}

/** Delete an image file unless another product still points at it. */
async function releaseImage(image: string | null) {
  if (!image) return
  const stillUsed = await prisma.product.count({ where: { image } })
  if (!stillUsed) deleteUpload(image)
}

router.get('/', async (_req, res: Response) => {
  const products = await prisma.product.findMany({ orderBy: { id: 'asc' } })
  res.json(products)
})

router.get('/top', async (_req, res: Response) => {
  const products = await prisma.product.findMany({ where: { isTop: true }, orderBy: { id: 'asc' } })
  res.json(products)
})

router.post('/', protect, upload.single('image'), async (req: AuthRequest, res: Response) => {
  const { name, description, label, category, gradient, iconColor, stock, price, uzumLink, features } = req.body
  const product = await prisma.product.create({
    data: {
      name: normalizeLocalized(name),
      description: normalizeLocalized(description),
      label: normalizeLocalized(label),
      category: category || '',
      gradient: gradient || 'from-amber-50 to-orange-100',
      iconColor: iconColor || '#d97706',
      image: req.file ? publicPath(req.file) : null,
      stock: toInt(stock),
      price: toInt(price),
      isTop: req.body.isTop === 'true' || req.body.isTop === true,
      uzumLink: uzumLink || null,
      features: features || null,
    },
  })
  res.status(201).json(product)
})

router.put('/:id', protect, upload.single('image'), async (req: AuthRequest, res: Response) => {
  const id = +req.params.id
  const existing = await prisma.product.findUnique({ where: { id } })
  if (!existing) {
    if (req.file) deleteUpload(publicPath(req.file))
    return void res.status(404).json({ error: 'Товар не найден' })
  }

  const { name, description, label, category, gradient, iconColor, stock, price, uzumLink, features } = req.body
  const data: Record<string, unknown> = {
    name: normalizeLocalized(name),
    description: normalizeLocalized(description),
    label: normalizeLocalized(label),
    category, gradient, iconColor,
    stock: stock !== undefined ? toInt(stock) : undefined,
    price: price !== undefined ? toInt(price) : undefined,
    isTop: req.body.isTop === 'true' || req.body.isTop === true,
    uzumLink: uzumLink || null,
    features: features || null,
  }
  if (req.file) data.image = publicPath(req.file)
  const product = await prisma.product.update({ where: { id }, data })
  if (req.file && existing.image !== product.image) await releaseImage(existing.image)
  res.json(product)
})

router.delete('/:id', protect, async (req: AuthRequest, res: Response) => {
  const product = await prisma.product.delete({ where: { id: +req.params.id } })
  await releaseImage(product.image)
  res.json({ success: true })
})

export default router
