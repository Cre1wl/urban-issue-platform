import { Router } from 'express'
import pool from '../../db/pool'
import auth from '../middleware/auth'
import requireRole from '../middleware/roles'
import { toCategory } from '../lib/mappers'
import { isHexColor, int, intOrNull, text } from '../lib/validation'
import type { CategoryRow } from '../domain'

const router = Router()
const moderator = [auth, requireRole('moderator')]

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM categories WHERE is_active = true ORDER BY sort_order, name',
    )
    res.json(rows.map((row) => toCategory(row as CategoryRow)))
  } catch (err) {
    next(err)
  }
})

router.get('/all', ...moderator, async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM categories ORDER BY sort_order, name')
    res.json(rows.map((row) => toCategory(row as CategoryRow)))
  } catch (err) {
    next(err)
  }
})

router.post('/', ...moderator, async (req, res, next) => {
  try {
    const name = text(req.body.name, 80)
    const description = text(req.body.description, 300)
    const color = String(req.body.color || '')
    const icon = text(req.body.icon, 200) || 'warning'
    const sortOrder = int(req.body.sortOrder)
    const resolveHours = intOrNull(req.body.resolveHours)

    if (name.length < 2) return res.status(400).json({ error: 'Название от 2 символов' })
    if (!isHexColor(color)) return res.status(400).json({ error: 'Цвет в формате #RRGGBB' })
    if (resolveHours !== null && resolveHours < 1) {
      return res.status(400).json({ error: 'Срок решения должен быть положительным' })
    }

    const { rows } = await pool.query(
      `INSERT INTO categories (name, description, color, icon, sort_order, resolve_hours, created_by)
       VALUES ($1, $2, $3, $4, COALESCE($5, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM categories)), $6, $7)
       RETURNING *`,
      [name, description, color, icon, sortOrder, resolveHours, req.user!.id],
    )
    res.status(201).json(toCategory(rows[0] as CategoryRow))
  } catch (err: any) {
    if (err?.code === '23505') return res.status(409).json({ error: 'Категория с таким названием уже есть' })
    next(err)
  }
})

router.patch('/:id', ...moderator, async (req, res, next) => {
  try {
    const id = int(req.params.id)
    if (!id) return res.status(400).json({ error: 'Неверный идентификатор' })

    const { rows } = await pool.query('SELECT * FROM categories WHERE id = $1', [id])
    const category = rows[0] as CategoryRow | undefined
    if (!category) return res.status(404).json({ error: 'Категория не найдена' })

    const name = req.body.name !== undefined ? text(req.body.name, 80) : category.name
    const description =
      req.body.description !== undefined ? text(req.body.description, 300) : category.description
    const color = req.body.color !== undefined ? String(req.body.color) : category.color
    const icon = req.body.icon !== undefined ? text(req.body.icon, 200) : category.icon
    const sortOrder =
      req.body.sortOrder !== undefined ? (int(req.body.sortOrder) ?? category.sort_order) : category.sort_order
    const resolveHours =
      req.body.resolveHours !== undefined
        ? intOrNull(req.body.resolveHours)
        : category.resolve_hours

    if (name.length < 2) return res.status(400).json({ error: 'Название от 2 символов' })
    if (!isHexColor(color)) return res.status(400).json({ error: 'Цвет в формате #RRGGBB' })
    if (resolveHours !== null && resolveHours < 1) {
      return res.status(400).json({ error: 'Срок решения должен быть положительным' })
    }

    const updated = await pool.query(
      `UPDATE categories SET name = $1, description = $2, color = $3, icon = $4, sort_order = $5,
       resolve_hours = $6 WHERE id = $7 RETURNING *`,
      [name, description, color, icon, sortOrder, resolveHours, id],
    )
    res.json(toCategory(updated.rows[0] as CategoryRow))
  } catch (err: any) {
    if (err?.code === '23505') return res.status(409).json({ error: 'Категория с таким названием уже есть' })
    next(err)
  }
})

router.post('/:id/deactivate', ...moderator, (req, res, next) => setActive(req, res, next, false))
router.post('/:id/activate', ...moderator, (req, res, next) => setActive(req, res, next, true))

async function setActive(req: any, res: any, next: any, active: boolean) {
  try {
    const id = int(req.params.id)
    if (!id) return res.status(400).json({ error: 'Неверный идентификатор' })

    const { rows } = await pool.query('SELECT * FROM categories WHERE id = $1', [id])
    const category = rows[0] as CategoryRow | undefined
    if (!category) return res.status(404).json({ error: 'Категория не найдена' })
    if (category.is_system) {
      return res.status(400).json({ error: 'Системную категорию нельзя деактивировать' })
    }

    const updated = await pool.query('UPDATE categories SET is_active = $1 WHERE id = $2 RETURNING *', [
      active,
      id,
    ])
    res.json(toCategory(updated.rows[0] as CategoryRow))
  } catch (err) {
    next(err)
  }
}

router.delete('/:id', ...moderator, async (req, res, next) => {
  try {
    const id = int(req.params.id)
    if (!id) return res.status(400).json({ error: 'Неверный идентификатор' })

    const { rows } = await pool.query('SELECT * FROM categories WHERE id = $1', [id])
    const category = rows[0] as CategoryRow | undefined
    if (!category) return res.status(404).json({ error: 'Категория не найдена' })
    if (category.is_system) {
      return res.status(400).json({ error: 'Системную категорию нельзя удалить' })
    }

    const used = await pool.query('SELECT COUNT(*)::int AS count FROM issues WHERE category_id = $1', [id])
    if (used.rows[0].count > 0) {
      return res.status(409).json({ error: 'В категории есть обращения. Сначала перенесите их' })
    }

    await pool.query('DELETE FROM categories WHERE id = $1', [id])
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

export default router
