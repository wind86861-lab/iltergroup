import { Router, Response } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { PrismaClient } from '@prisma/client'
import { protect } from '../middleware/auth'
import { AuthRequest } from '../types'

const router = Router()
const prisma = new PrismaClient()

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(__dirname, '../../uploads')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`),
})
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } })

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

router.get('/', async (_req, res: Response) => {
  try {
    const products = await prisma.product.findMany({ orderBy: { id: 'asc' } })
    res.json(products)
  } catch (err) {
    console.error('GET /products error:', err)
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

router.get('/top', async (_req, res: Response) => {
  try {
    const products = await prisma.product.findMany({ where: { isTop: true }, orderBy: { id: 'asc' } })
    res.json(products)
  } catch (err) {
    console.error('GET /products/top error:', err)
    res.status(500).json({ error: 'Failed to fetch top products' })
  }
})

router.post('/', protect, upload.single('image'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, label, category, gradient, iconColor, stock, price, uzumLink, features } = req.body
    const image = req.file ? `/uploads/${req.file.filename}` : null
    const product = await prisma.product.create({
      data: {
        name: normalizeLocalized(name),
        description: normalizeLocalized(description),
        label: normalizeLocalized(label),
        category: category || '',
        gradient: gradient || 'from-amber-50 to-orange-100',
        iconColor: iconColor || '#d97706',
        image,
        stock: +stock || 0,
        price: +price || 0,
        isTop: req.body.isTop === 'true' || req.body.isTop === true,
        uzumLink: uzumLink || null,
        features: features || null,
      },
    })
    res.status(201).json(product)
  } catch (err) {
    console.error('POST /products error:', err)
    res.status(500).json({ error: 'Failed to create product' })
  }
})

router.put('/:id', protect, upload.single('image'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, label, category, gradient, iconColor, stock, price, uzumLink, features } = req.body
    const data: Record<string, unknown> = {
      name: normalizeLocalized(name),
      description: normalizeLocalized(description),
      label: normalizeLocalized(label),
      category, gradient, iconColor, stock: +stock, price: +price,
      isTop: req.body.isTop === 'true' || req.body.isTop === true,
      uzumLink: uzumLink || null,
      features: features || null,
    }
    if (req.file) data.image = `/uploads/${req.file.filename}`
    const product = await prisma.product.update({ where: { id: +req.params.id }, data })
    res.json(product)
  } catch (err) {
    console.error('PUT /products error:', err)
    res.status(500).json({ error: 'Failed to update product' })
  }
})

router.delete('/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.product.delete({ where: { id: +req.params.id } })
    res.json({ success: true })
  } catch (err) {
    console.error('DELETE /products error:', err)
    res.status(500).json({ error: 'Failed to delete product' })
  }
})

export default router
