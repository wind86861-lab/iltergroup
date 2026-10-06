import 'dotenv/config' // must run before any module reads process.env
import express, { ErrorRequestHandler } from 'express'
import cors from 'cors'
import path from 'path'
import multer from 'multer'
import { Prisma } from '@prisma/client'

import authRoutes from './routes/auth'
import productRoutes from './routes/products'
import orderRoutes from './routes/orders'
import messageRoutes from './routes/messages'
import catalogRoutes from './routes/catalog'
import stepsRoutes from './routes/steps'
import partnersRoutes from './routes/partners'
import siteRoutes from './routes/site'
import benefitsRoutes from './routes/benefits'
import sectionsRoutes from './routes/sections'
import categoriesRoutes from './routes/categories'
import { HttpError } from './lib/validate'

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
  console.error('JWT_SECRET must be set in .env (at least 16 characters)')
  process.exit(1)
}

const app = express()
const PORT = Number(process.env.PORT) || 3001
// Bind to loopback by default: in production nginx is the only way in.
const HOST = process.env.HOST || '127.0.0.1'

app.disable('x-powered-by')
// Behind nginx on the same host: trust it for req.ip (used by the rate limiter).
app.set('trust proxy', 'loopback')

// FRONTEND_URL may hold several comma-separated origins.
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',').map(s => s.trim()).filter(Boolean)
app.use(cors({
  origin: (origin, cb) => cb(null, !origin || allowedOrigins.includes(origin)),
}))
app.use(express.json({ limit: '200kb' }))
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  setHeaders: res => res.setHeader('X-Content-Type-Options', 'nosniff'),
}))

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/catalog', catalogRoutes)
app.use('/api/steps', stepsRoutes)
app.use('/api/partners', partnersRoutes)
app.use('/api/site', siteRoutes)
app.use('/api/benefits', benefitsRoutes)
app.use('/api/sections', sectionsRoutes)
app.use('/api/categories', categoriesRoutes)

app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }))

app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }))

/* ── Global error handler ── */
const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof HttpError) return void res.status(err.status).json({ error: err.message })
  if (err instanceof multer.MulterError) {
    const msg = err.code === 'LIMIT_FILE_SIZE' ? 'Файл слишком большой' : err.message
    return void res.status(400).json({ error: msg })
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
    return void res.status(404).json({ error: 'Запись не найдена' })
  }
  if (err instanceof Prisma.PrismaClientValidationError || err?.type === 'entity.parse.failed') {
    return void res.status(400).json({ error: 'Некорректные данные' })
  }
  if (err?.type === 'entity.too.large') return void res.status(413).json({ error: 'Слишком большой запрос' })

  console.error(`API Error ${req.method} ${req.originalUrl}:`, err)
  res.status(500).json({ error: 'Internal server error' })
}
app.use(errorHandler)

process.on('unhandledRejection', err => console.error('Unhandled rejection:', err))

app.listen(PORT, HOST, () => {
  console.log(`✅  Server running on http://${HOST}:${PORT}`)
})
