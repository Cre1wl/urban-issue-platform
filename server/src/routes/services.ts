import { Router } from 'express'
import pool from '../../db/pool'
import auth from '../middleware/auth'
import requireRole from '../middleware/roles'
import { toService } from '../lib/mappers'
import { int, text } from '../lib/validation'
import type { ServiceRow } from '../domain'

const router = Router()
const moderator = [auth, requireRole('moderator')]

router.get('/', ...moderator, async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM responsible_services ORDER BY name')
    res.json(rows.map((row) => toService(row as ServiceRow)))
  } catch (err) {
    next(err)
  }
})

router.post('/', ...moderator, async (req, res, next) => {
  try {
    const name = text(req.body.name, 120)
    if (name.length < 2) return res.status(400).json({ error: 'Название от 2 символов' })

    const { rows } = await pool.query(
      'INSERT INTO responsible_services (name, created_by) VALUES ($1, $2) RETURNING *',
      [name, req.user!.id],
    )
    res.status(201).json(toService(rows[0] as ServiceRow))
  } catch (err: any) {
    if (err?.code === '23505') return res.status(409).json({ error: 'Служба с таким названием уже есть' })
    next(err)
  }
})

router.patch('/:id', ...moderator, async (req, res, next) => {
  try {
    const id = int(req.params.id)
    if (!id) return res.status(400).json({ error: 'Неверный идентификатор' })

    const name = text(req.body.name, 120)
    if (name.length < 2) return res.status(400).json({ error: 'Название от 2 символов' })

    const { rows } = await pool.query(
      'UPDATE responsible_services SET name = $1 WHERE id = $2 RETURNING *',
      [name, id],
    )
    if (!rows[0]) return res.status(404).json({ error: 'Служба не найдена' })
    res.json(toService(rows[0] as ServiceRow))
  } catch (err: any) {
    if (err?.code === '23505') return res.status(409).json({ error: 'Служба с таким названием уже есть' })
    next(err)
  }
})

router.delete('/:id', ...moderator, async (req, res, next) => {
  try {
    const id = int(req.params.id)
    if (!id) return res.status(400).json({ error: 'Неверный идентификатор' })

    const { rowCount } = await pool.query('DELETE FROM responsible_services WHERE id = $1', [id])
    if (!rowCount) return res.status(404).json({ error: 'Служба не найдена' })
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

export default router
