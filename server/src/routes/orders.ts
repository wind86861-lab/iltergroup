import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { protect } from '../middleware/auth'
import { AuthRequest } from '../types'
import { notifyOrder } from '../lib/telegram'

const router = Router()
const prisma = new PrismaClient()

router.get('/', protect, async (_req: AuthRequest, res: Response) => {
  const orders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' } })
  res.json(orders.map(o => ({ ...o, items: JSON.parse(o.items) })))
})

router.post('/', async (req: Request, res: Response) => {
  const { customer, phone, email, items, total, notes } = req.body
  const order = await prisma.order.create({
    data: { customer, phone, email: email || '', items: JSON.stringify(items), total: +total, notes: notes || '' },
  })
  notifyOrder({
    id: order.id,
    customer: order.customer,
    phone: order.phone,
    email: order.email || undefined,
    total: +total,
    notes: order.notes || undefined,
    createdAt: order.createdAt,
  }).catch(() => { })
  res.status(201).json({ ...order, items })
})

router.patch('/:id/status', protect, async (req: AuthRequest, res: Response) => {
  const { status } = req.body
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Неверный статус' }) as unknown as void
  const order = await prisma.order.update({ where: { id: +req.params.id }, data: { status } })
  res.json({ ...order, items: JSON.parse(order.items) })
})

router.delete('/:id', protect, async (req: AuthRequest, res: Response) => {
  await prisma.order.delete({ where: { id: +req.params.id } })
  res.json({ success: true })
})

export default router
