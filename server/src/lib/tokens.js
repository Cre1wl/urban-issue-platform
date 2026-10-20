import jwt from 'jsonwebtoken'

// Подписывает JWT: payload — id и роль пользователя, живёт 7 дней
export function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })
}
