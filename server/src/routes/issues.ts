import { Router } from 'express'
import pool from '../../db/pool'
import auth from '../middleware/auth'
import optionalAuth from '../middleware/optionalAuth'
import requireRole from '../middleware/roles'
import { ISSUE_SELECT, toComment, toHistory, toIssue, type IssueQueryRow } from '../lib/mappers'
import { fileUrl, issuePhotos, resolvedPhoto } from '../lib/uploads'
import { isInCity, int, text } from '../lib/validation'
import type { CategoryRow, CommentRow, HistoryRow, IssueRow, StatusRow } from '../domain'
import type { Request } from 'express'

const router = Router()
const moderator = [auth, requireRole('moderator')]

const PUBLIC_KEYS = ['published', 'resolved']

function viewerId(req: Request): number {
  return req.user?.id ?? 0
}

function isStaff(req: Request): boolean {
  return req.user?.role === 'admin' || req.user?.role === 'moderator'
}

async function loadIssue(req: Request, id: number): Promise<IssueQueryRow | null> {
  const { rows } = await pool.query(`${ISSUE_SELECT} WHERE i.id = $2`, [viewerId(req), id])
  return (rows[0] as IssueQueryRow) ?? null
}

function canView(issue: IssueQueryRow, req: Request): boolean {
  if (isStaff(req)) return true
  if (issue.status_key && PUBLIC_KEYS.includes(issue.status_key)) return true
  return req.user?.id === issue.author_id
}

function uploadedUrls(files: unknown): string[] {
  if (!Array.isArray(files)) return []
  return files.map((file) => fileUrl(file as Express.Multer.File)).filter((url): url is string => Boolean(url))
}

function keepPhotos(raw: unknown): string[] {
  const list = Array.isArray(raw) ? raw : typeof raw === 'string' ? safeJson(raw) : []
  return list.filter((url) => typeof url === 'string' && url.startsWith('/uploads/'))
}

function safeJson(value: string): unknown[] {
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const params: unknown[] = [viewerId(req)]
    const where: string[] = []

    if (!isStaff(req)) {
      where.push(`(s.key IN ('published', 'resolved') OR i.author_id = $1)`)
    }

    const categoryId = int(req.query.categoryId)
    if (categoryId) {
      params.push(categoryId)
      where.push(`i.category_id = $${params.length}`)
    }

    const statusId = int(req.query.statusId)
    if (statusId) {
      params.push(statusId)
      where.push(`i.status_id = $${params.length}`)
    }

    const search = text(req.query.search, 100)
    if (search) {
      params.push(`%${search}%`)
      where.push(`(i.description ILIKE $${params.length} OR i.address ILIKE $${params.length})`)
    }

    const from = dateParam(req.query.from, false)
    if (from) {
      params.push(from)
      where.push(`i.created_at >= $${params.length}`)
    }

    const to = dateParam(req.query.to, true)
    if (to) {
      params.push(to)
      where.push(`i.created_at <= $${params.length}`)
    }

    const orders: Record<string, string> = {
      newest: 'i.created_at DESC',
      oldest: 'i.created_at ASC',
      votes: 'i.votes DESC, i.created_at DESC',
      category: 'c.sort_order, c.name, i.created_at DESC',
      status: 's.sort_order, i.created_at DESC',
    }
    const sort = String(req.query.sort ?? 'newest')
    const order = orders[sort] ?? orders.newest

    const sql = `${ISSUE_SELECT} ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY ${order} LIMIT 500`
    const { rows } = await pool.query(sql, params)
    res.json(rows.map((row) => toIssue(row as IssueQueryRow)))
  } catch (err) {
    next(err)
  }
})

router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const id = int(req.params.id)
    if (!id) return res.status(400).json({ error: 'Неверный идентификатор' })

    const issue = await loadIssue(req, id)
    if (!issue || !canView(issue, req)) return res.status(404).json({ error: 'Обращение не найдено' })

    res.json(toIssue(issue))
  } catch (err) {
    next(err)
  }
})

