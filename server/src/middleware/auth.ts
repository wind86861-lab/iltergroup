import { Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AuthRequest } from '../types'

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Токен не предоставлен' }) as unknown as void

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { adminId: number }
    req.adminId = decoded.adminId
    next()
  } catch {
    res.status(401).json({ error: 'Неверный токен' })
  }
}
