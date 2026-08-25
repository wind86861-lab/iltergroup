import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email и пароль обязательны' }) as unknown as void

  const admin = await prisma.admin.findUnique({ where: { email } })
  if (!admin) return res.status(401).json({ error: 'Неверные учётные данные' }) as unknown as void

  const valid = await bcrypt.compare(password, admin.password)
  if (!valid) return res.status(401).json({ error: 'Неверные учётные данные' }) as unknown as void

  const token = jwt.sign({ adminId: admin.id }, process.env.JWT_SECRET!, { expiresIn: '7d' })
  res.json({ token, admin: { id: admin.id, email: admin.email, name: admin.name } })
})

router.get('/me', async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Нет токена' }) as unknown as void

  try {
    const { adminId } = jwt.verify(token, process.env.JWT_SECRET!) as { adminId: number }
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: { id: true, email: true, name: true },
    })
    res.json(admin)
  } catch {
    res.status(401).json({ error: 'Неверный токен' })
  }
})

export default router