router.post('/', auth, issuePhotos, async (req, res, next) => {
  try {
    const categoryId = int(req.body.categoryId)
    const description = text(req.body.description, 500)
    const address = text(req.body.address, 300)
    const lat = Number(req.body.lat)
    const lng = Number(req.body.lng)

    if (!categoryId) return res.status(400).json({ error: 'Выберите категорию' })
    if (description.length < 10) return res.status(400).json({ error: 'Описание от 10 символов' })
    if (!isInCity(lat, lng)) {
      return res.status(400).json({ error: 'Точка находится вне границ города' })
    }

    const category = await pool.query('SELECT * FROM categories WHERE id = $1', [categoryId])
    const found = category.rows[0] as CategoryRow | undefined
    if (!found || (!found.is_active && !isStaff(req))) {
      return res.status(400).json({ error: 'Категория недоступна' })
    }

    const pending = await pool.query("SELECT * FROM statuses WHERE key = 'pending'")
    const status = pending.rows[0] as StatusRow | undefined
    if (!status) return res.status(500).json({ error: 'Не настроены системные статусы' })

    const photos = uploadedUrls(req.files).slice(0, 3)
    const inserted = await pool.query(
      `INSERT INTO issues (category_id, description, photo_urls, latitude, longitude, address, status_id, author_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [categoryId, description, photos, lat, lng, address, status.id, req.user!.id],
    )

    const issue = await loadIssue(req, inserted.rows[0].id as number)
    res.status(201).json(issue ? toIssue(issue) : null)
  } catch (err) {
    next(err)
  }
})

router.patch('/:id', auth, issuePhotos, async (req, res, next) => {
  try {
    const id = int(req.params.id)
    if (!id) return res.status(400).json({ error: 'Неверный идентификатор' })

    const { rows } = await pool.query('SELECT * FROM issues WHERE id = $1', [id])
    const issue = rows[0] as IssueRow | undefined
    if (!issue) return res.status(404).json({ error: 'Обращение не найдено' })

    const ownPending = req.user!.id === issue.author_id && (await issueStatusKey(issue.status_id)) === 'pending'
    if (!ownPending && !isStaff(req)) {
      return res.status(403).json({ error: 'Редактировать можно только обращение на модерации' })
    }

    const categoryId = req.body.categoryId !== undefined ? int(req.body.categoryId) : issue.category_id
    const description =
      req.body.description !== undefined ? text(req.body.description, 500) : issue.description
    const address = req.body.address !== undefined ? text(req.body.address, 300) : issue.address
    const lat = req.body.lat !== undefined ? Number(req.body.lat) : Number(issue.latitude)
    const lng = req.body.lng !== undefined ? Number(req.body.lng) : Number(issue.longitude)
    const photos = [
      ...(req.body.keepPhotos !== undefined ? keepPhotos(req.body.keepPhotos) : issue.photo_urls),
      ...uploadedUrls(req.files),
    ].slice(0, 3)

    if (!categoryId) return res.status(400).json({ error: 'Выберите категорию' })
    if (description.length < 10) return res.status(400).json({ error: 'Описание от 10 символов' })
    if (!isInCity(lat, lng)) {
      return res.status(400).json({ error: 'Точка находится вне границ города' })
    }

    const category = await pool.query('SELECT * FROM categories WHERE id = $1', [categoryId])
    const found = category.rows[0] as CategoryRow | undefined
    if (!found) return res.status(400).json({ error: 'Категория не найдена' })

    await pool.query(
      `UPDATE issues SET category_id = $1, description = $2, photo_urls = $3,
       latitude = $4, longitude = $5, address = $6 WHERE id = $7`,
      [categoryId, description, photos, lat, lng, address, id],
    )

    const updated = await loadIssue(req, id)
    res.json(updated ? toIssue(updated) : null)
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', auth, async (req, res, next) => {
  try {
    const id = int(req.params.id)
    if (!id) return res.status(400).json({ error: 'Неверный идентификатор' })

    const { rows } = await pool.query('SELECT * FROM issues WHERE id = $1', [id])
    const issue = rows[0] as IssueRow | undefined
    if (!issue) return res.status(404).json({ error: 'Обращение не найдено' })

    const ownPending = req.user!.id === issue.author_id && (await issueStatusKey(issue.status_id)) === 'pending'
    if (!ownPending && !isStaff(req)) {
      return res.status(403).json({ error: 'Удалить можно только обращение на модерации' })
    }

    await pool.query('DELETE FROM issues WHERE id = $1', [id])
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

router.post('/:id/vote', auth, async (req, res, next) => {
  try {
    const id = int(req.params.id)
    if (!id) return res.status(400).json({ error: 'Неверный идентификатор' })

    const issue = await loadIssue(req, id)
    if (!issue || !canView(issue, req)) return res.status(404).json({ error: 'Обращение не найдено' })

    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      const removed = await client.query('DELETE FROM votes WHERE issue_id = $1 AND user_id = $2', [
        id,
        req.user!.id,
      ])
      const voted = removed.rowCount === 0
      if (voted) {
        await client.query('INSERT INTO votes (issue_id, user_id) VALUES ($1, $2)', [id, req.user!.id])
      }
      const result = await client.query(
        `UPDATE issues SET votes = GREATEST(votes + $1, 0) WHERE id = $2 RETURNING votes`,
        [voted ? 1 : -1, id],
      )
      await client.query('COMMIT')
      res.json({ votes: result.rows[0].votes, voted })
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  } catch (err) {
    next(err)
  }
})

router.get('/:id/comments', optionalAuth, async (req, res, next) => {
  try {
    const id = int(req.params.id)
    if (!id) return res.status(400).json({ error: 'Неверный идентификатор' })

    const issue = await loadIssue(req, id)
    if (!issue || !canView(issue, req)) return res.status(404).json({ error: 'Обращение не найдено' })

    const { rows } = await pool.query(
      `SELECT c.*, u.nickname, u.avatar FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.issue_id = $1 ORDER BY c.created_at`,
      [id],
    )
    res.json(rows.map((row) => toComment(row as CommentRow)))
  } catch (err) {
    next(err)
  }
})

router.post('/:id/comments', auth, async (req, res, next) => {
  try {
    const id = int(req.params.id)
    if (!id) return res.status(400).json({ error: 'Неверный идентификатор' })

    const issue = await loadIssue(req, id)
    if (!issue || !canView(issue, req)) return res.status(404).json({ error: 'Обращение не найдено' })

    const body = text(req.body.text, 1000)
    if (body.length < 1) return res.status(400).json({ error: 'Комментарий не может быть пустым' })

    const inserted = await pool.query(
      'INSERT INTO comments (issue_id, user_id, text) VALUES ($1, $2, $3) RETURNING id',
      [id, req.user!.id, body],
    )
    const { rows } = await pool.query(
      `SELECT c.*, u.nickname, u.avatar FROM comments c
       JOIN users u ON u.id = c.user_id WHERE c.id = $1`,
      [inserted.rows[0].id],
    )
    res.status(201).json(toComment(rows[0] as CommentRow))
  } catch (err) {
    next(err)
  }
})

router.patch('/:id/comments/:commentId', auth, async (req, res, next) => {
  try {
    const id = int(req.params.id)
    const commentId = int(req.params.commentId)
    if (!id || !commentId) return res.status(400).json({ error: 'Неверный идентификатор' })

    const { rows } = await pool.query('SELECT * FROM comments WHERE id = $1 AND issue_id = $2', [
      commentId,
      id,
    ])
    const comment = rows[0] as CommentRow | undefined
    if (!comment) return res.status(404).json({ error: 'Комментарий не найден' })
    if (comment.user_id !== req.user!.id && !isStaff(req)) {
      return res.status(403).json({ error: 'Можно редактировать только свой комментарий' })
    }

    const body = text(req.body.text, 1000)
    if (!body) return res.status(400).json({ error: 'Комментарий не может быть пустым' })

    await pool.query('UPDATE comments SET text = $1 WHERE id = $2', [body, commentId])
    const updated = await pool.query(
      `SELECT c.*, u.nickname, u.avatar FROM comments c
       JOIN users u ON u.id = c.user_id WHERE c.id = $1`,
      [commentId],
    )
    res.json(toComment(updated.rows[0] as CommentRow))
  } catch (err) {
    next(err)
  }
})

router.delete('/:id/comments/:commentId', auth, async (req, res, next) => {
  try {
    const id = int(req.params.id)
    const commentId = int(req.params.commentId)
    if (!id || !commentId) return res.status(400).json({ error: 'Неверный идентификатор' })

    const { rows } = await pool.query('SELECT * FROM comments WHERE id = $1 AND issue_id = $2', [
      commentId,
      id,
    ])
    const comment = rows[0] as CommentRow | undefined
    if (!comment) return res.status(404).json({ error: 'Комментарий не найден' })
    if (comment.user_id !== req.user!.id && !isStaff(req)) {
      return res.status(403).json({ error: 'Можно удалить только свой комментарий' })
    }

    await pool.query('DELETE FROM comments WHERE id = $1', [commentId])
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

router.get('/:id/status', optionalAuth, async (req, res, next) => {
  try {
    const id = int(req.params.id)
    if (!id) return res.status(400).json({ error: 'Неверный идентификатор' })

    const issue = await loadIssue(req, id)
    if (!issue || !canView(issue, req)) return res.status(404).json({ error: 'Обращение не найдено' })

    const { rows } = await pool.query(
      `SELECT h.id, fs.name AS from_name, fs.color AS from_color,
         ts.name AS to_name, ts.color AS to_color,
         u.nickname AS changed_by, h.comment, h.created_at
       FROM status_history h
       LEFT JOIN statuses fs ON fs.id = h.from_status
       LEFT JOIN statuses ts ON ts.id = h.to_status
       JOIN users u ON u.id = h.changed_by
       WHERE h.issue_id = $1 ORDER BY h.created_at`,
      [id],
    )
    res.json(rows.map((row) => toHistory(row as HistoryRow)))
  } catch (err) {
    next(err)
  }
})

router.patch('/:id/status', ...moderator, resolvedPhoto, async (req, res, next) => {
  try {
    const id = int(req.params.id)
    const statusId = int(req.body.statusId)
    if (!id) return res.status(400).json({ error: 'Неверный идентификатор' })
    if (!statusId) return res.status(400).json({ error: 'Выберите статус' })

    const { rows } = await pool.query('SELECT * FROM issues WHERE id = $1', [id])
    const issue = rows[0] as IssueRow | undefined
    if (!issue) return res.status(404).json({ error: 'Обращение не найдено' })

    const current = await pool.query('SELECT * FROM statuses WHERE id = $1', [issue.status_id])
    const fromStatus = current.rows[0] as StatusRow

    const targetResult = await pool.query('SELECT * FROM statuses WHERE id = $1', [statusId])
    const target = targetResult.rows[0] as StatusRow | undefined
    if (!target || !target.is_active) return res.status(400).json({ error: 'Статус недоступен' })
    if (target.key === 'pending') {
      return res.status(400).json({ error: 'Статус «На модерации» назначается автоматически' })
    }
    if (target.id === issue.status_id) {
      return res.status(400).json({ error: 'Статус уже установлен' })
    }

    const allowed = allowedTransition(fromStatus.key, target.key)
    if (!allowed) return res.status(400).json({ error: 'Переход в этот статус не разрешён' })

    const comment = text(req.body.comment, 1000)
    if (target.key === 'rejected' && !comment) {
      return res.status(400).json({ error: 'Укажите причину отклонения' })
    }

    const resolvedFile = fileUrl(req.file as Express.Multer.File | undefined)
    if (target.key === 'resolved' && !resolvedFile && !comment) {
      return res.status(400).json({ error: 'Добавьте фото или отчёт о решении' })
    }

    await pool.query(
      `UPDATE issues SET status_id = $1, reject_reason = $2, resolved_photo_url = COALESCE($3, resolved_photo_url)
       WHERE id = $4`,
      [target.id, target.key === 'rejected' ? comment : issue.reject_reason, resolvedFile, id],
    )
    await pool.query(
      `INSERT INTO status_history (issue_id, from_status, to_status, changed_by, comment)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, issue.status_id, target.id, req.user!.id, comment || null],
    )

    const updated = await loadIssue(req, id)
    res.json(updated ? toIssue(updated) : null)
  } catch (err) {
    next(err)
  }
})

