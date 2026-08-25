import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { protect } from '../middleware/auth'

const prisma = new PrismaClient()
const router = Router()

const PARTNERS_DIR = path.join(__dirname, '../../uploads/partners')
if (!fs.existsSync(PARTNERS_DIR)) fs.mkdirSync(PARTNERS_DIR, { recursive: true })

function partnerFilename(file: Express.Multer.File): string {
  const ts = Date.now()
  const ext = path.extname(file.originalname) || '.png'
  return `partner_${ts}${ext}`
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, PARTNERS_DIR),
  filename: (_req, file, cb) => cb(null, partnerFilename(file)),
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']
    if (allowed.includes(file.mimetype) || /\.(png|jpe?g|webp|svg)$/i.test(file.originalname)) {
      cb(null, true)
    } else {
      cb(new Error('Only image files (PNG, JPG, WEBP, SVG) allowed'))
    }
  },
})

function deleteImage(imgPath: string) {
  if (!imgPath) return
  const rel = imgPath.replace(/^\/+/, '')
  const abs = path.join(__dirname, '../../', rel)
  if (fs.existsSync(abs)) fs.unlinkSync(abs)
}

// GET /api/partners — public
router.get('/', async (_req, res) => {
  const partners = await prisma.partner.findMany({ orderBy: { order: 'asc' } })
  res.json(partners)
})

// POST /api/partners — admin only
router.post('/', protect, (req, res) => {
  upload.single('image')(req as any, res as any, async (err: any) => {
    if (err) return res.status(400).json({ error: err.message || 'Upload failed' })
    const { name, type, color, order } = req.body
    if (!name || !type || !color) return res.status(400).json({ error: 'Missing fields' })
    const image = req.file ? `/uploads/partners/${req.file.filename}` : ''
    const partner = await prisma.partner.create({
      data: { name, type, color, image, order: Number(order) || 0 },
    })
    res.json(partner)
  })
})

// PUT /api/partners/:id — admin only
router.put('/:id', protect, (req, res) => {
  upload.single('image')(req as any, res as any, async (err: any) => {
    if (err) return res.status(400).json({ error: err.message || 'Upload failed' })
    const { name, type, color, order } = req.body
    const existing = await prisma.partner.findUnique({ where: { id: Number(req.params.id) } })
    if (!existing) return res.status(404).json({ error: 'Not found' })
    const image = req.file ? `/uploads/partners/${req.file.filename}` : existing.image
    if (req.file && existing.image) deleteImage(existing.image)
    const partner = await prisma.partner.update({
      where: { id: Number(req.params.id) },
      data: { name, type, color, image, order: order !== undefined ? Number(order) : existing.order },
    })
    res.json(partner)
  })
})

// DELETE /api/partners/:id — admin only
router.delete('/:id', protect, async (req, res) => {
  const existing = await prisma.partner.findUnique({ where: { id: Number(req.params.id) } })
  if (existing?.image) deleteImage(existing.image)
  await prisma.partner.delete({ where: { id: Number(req.params.id) } })
  res.json({ success: true })
})

export default router
