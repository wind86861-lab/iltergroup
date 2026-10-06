import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { asyncRouter } from '../lib/asyncRouter'
import { rateLimit } from '../lib/rateLimit'
import { str } from '../lib/validate'
import { protect } from '../middleware/auth'
import { AuthRequest } from '../types'
import { notifyOrder } from '../lib/telegram'

const router = asyncRouter()

// Public form: a real customer never needs more than a handful per few minutes.
const createLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 10 })

function parseItems(raw: string) {
  try { return JSON.parse(raw) } catch { return [] }
}

router.get('/', protect, async (_req: AuthRequest, res: Response) => {
  const orders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' } })
  res.json(orders.map(o => ({ ...o, items: parseItems(o.items) })))
})

router.post('/', createLimiter, async (req: Request, res: Response) => {
  const customer = str(req.body.customer, 120)
  const phone = str(req.body.phone, 40)
  if (!customer || !phone) return void res.status(400).json({ error: 'Имя и телефон обязательны' })

  const rawItems: unknown[] = Array.isArray(req.body.items) ? req.body.items.slice(0, 50) : []
  const items = rawItems.map(raw => {
    const i = (raw ?? {}) as Record<string, unknown>
    return {
      productId: Number.isInteger(i.productId) ? (i.productId as number) : 0,
      name: str(i.name, 200) || '—',
      qty: Math.max(1, Math.min(100000, Math.round(Number(i.qty)) || 1)),
      price: Math.max(0, Math.round(Number(i.price)) || 0),
    }
  })

  // Never trust a client-sent total: use catalogue prices where the product is known.
  const known = await prisma.product.findMany({
    where: { id: { in: items.map(i => i.productId).filter(id => id > 0) } },
    select: { id: true, price: true },
  })
  const priceOf = new Map(known.map(p => [p.id, p.price]))
  for (const item of items) if (priceOf.has(item.productId)) item.price = priceOf.get(item.productId)!
  const total = items.reduce((sum, i) => sum + i.qty * i.price, 0)

  const order = await prisma.order.create({
    data: {
      customer,
      phone,
      email: str(req.body.email, 200) || '',
      items: JSON.stringify(items),
      total,
      notes: str(req.body.notes, 2000) || '',
    },
  })
  notifyOrder({
    id: order.id,
    customer: order.customer,
    phone: order.phone,
    email: order.email || undefined,
    total,
    notes: order.notes || undefined,
    createdAt: order.createdAt,
  }).catch(() => { })
  res.status(201).json({ ...order, items })
})

router.patch('/:id/status', protect, async (req: AuthRequest, res: Response) => {
  const { status } = req.body
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
  if (!validStatuses.includes(status)) return void res.status(400).json({ error: 'Неверный статус' })
  const order = await prisma.order.update({ where: { id: +req.params.id }, data: { status } })
  res.json({ ...order, items: parseItems(order.items) })
})

router.delete('/:id', protect, async (req: AuthRequest, res: Response) => {
  await prisma.order.delete({ where: { id: +req.params.id } })
  res.json({ success: true })
})

export default router