router.patch('/:id/assign', ...moderator, async (req, res, next) => {
  try {
    const id = int(req.params.id)
    if (!id) return res.status(400).json({ error: 'Неверный идентификатор' })

    const serviceId = req.body.serviceId === null ? null : int(req.body.serviceId)
    if (req.body.serviceId !== null && !serviceId) {
      return res.status(400).json({ error: 'Неверная служба' })
    }

    if (serviceId) {
      const service = await pool.query('SELECT id FROM responsible_services WHERE id = $1', [serviceId])
      if (!service.rows[0]) return res.status(404).json({ error: 'Служба не найдена' })
    }

    const updated = await pool.query('UPDATE issues SET assignee = $1 WHERE id = $2 RETURNING id', [
      serviceId,
      id,
    ])
    if (!updated.rows[0]) return res.status(404).json({ error: 'Обращение не найдено' })

    const issue = await loadIssue(req, id)
    res.json(issue ? toIssue(issue) : null)
  } catch (err) {
    next(err)
  }
})

async function issueStatusKey(statusId: number): Promise<string | null> {
  const { rows } = await pool.query('SELECT key FROM statuses WHERE id = $1', [statusId])
  return (rows[0]?.key as string | undefined) ?? null
}

// Дата из строки YYYY-MM-DD; для верхней границы берётся конец дня
function dateParam(value: unknown, endOfDay: boolean): string | null {
  const raw = String(value ?? '').trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null
  const date = new Date(`${raw}T${endOfDay ? '23:59:59' : '00:00:00'}`)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function allowedTransition(from: string | null, to: string | null): boolean {
  if (!to || to === 'pending') return false
  if (from === 'pending') return to === 'published' || to === 'rejected'
  if (from === 'rejected') return to === 'published'
  return true
}

export default router
