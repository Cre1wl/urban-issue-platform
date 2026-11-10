import { Router } from 'express'
import pool from '../../db/pool'
import auth from '../middleware/auth'
import requireRole from '../middleware/roles'
import { toStatus } from '../lib/mappers'
import { isHexColor, int, text } from '../lib/validation'
import type { StatusRow } from '../domain'

const router = Router()
const moderator = [auth, requireRole('moderator')]

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM statuses WHERE is_active = true ORDER BY sort_order, name',
    )
    res.json(rows.map((row) => toStatus(row as StatusRow)))
  } catch (err) {
    next(err)
  }
})

router.get('/all', ...moderator, async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM statuses ORDER BY sort_order, name')
    res.json(rows.map((row) => toStatus(row as StatusRow)))
  } catch (err) {
    next(err)
  }
})

router.post('/', ...moderator, async (req, res, next) => {
  try {
    const name = text(req.body.name, 60)
    const description = text(req.body.description, 300)
    const color = String(req.body.color || '')
    const sortOrder = int(req.body.sortOrder)

    if (name.length < 2) return res.status(400).json({ error: 'Название от 2 символов' })
    if (!isHexColor(color)) return res.status(400).json({ error: 'Цвет в формате #RRGGBB' })

    const { rows } = await pool.query(
      `INSERT INTO statuses (name, description, color, sort_order, created_by)
       VALUES ($1, $2, $3, COALESCE($4, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM statuses)), $5)
       RETURNING *`,
      [name, description, color, sortOrder, req.user!.id],
    )
    res.status(201).json(toStatus(rows[0] as StatusRow))
  } catch (err: any) {
    if (err?.code === '23505') return res.status(409).json({ error: 'Статус с таким названием уже есть' })
    next(err)
  }
})

router.patch('/:id', ...moderator, async (req, res, next) => {
  try {
    const id = int(req.params.id)
    if (!id) return res.status(400).json({ error: 'Неверный идентификатор' })

    const { rows } = await pool.query('SELECT * FROM statuses WHERE id = $1', [id])
    const status = rows[0] as StatusRow | undefined
    if (!status) return res.status(404).json({ error: 'Статус не найден' })

    const name = req.body.name !== undefined ? text(req.body.name, 60) : status.name
    const description =
      req.body.description !== undefined ? text(req.body.description, 300) : status.description
    const color = req.body.color !== undefined ? String(req.body.color) : status.color
    const sortOrder =
      req.body.sortOrder !== undefined ? (int(req.body.sortOrder) ?? status.sort_order) : status.sort_order

    if (name.length < 2) return res.status(400).json({ error: 'Название от 2 символов' })
    if (!isHexColor(color)) return res.status(400).json({ error: 'Цвет в формате #RRGGBB' })

    const updated = await pool.query(
      `UPDATE statuses SET name = $1, description = $2, color = $3, sort_order = $4
       WHERE id = $5 RETURNING *`,
      [name, description, color, sortOrder, id],
    )
    res.json(toStatus(updated.rows[0] as StatusRow))
  } catch (err: any) {
    if (err?.code === '23505') return res.status(409).json({ error: 'Статус с таким названием уже есть' })
    next(err)
  }
})

router.post('/:id/deactivate', ...moderator, (req, res, next) => setActive(req, res, next, false))
router.post('/:id/activate', ...moderator, (req, res, next) => setActive(req, res, next, true))

async function setActive(req: any, res: any, next: any, active: boolean) {
  try {
    const id = int(req.params.id)
    if (!id) return res.status(400).json({ error: 'Неверный идентификатор' })

    const { rows } = await pool.query('SELECT * FROM statuses WHERE id = $1', [id])
    const status = rows[0] as StatusRow | undefined
    if (!status) return res.status(404).json({ error: 'Статус не найден' })
    if (status.is_default) {
      return res.status(400).json({ error: 'Системный статус нельзя деактивировать' })
    }

    const updated = await pool.query('UPDATE statuses SET is_active = $1 WHERE id = $2 RETURNING *', [
      active,
      id,
    ])
    res.json(toStatus(updated.rows[0] as StatusRow))
  } catch (err) {
    next(err)
  }
}

router.delete('/:id', ...moderator, async (req, res, next) => {
  try {
    const id = int(req.params.id)
    if (!id) return res.status(400).json({ error: 'Неверный идентификатор' })

    const { rows } = await pool.query('SELECT * FROM statuses WHERE id = $1', [id])
    const status = rows[0] as StatusRow | undefined
    if (!status) return res.status(404).json({ error: 'Статус не найден' })
    if (status.is_default) {
      return res.status(400).json({ error: 'Системный статус нельзя удалить' })
    }

    const used = await pool.query('SELECT COUNT(*)::int AS count FROM issues WHERE status_id = $1', [id])
    if (used.rows[0].count > 0) {
      return res.status(409).json({ error: 'Статус присвоен обращениям и не может быть удалён' })
    }

    await pool.query('DELETE FROM statuses WHERE id = $1', [id])
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

export default router
