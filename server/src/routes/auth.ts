import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'
import { asyncRouter } from '../lib/asyncRouter'
import { rateLimit } from '../lib/rateLimit'
import { protect } from '../middleware/auth'
import { AuthRequest } from '../types'

const router = asyncRouter()

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Слишком много попыток входа, попробуйте через 15 минут',
})

router.post('/login', loginLimiter, async (req: Request, res: Response) => {
  const { email, password } = req.body
  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    return void res.status(400).json({ error: 'Email и пароль обязательны' })
  }

  const admin = await prisma.admin.findUnique({ where: { email: email.trim().toLowerCase() } })
  if (!admin) return void res.status(401).json({ error: 'Неверные учётные данные' })

  const valid = await bcrypt.compare(password, admin.password)
  if (!valid) return void res.status(401).json({ error: 'Неверные учётные данные' })

  const token = jwt.sign({ adminId: admin.id }, process.env.JWT_SECRET!, { expiresIn: '7d' })
  res.json({ token, admin: { id: admin.id, email: admin.email, name: admin.name } })
})

router.get('/me', protect, async (req: AuthRequest, res: Response) => {
  const admin = await prisma.admin.findUnique({
    where: { id: req.adminId },
    select: { id: true, email: true, name: true },
  })
  if (!admin) return void res.status(401).json({ error: 'Неверный токен' })
  res.json(admin)
})

router.post('/password', protect, loginLimiter, async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body
  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
    return void res.status(400).json({ error: 'Укажите текущий и новый пароль' })
  }
  if (newPassword.length < 10) {
    return void res.status(400).json({ error: 'Новый пароль должен быть не короче 10 символов' })
  }

  const admin = await prisma.admin.findUnique({ where: { id: req.adminId } })
  if (!admin || !(await bcrypt.compare(currentPassword, admin.password))) {
    return void res.status(400).json({ error: 'Текущий пароль неверен' })
  }

  await prisma.admin.update({
    where: { id: admin.id },
    data: { password: await bcrypt.hash(newPassword, 12) },
  })
  res.json({ success: true })
})

export default router
