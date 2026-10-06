import { prisma } from '../lib/prisma'
import { asyncRouter } from '../lib/asyncRouter'
import { HttpError, str } from '../lib/validate'
import { protect } from '../middleware/auth'

const router = asyncRouter()

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function safeJsonParse(v: string): Record<string, string> {
  try { return JSON.parse(v) } catch { return {} }
}

function toApi(c: { id: number; slug: string; name: string; iconColor: string; gradient: string; order: number }) {
  return { id: c.id, slug: c.slug, name: safeJsonParse(c.name), iconColor: c.iconColor, gradient: c.gradient, order: c.order }
}

function parseBody(body: Record<string, unknown>) {
  const slug = str(body.slug, 40)?.toLowerCase()
  if (!slug || !SLUG_RE.test(slug)) throw new HttpError(400, 'Slug: только латиница, цифры и дефис')
  if (!body.name || typeof body.name !== 'object') throw new HttpError(400, 'Укажите название')
  return {
    slug,
    name: JSON.stringify(body.name),
    iconColor: str(body.iconColor, 20) || '#004FF1',
    gradient: str(body.gradient, 80) || 'from-blue-50 to-cyan-100',
    order: Number.isFinite(Number(body.order)) ? Math.round(Number(body.order)) : 0,
  }
}

async function assertSlugFree(slug: string, exceptId?: number) {
  const other = await prisma.category.findUnique({ where: { slug } })
  if (other && other.id !== exceptId) throw new HttpError(409, 'Категория с таким slug уже есть')
}

// GET /api/categories — public
router.get('/', async (_req, res) => {
  const items = await prisma.category.findMany({ orderBy: [{ order: 'asc' }, { id: 'asc' }] })
  res.json(items.map(toApi))
})

// POST /api/categories — admin only
router.post('/', protect, async (req, res) => {
  const data = parseBody(req.body)
  await assertSlugFree(data.slug)
  const created = await prisma.category.create({ data })
  res.status(201).json(toApi(created))
})

// PUT /api/categories/:id — admin only. Renaming the slug re-points its products.
router.put('/:id', protect, async (req, res) => {
  const id = Number(req.params.id)
  const existing = await prisma.category.findUnique({ where: { id } })
  if (!existing) return void res.status(404).json({ error: 'Not found' })
  const data = parseBody(req.body)
  await assertSlugFree(data.slug, id)
  const [updated] = await prisma.$transaction([
    prisma.category.update({ where: { id }, data }),
    prisma.product.updateMany({ where: { category: existing.slug }, data: { category: data.slug } }),
  ])
  res.json(toApi(updated))
})

// DELETE /api/categories/:id — admin only, refused while products still use it
router.delete('/:id', protect, async (req, res) => {
  const existing = await prisma.category.findUnique({ where: { id: Number(req.params.id) } })
  if (!existing) return void res.status(404).json({ error: 'Not found' })
  const used = await prisma.product.count({ where: { category: existing.slug } })
  if (used) return void res.status(409).json({ error: `Категория используется в ${used} товар(ах)` })
  await prisma.category.delete({ where: { id: existing.id } })
  res.json({ success: true })
})

export default router
