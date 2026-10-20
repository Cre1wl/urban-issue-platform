import 'dotenv/config'
import bcrypt from 'bcryptjs'
import pool from './pool.js'

if (!process.env.DATABASE_URL) throw new Error('Не задан DATABASE_URL в server/.env')

// Демо-данные для проверки ролей и админки (ТЗ: resident / moderator / admin)
const users = [
  { email: 'admin@city.local', nickname: 'admin', role: 'admin' },
  { email: 'moderator@city.local', nickname: 'moderator', role: 'moderator' },
  { email: 'demo@city.local', nickname: 'demo', role: 'resident' },
]

const passwordHash = await bcrypt.hash('demo1234', 10)

for (const user of users) {
  const { rows } = await pool.query(
    `INSERT INTO users (email, nickname, password_hash, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role
     RETURNING nickname, role`,
    [user.email, user.nickname, passwordHash, user.role],
  )
  console.log('готов:', rows[0].nickname, '(' + rows[0].role + ')')
}

await pool.end()
console.log('Пароль демо-пользователей: demo1234')
