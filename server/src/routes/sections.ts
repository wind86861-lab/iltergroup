import { prisma } from '../lib/prisma'
import { asyncRouter } from '../lib/asyncRouter'
import { protect } from '../middleware/auth'

const router = asyncRouter()

function safeJsonParse(v: string): Record<string, string> {
  try { return JSON.parse(v) } catch { return {} }
}

router.get('/', async (_req, res) => {
  const items = await prisma.sectionText.findMany()
  const map: Record<string, Record<string, string>> = {}
  items.forEach(i => { map[i.key] = safeJsonParse(i.text) })
  res.json(map)
})

router.get('/:key', async (req, res) => {
  const item = await prisma.sectionText.findUnique({ where: { key: req.params.key } })
  if (!item) return res.status(404).json({ error: 'Not found' })
  res.json({ key: item.key, text: safeJsonParse(item.text) })
})

router.put('/:key', protect, async (req, res) => {
  if (!/^[a-zA-Z0-9_.-]{1,64}$/.test(req.params.key)) return void res.status(400).json({ error: 'Invalid key' })
  const { text } = req.body
  const data = typeof text === 'string' ? text : JSON.stringify(text)
  const item = await prisma.sectionText.upsert({
    where: { key: req.params.key },
    update: { text: data },
    create: { key: req.params.key, text: data },
  })
  res.json(item)
})

export default router
