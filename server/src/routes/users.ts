import { Router } from 'express'
import bcrypt from 'bcryptjs'
import pool from '../../db/pool'
import auth from '../middleware/auth'
import { avatarUpload } from '../lib/uploads'
import { toPublic } from '../lib/userView'
import { type UserRow } from '../domain'

const router = Router()

router.use(auth)

router.get('/me', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [req.user!.id])
    if (!rows[0]) return res.status(404).json({ error: 'Пользователь не найден' })
    res.json(toPublic(rows[0] as UserRow))
  } catch (err) {
    next(err)
  }
})

router.patch('/me', async (req, res, next) => {
  try {
    const { nickname, email, currentPassword, newPassword } = req.body

    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [req.user!.id])
    const user = rows[0] as UserRow | undefined
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' })

    if (newPassword !== undefined) {
      if (!currentPassword || !(await bcrypt.compare(String(currentPassword), user.password_hash))) {
        return res.status(400).json({ error: 'Текущий пароль неверный' })
      }
      if (String(newPassword).length < 6) {
        return res.status(400).json({ error: 'Пароль от 6 символов' })
      }
      user.password_hash = await bcrypt.hash(String(newPassword), 10)
    }

    if (nickname !== undefined) {
      const value = String(nickname).trim()
      if (!value) return res.status(400).json({ error: 'Ник не может быть пустым' })
      user.nickname = value
    }
    if (email !== undefined) user.email = String(email).trim().toLowerCase()

    const updated = await pool.query(
      `UPDATE users SET nickname = $1, email = $2, password_hash = $3 WHERE id = $4 RETURNING *`,
      [user.nickname, user.email, user.password_hash, user.id],
    )

    res.json(toPublic(updated.rows[0] as UserRow))
  } catch (err) {
    next(err)
  }
})

router.post('/me/avatar', avatarUpload, async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Файл не получен' })

    const { rows } = await pool.query(
      'UPDATE users SET avatar = $1 WHERE id = $2 RETURNING *',
      [`/uploads/${req.file.filename}`, req.user!.id],
    )

    res.json(toPublic(rows[0] as UserRow))
  } catch (err) {
    next(err)
  }
})

export default router
