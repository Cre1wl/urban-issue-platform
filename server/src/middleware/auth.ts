import jwt from 'jsonwebtoken'
import type { Request, Response, NextFunction } from 'express'
import type { TokenPayload } from '../domain'

// Проверяет заголовок Authorization: Bearer <token> и кладёт payload в req.user
export default function auth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) return res.status(401).json({ error: 'Требуется вход' })

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload
    next()
  } catch {
    res.status(401).json({ error: 'Сессия истекла, войдите заново' })
  }
}
