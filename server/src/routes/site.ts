import { prisma } from '../lib/prisma'
import { asyncRouter } from '../lib/asyncRouter'
import { protect } from '../middleware/auth'

const router = asyncRouter()

// GET /api/site/config — public
router.get('/config', async (_req, res) => {
  const config = await prisma.siteConfig.findFirst()
  res.json(config ?? await prisma.siteConfig.create({ data: {} }))
})

// PUT /api/site/config — admin only
router.put('/config', protect, async (req, res) => {
  const { phone, email, address, tagline } = req.body
  const existing = await prisma.siteConfig.findFirst()
  const config = existing
    ? await prisma.siteConfig.update({ where: { id: existing.id }, data: { phone, email, address, tagline } })
    : await prisma.siteConfig.create({ data: { phone, email, address, tagline } })
  res.json(config)
})

// GET /api/site/footer-links — public
router.get('/footer-links', async (_req, res) => {
  const links = await prisma.footerLink.findMany({ orderBy: { order: 'asc' } })
  res.json(links)
})

// POST /api/site/footer-links — admin only
router.post('/footer-links', protect, async (req, res) => {
  const { label, href, column, order } = req.body
  if (!label || !href || !column) return void res.status(400).json({ error: 'Missing fields' })
  const link = await prisma.footerLink.create({ data: { label, href, column, order: order ?? 0 } })
  res.json(link)
})

// PUT /api/site/footer-links/:id — admin only
router.put('/footer-links/:id', protect, async (req, res) => {
  const { label, href, column, order } = req.body
  const link = await prisma.footerLink.update({
    where: { id: Number(req.params.id) },
    data: { label, href, column, order },
  })
  res.json(link)
})

// DELETE /api/site/footer-links/:id — admin only
router.delete('/footer-links/:id', protect, async (req, res) => {
  await prisma.footerLink.delete({ where: { id: Number(req.params.id) } })
  res.json({ success: true })
})

export default router
