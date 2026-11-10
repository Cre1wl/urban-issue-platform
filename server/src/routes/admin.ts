import { Router } from 'express'
import pool from '../../db/pool'
import auth from '../middleware/auth'
import requireRole from '../middleware/roles'
import { int, text } from '../lib/validation'
import type { UserRow, UserRole } from '../domain'

const router = Router()
const moderator = [auth, requireRole('moderator')]

const ROLES: UserRole[] = ['resident', 'moderator', 'admin']

function toAdminUser(row: UserRow) {
  return {
    id: row.id,
    email: row.email,
    nickname: row.nickname,
    avatar: row.avatar,
    role: row.role,
    isBlocked: row.is_blocked,
    createdAt: row.created_at,
  }
}

router.get('/users', ...moderator, async (req, res, next) => {
  try {
    const search = text(req.query.search, 100)
    const params: unknown[] = []
    let where = ''
    if (search) {
      params.push(`%${search}%`)
      where = 'WHERE email ILIKE $1 OR nickname ILIKE $1'
    }
    const { rows } = await pool.query(
      `SELECT * FROM users ${where} ORDER BY created_at DESC LIMIT 500`,
      params,
    )
    res.json(rows.map((row) => toAdminUser(row as UserRow)))
  } catch (err) {
    next(err)
  }
})

router.patch('/users/:id', ...moderator, async (req, res, next) => {
  try {
    const id = int(req.params.id)
    if (!id) return res.status(400).json({ error: 'Неверный идентификатор' })

    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id])
    const target = rows[0] as UserRow | undefined
    if (!target) return res.status(404).json({ error: 'Пользователь не найден' })

    const isAdmin = req.user!.role === 'admin'
    const nextRole =
      req.body.role !== undefined ? (String(req.body.role) as UserRole) : target.role
    const nextBlocked =
      req.body.isBlocked !== undefined ? Boolean(req.body.isBlocked) : target.is_blocked

    if (!ROLES.includes(nextRole)) return res.status(400).json({ error: 'Неизвестная роль' })
    if (!isAdmin && nextRole !== target.role) {
      return res.status(403).json({ error: 'Менять роли может только администратор' })
    }
    if (!isAdmin && target.role !== 'resident') {
      return res.status(403).json({ error: 'Модератор может блокировать только жителей' })
    }
    if (target.id === req.user!.id && (nextRole !== target.role || nextBlocked)) {
      return res.status(400).json({ error: 'Нельзя менять свою роль или блокировать себя' })
    }

    const updated = await pool.query(
      'UPDATE users SET role = $1, is_blocked = $2 WHERE id = $3 RETURNING *',
      [nextRole, nextBlocked, id],
    )
    res.json(toAdminUser(updated.rows[0] as UserRow))
  } catch (err) {
    next(err)
  }
})

router.get('/stats', ...moderator, async (req, res, next) => {
  try {
    const total = await pool.query('SELECT COUNT(*)::int AS count FROM issues')
    const byStatus = await pool.query(
      `SELECT s.id, s.key, s.name, s.color, COUNT(i.id)::int AS count
       FROM statuses s LEFT JOIN issues i ON i.status_id = s.id
       GROUP BY s.id ORDER BY s.sort_order`,
    )
    const byCategory = await pool.query(
      `SELECT c.id, c.name, c.color, COUNT(i.id)::int AS count
       FROM categories c LEFT JOIN issues i ON i.category_id = c.id
       GROUP BY c.id ORDER BY c.sort_order`,
    )
    const avg = await pool.query(
      `SELECT ROUND(AVG(EXTRACT(EPOCH FROM (h.created_at - i.created_at)) / 3600)::numeric, 1) AS hours
       FROM status_history h
       JOIN issues i ON i.id = h.issue_id
       JOIN statuses s ON s.id = h.to_status
       WHERE s.key = 'resolved'`,
    )

    res.json({
      total: total.rows[0].count,
      byStatus: byStatus.rows,
      byCategory: byCategory.rows,
      avgResolveHours: avg.rows[0].hours === null ? null : Number(avg.rows[0].hours),
    })
  } catch (err) {
    next(err)
  }
})

export default router
