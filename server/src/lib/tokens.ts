import jwt from 'jsonwebtoken'
import type { TokenPayload } from '../domain'

// Подписывает JWT: payload — id и роль пользователя, живёт 7 дней
export function signToken(user: TokenPayload): string {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET as string, {
    expiresIn: '7d',
  })
}
