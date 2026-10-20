import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import authRoutes from './src/routes/auth.js'
import userRoutes from './src/routes/users.js'

if (!process.env.DATABASE_URL) throw new Error('Не задан DATABASE_URL в server/.env')
if (!process.env.JWT_SECRET) throw new Error('Не задан JWT_SECRET в server/.env')

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const uploadsDir = path.join(rootDir, 'uploads')
fs.mkdirSync(uploadsDir, { recursive: true })

const app = express()

app.use(express.json())
app.use('/uploads', express.static(uploadsDir))

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)

app.use((err, req, res, next) => {
  if (err.name === 'MulterError' || err.message === 'Только изображения') {
    return res.status(400).json({ error: err.message })
  }
  res.status(err.status || 500).json({ error: err.message })
})

const port = Number(process.env.PORT) || 3001
app.listen(port, () => {
  console.log(`API: http://localhost:${port}`)
})
