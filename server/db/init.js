import 'dotenv/config'
import { readFileSync } from 'node:fs'
import pool from './pool.js'

const schema = readFileSync(new URL('./schema.sql', import.meta.url), 'utf8')

await pool.query(schema)
await pool.end()
console.log('Схема применена: таблица users готова')
