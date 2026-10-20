import { Router } from 'express'
import bcrypt from 'bcryptjs'
import multer from 'multer'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import pool from '../../db/pool.js'
import auth from '../middleware/auth.js'
import { toPublic } from '../lib/tokens.js'

const router = Router()

const uploadsDir = path.join(process.cwd(), 'uploads')
const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase()
      cb(null, `${randomUUID()}${ext}`)
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype)
    cb(ok ? null : new Error('Только изображения'), ok)
  },
})

router.use(auth)

router.get('/me', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id])
  if (!rows[0]) return res.status(404).json({ error: 'Пользователь не найден' })
  res.json(toPublic(rows[0]))
})

router.patch('/me', async (req, res) => {
  const { nickname, email, currentPassword, newPassword } = req.body

  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id])
  const user = rows[0]
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

  res.json(toPublic(updated.rows[0]))
})

router.post('/me/avatar', upload.single('avatar'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Файл не получен' })

  const { rows } = await pool.query(
    'UPDATE users SET avatar = $1 WHERE id = $2 RETURNING *',
    [`/uploads/${req.file.filename}`, req.user.id],
  )

  res.json(toPublic(rows[0]))
})

export default router
