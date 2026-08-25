import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { protect } from '../middleware/auth'

const prisma = new PrismaClient()
const router = Router()

// GET /api/site/config — public
router.get('/config', async (_req, res) => {
  try {
    const config = await prisma.siteConfig.findFirst()
    if (!config) {
      const c = await prisma.siteConfig.create({ data: {} })
      return res.json(c)
    }
    res.json(config)
  } catch (err: any) {
    console.error('GET config error:', err?.message)
    res.status(500).json({ error: err?.message || 'Failed to fetch config' })
  }
})

// PUT /api/site/config — admin only
router.put('/config', protect, async (req, res) => {
  try {
    const { phone, email, address, tagline } = req.body
    let config = await prisma.siteConfig.findFirst()
    if (!config) {
      config = await prisma.siteConfig.create({ data: { phone, email, address, tagline } })
    } else {
      config = await prisma.siteConfig.update({
        where: { id: config.id },
        data: { phone, email, address, tagline },
      })
    }
    res.json(config)
  } catch (err: any) {
    console.error('PUT config error:', err?.message)
    res.status(400).json({ error: err?.message || 'Update failed' })
  }
})

// GET /api/site/footer-links — public
router.get('/footer-links', async (_req, res) => {
  const links = await prisma.footerLink.findMany({ orderBy: { order: 'asc' } })
  res.json(links)
})

// POST /api/site/footer-links — admin only
router.post('/footer-links', protect, async (req, res) => {
  try {
    const { label, href, column, order } = req.body
    if (!label || !href || !column) {
      return res.status(400).json({ error: 'Missing fields' })
    }
    const link = await prisma.footerLink.create({ data: { label, href, column, order: order ?? 0 } })
    res.json(link)
  } catch (err: any) {
    console.error('POST footer-links error:', err?.message)
    res.status(400).json({ error: err?.message || 'Create failed' })
  }
})

// PUT /api/site/footer-links/:id — admin only
router.put('/footer-links/:id', protect, async (req, res) => {
  try {
    const { label, href, column, order } = req.body
    const link = await prisma.footerLink.update({
      where: { id: Number(req.params.id) },
      data: { label, href, column, order },
    })
    res.json(link)
  } catch (err: any) {
    console.error('PUT footer-links error:', err?.message)
    res.status(400).json({ error: err?.message || 'Update failed' })
  }
})

// DELETE /api/site/footer-links/:id — admin only
router.delete('/footer-links/:id', protect, async (req, res) => {
  try {
    await prisma.footerLink.delete({ where: { id: Number(req.params.id) } })
    res.json({ success: true })
  } catch (err: any) {
    console.error('DELETE footer-links error:', err?.message)
    res.status(400).json({ error: err?.message || 'Delete failed' })
  }
})

export default router
