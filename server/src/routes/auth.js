import { Router } from 'express'
import bcrypt from 'bcryptjs'
import pool from '../../db/pool.js'
import { signToken, toPublic } from '../lib/tokens.js'

const router = Router()

router.post('/register', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase()
  const nickname = String(req.body.nickname || '').trim()
  const password = String(req.body.password || '')

  if (!email || !nickname || !password) return res.status(400).json({ error: 'Заполните все поля' })
  if (password.length < 6) return res.status(400).json({ error: 'Пароль от 6 символов' })

  const passwordHash = await bcrypt.hash(password, 10)

  const { rows } = await pool.query(
    `INSERT INTO users (email, nickname, password_hash)
     VALUES ($1, $2, $3) RETURNING *`,
    [email, nickname, passwordHash],
  )

  res.status(201).json({ token: signToken(rows[0]), user: toPublic(rows[0]) })
})

router.post('/login', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase()
  const password = String(req.body.password || '')

  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email])
  const user = rows[0]

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'Неверный email или пароль' })
  }
  if (user.is_blocked) return res.status(403).json({ error: 'Аккаунт заблокирован' })

  res.json({ token: signToken(user), user: toPublic(user) })
})

export default router
