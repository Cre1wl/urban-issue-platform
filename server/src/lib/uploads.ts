import { randomUUID } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import multer from 'multer'
import type { NextFunction, Request, Response } from 'express'

// Папка загрузок: server/uploads (относительно index.ts, не зависит от cwd)
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

function handle(middleware: (req: Request, res: Response, callback: (err?: unknown) => void) => void) {
  return (req: Request, res: Response, next: NextFunction) => {
    middleware(req, res, (err?: unknown) => {
      if (err) {
        const error = err as Error & { status?: number }
        error.status = 400
        return next(error)
      }
      next()
    })
  }
}

export const avatarUpload = handle(upload.single('avatar'))
export const issuePhotos = handle(upload.array('photos', 3))
export const resolvedPhoto = handle(upload.single('resolvedPhoto'))

export function fileUrl(file?: Express.Multer.File): string | null {
  return file ? `/uploads/${file.filename}` : null
}
