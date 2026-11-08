import 'dotenv/config'
import express, { type Request, type Response, type NextFunction } from 'express'
import { uploadsDir } from './src/lib/uploads'
import authRoutes from './src/routes/auth'
import userRoutes from './src/routes/users'

if (!process.env.DATABASE_URL) throw new Error('Не задан DATABASE_URL в server/.env')
if (!process.env.JWT_SECRET) throw new Error('Не задан JWT_SECRET в server/.env')

const app = express()

app.use(express.json())
app.use('/uploads', express.static(uploadsDir))

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)

app.use((err: Error & { status?: number }, req: Request, res: Response, next: NextFunction) => {
  res.status(err.status || 500).json({ error: err.message })
})

const port = Number(process.env.PORT) || 3001
app.listen(port, () => {
  console.log(`API: http://localhost:${port}`)
})
