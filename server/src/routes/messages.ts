import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { asyncRouter } from '../lib/asyncRouter'
import { rateLimit } from '../lib/rateLimit'
import { str } from '../lib/validate'
import { protect } from '../middleware/auth'
import { AuthRequest } from '../types'
import { notifyMessage } from '../lib/telegram'

const router = asyncRouter()

const createLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 10 })

router.get('/', protect, async (_req: AuthRequest, res: Response) => {
  const messages = await prisma.message.findMany({ orderBy: { createdAt: 'desc' } })
  res.json(messages)
})

router.post('/', createLimiter, async (req: Request, res: Response) => {
  const name = str(req.body.name, 120)
  const phone = str(req.body.phone, 40)
  const comment = str(req.body.comment, 3000)
  if (!name || !phone || !comment) return void res.status(400).json({ error: 'Все поля обязательны' })
  const message = await prisma.message.create({ data: { name, phone, comment } })
  notifyMessage({
    id: message.id,
    name: message.name,
    phone: message.phone,
    comment: message.comment,
    createdAt: message.createdAt,
  }).catch(() => { })
  res.status(201).json(message)
})

router.patch('/:id/read', protect, async (req: AuthRequest, res: Response) => {
  const { isRead } = req.body
  const message = await prisma.message.update({ where: { id: +req.params.id }, data: { isRead: !!isRead } })
  res.json(message)
})

router.delete('/:id', protect, async (req: AuthRequest, res: Response) => {
  await prisma.message.delete({ where: { id: +req.params.id } })
  res.json({ success: true })
})

export default router
