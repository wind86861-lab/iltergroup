import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { protect } from '../middleware/auth'

const prisma = new PrismaClient()
const router = Router()

function safeJsonParse(v: string): Record<string, string> {
  try { return JSON.parse(v) } catch { return {} }
}

router.get('/', async (_req, res) => {
  const items = await prisma.benefit.findMany({ orderBy: { order: 'asc' } })
  res.json(items.map(b => ({
    id: b.id,
    icon: b.icon,
    title: safeJsonParse(b.title),
    text: safeJsonParse(b.text),
    color: b.color,
    order: b.order,
  })))
})

router.post('/', protect, async (req, res) => {
  const { icon, title, text, color, order } = req.body
  if (!icon || !title || !text) return res.status(400).json({ error: 'Missing fields' })
  const b = await prisma.benefit.create({
    data: {
      icon,
      title: typeof title === 'string' ? title : JSON.stringify(title),
      text: typeof text === 'string' ? text : JSON.stringify(text),
      color: color || '#0099FF',
      order: order ?? 0,
    },
  })
  res.json(b)
})

router.put('/:id', protect, async (req, res) => {
  const { icon, title, text, color, order } = req.body
  const b = await prisma.benefit.update({
    where: { id: Number(req.params.id) },
    data: {
      icon,
      title: typeof title === 'string' ? title : JSON.stringify(title),
      text: typeof text === 'string' ? text : JSON.stringify(text),
      color,
      order,
    },
  })
  res.json(b)
})

router.delete('/:id', protect, async (req, res) => {
  await prisma.benefit.delete({ where: { id: Number(req.params.id) } })
  res.json({ success: true })
})

export default router
