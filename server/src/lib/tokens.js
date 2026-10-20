import jwt from 'jsonwebtoken'

export function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

export function toPublic(row) {
  return {
    id: row.id,
    email: row.email,
    nickname: row.nickname,
    avatar: row.avatar,
    role: row.role,
    createdAt: row.created_at,
  }
}
