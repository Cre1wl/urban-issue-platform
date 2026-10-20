import { randomUUID } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import multer from 'multer'

// Папка с аватарами: server/uploads (рядом с index.js, не зависит от cwd)
export const uploadsDir = path.join(fileURLToPath(new URL('../../', import.meta.url)), 'uploads')
mkdirSync(uploadsDir, { recursive: true })

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
    if (!ok) return cb(new Error('Только изображения'))
    cb(null, true)
  },
})

// Обёртка над multer: ошибки загрузки помечаем статусом 400
export function avatarUpload(req, res, next) {
  upload.single('avatar')(req, res, (err) => {
    if (err) {
      err.status = 400
      return next(err)
    }
    next()
  })
}
