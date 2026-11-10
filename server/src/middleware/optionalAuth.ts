import jwt from 'jsonwebtoken'
import type { Request, Response, NextFunction } from 'express'
import type { TokenPayload } from '../domain'

// Читает токен, если он передан, но не требует авторизации
export default function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return next()

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload
  } catch {
    req.user = undefined
  }
  next()
}
