import type { TokenPayload } from '../domain'

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload
      file?: Express.Multer.File
    }
  }
}

export {}
