import { prisma } from '../lib/prisma'
import { asyncRouter } from '../lib/asyncRouter'
import { protect } from '../middleware/auth'

const router = asyncRouter()

function safeJsonParse(v: string): Record<string, string> {
  try { return JSON.parse(v) } catch { return {} }
}

// GET /api/steps — public
router.get('/', async (_req, res) => {
  const steps = await prisma.step.findMany({ orderBy: { num: 'asc' } })
  res.json(steps.map(s => ({
    id: s.id,
    num: s.num,
    icon: s.icon,
    title: safeJsonParse(s.title),
    text: safeJsonParse(s.text),
  })))
})

// POST /api/steps — admin only
router.post('/', protect, async (req, res) => {
  const { num, icon, title, text } = req.body
  if (!num || !icon || !title || !text) {
    return res.status(400).json({ error: 'Missing fields' })
  }
  const step = await prisma.step.create({
    data: {
      num: Number(num),
      icon,
      title: typeof title === 'string' ? title : JSON.stringify(title),
      text: typeof text === 'string' ? text : JSON.stringify(text),
    },
  })
  res.json(step)
})

// PUT /api/steps/:id — admin only
router.put('/:id', protect, async (req, res) => {
  const { num, icon, title, text } = req.body
  const step = await prisma.step.update({
    where: { id: Number(req.params.id) },
    data: {
      num: num !== undefined ? Number(num) : undefined,
      icon,
      title: typeof title === 'string' ? title : JSON.stringify(title),
      text: typeof text === 'string' ? text : JSON.stringify(text),
    },
  })
  res.json(step)
})

// DELETE /api/steps/:id — admin only
router.delete('/:id', protect, async (req, res) => {
  await prisma.step.delete({ where: { id: Number(req.params.id) } })
  res.json({ success: true })
})

export default router
