import 'dotenv/config'
import express, { type Request, type Response, type NextFunction } from 'express'
import { uploadsDir } from './src/lib/uploads'
import authRoutes from './src/routes/auth'
import userRoutes from './src/routes/users'
import categoryRoutes from './src/routes/categories'
import statusRoutes from './src/routes/statuses'
import issueRoutes from './src/routes/issues'
import serviceRoutes from './src/routes/services'
import adminRoutes from './src/routes/admin'
import geoRoutes from './src/routes/geo'

if (!process.env.DATABASE_URL) throw new Error('Не задан DATABASE_URL в server/.env')
if (!process.env.JWT_SECRET) throw new Error('Не задан JWT_SECRET в server/.env')

const app = express()

app.use(express.json())
app.use('/uploads', express.static(uploadsDir))

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/statuses', statusRoutes)
app.use('/api/issues', issueRoutes)
app.use('/api/services', serviceRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/geo', geoRoutes)

app.use((err: Error & { status?: number; code?: string }, req: Request, res: Response, next: NextFunction) => {
  if (err.code === '23505') return res.status(409).json({ error: 'Запись с такими данными уже существует' })
  res.status(err.status || 500).json({ error: err.message })
})

const port = Number(process.env.PORT) || 3001
app.listen(port, () => {
  console.log(`API: http://localhost:${port}`)
})
