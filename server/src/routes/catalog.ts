import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { protect } from '../middleware/auth'
import { asyncRouter } from '../lib/asyncRouter'

const UPLOAD_DIR = path.join(__dirname, '../../uploads')
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const CATALOG_PATH = path.join(UPLOAD_DIR, 'catalog.pdf')

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, _file, cb) => cb(null, 'catalog.pdf'),
})

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true)
    } else {
      cb(new Error('Only PDF files allowed'))
    }
  },
})

const router = asyncRouter()

// GET /api/catalog — check if catalog exists
router.get('/', (_req, res) => {
  const exists = fs.existsSync(CATALOG_PATH)
  if (!exists) {
    return res.json({ exists: false })
  }
  const stat = fs.statSync(CATALOG_PATH)
  res.json({
    exists: true,
    url: '/uploads/catalog.pdf',
    updatedAt: stat.mtime.toISOString(),
    size: stat.size,
  })
})

// POST /api/catalog/upload — upload/replace catalog (admin only)
router.post('/upload', protect, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err instanceof Error ? err.message : 'Upload failed' })
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' })
    }
    res.json({
      exists: true,
      url: '/uploads/catalog.pdf',
      updatedAt: new Date().toISOString(),
      size: req.file.size,
    })
  })
})

// DELETE /api/catalog — remove catalog (admin only)
router.delete('/', protect, (_req, res) => {
  if (fs.existsSync(CATALOG_PATH)) {
    fs.unlinkSync(CATALOG_PATH)
  }
  res.json({ exists: false })
})

export default router
