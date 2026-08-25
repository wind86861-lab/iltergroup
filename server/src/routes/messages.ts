import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { protect } from '../middleware/auth'
import { AuthRequest } from '../types'
import { notifyMessage } from '../lib/telegram'

const router = Router()
const prisma = new PrismaClient()

router.get('/', protect, async (_req: AuthRequest, res: Response) => {
  const messages = await prisma.message.findMany({ orderBy: { createdAt: 'desc' } })
  res.json(messages)
})

router.post('/', async (req: Request, res: Response) => {
  const { name, phone, comment } = req.body
  if (!name || !phone || !comment) return res.status(400).json({ error: 'Все поля обязательны' }) as unknown as void
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
