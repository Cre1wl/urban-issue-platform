import type { NextFunction, Request, Response } from 'express'
import type { UserRole } from '../domain'

// Ограничивает доступ по роли: администратор проходит любую проверку
export default function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = req.user?.role
    if (!role) return res.status(401).json({ error: 'Требуется вход' })
    if (role === 'admin' || roles.includes(role)) return next()
    res.status(403).json({ error: 'Недостаточно прав' })
  }
}
