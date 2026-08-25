import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
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

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

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

app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }))

/* ── Global error handler ── */
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('API Error:', err?.message || err)
  res.status(500).json({ error: err?.message || 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`✅  Server running on http://localhost:${PORT}`)
})
