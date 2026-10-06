import { prisma } from '../lib/prisma'
import { asyncRouter } from '../lib/asyncRouter'
import { imageUpload, publicPath, deleteUpload } from '../lib/uploads'
import { protect } from '../middleware/auth'

const router = asyncRouter()

const upload = imageUpload({ subdir: 'partners', prefix: 'partner_', maxMb: 5 })

// GET /api/partners — public
router.get('/', async (_req, res) => {
  const partners = await prisma.partner.findMany({ orderBy: { order: 'asc' } })
  res.json(partners)
})

// POST /api/partners — admin only
router.post('/', protect, upload.single('image'), async (req, res) => {
  const { name, type, color, order } = req.body
  if (!name || !type || !color) {
    if (req.file) deleteUpload(publicPath(req.file, 'partners'))
    return void res.status(400).json({ error: 'Missing fields' })
  }
  const image = req.file ? publicPath(req.file, 'partners') : ''
  const partner = await prisma.partner.create({
    data: { name, type, color, image, order: Number(order) || 0 },
  })
  res.json(partner)
})

// PUT /api/partners/:id — admin only
router.put('/:id', protect, upload.single('image'), async (req, res) => {
  const { name, type, color, order } = req.body
  const existing = await prisma.partner.findUnique({ where: { id: Number(req.params.id) } })
  if (!existing) {
    if (req.file) deleteUpload(publicPath(req.file, 'partners'))
    return void res.status(404).json({ error: 'Not found' })
  }
  const image = req.file ? publicPath(req.file, 'partners') : existing.image
  const partner = await prisma.partner.update({
    where: { id: existing.id },
    data: { name, type, color, image, order: order !== undefined ? Number(order) || 0 : existing.order },
  })
  if (req.file && existing.image) deleteUpload(existing.image)
  res.json(partner)
})

// DELETE /api/partners/:id — admin only
router.delete('/:id', protect, async (req, res) => {
  const partner = await prisma.partner.delete({ where: { id: Number(req.params.id) } })
  deleteUpload(partner.image)
  res.json({ success: true })
})

export default router
