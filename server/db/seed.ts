import 'dotenv/config'
import bcrypt from 'bcryptjs'
import pool from './pool'

if (!process.env.DATABASE_URL) throw new Error('Не задан DATABASE_URL в server/.env')

// Тестовые пользователи для разработки (роли: resident / moderator / admin)
const users = [
  { email: 'admin@city.local', nickname: 'admin', role: 'admin' },
  { email: 'moderator@city.local', nickname: 'moderator', role: 'moderator' },
  { email: 'demo@city.local', nickname: 'demo', role: 'resident' },
]

const passwordHash = await bcrypt.hash('demo1234', 10)

for (const user of users) {
  const { rows } = await pool.query(
    `INSERT INTO users (email, nickname, password_hash, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role
     RETURNING nickname, role`,
    [user.email, user.nickname, passwordHash, user.role],
  )
  console.log('Готово:', rows[0].nickname, '(' + rows[0].role + ')')
}

// Базовый справочник категорий для наполнения карты в dev-окружении.
// Настройки доступны модератору, повторный запуск не создаёт дубли.
const categories = [
  { name: 'Дороги', description: 'Ямы, тротуары и дорожное покрытие', color: '#e05a4b', icon: 'road', sortOrder: 10, resolveHours: 48 },
  { name: 'Освещение', description: 'Фонари, подсветка и электричество на улицах', color: '#e5a54b', icon: 'light', sortOrder: 20, resolveHours: 24 },
  { name: 'Мусор', description: 'Контейнерные площадки, отходы и уборка территории', color: '#6fae6a', icon: 'trash', sortOrder: 30, resolveHours: 24 },
  { name: 'Вода', description: 'Утечки, прорывы и качество водоснабжения', color: '#5b9cf5', icon: 'water', sortOrder: 40, resolveHours: 12 },
  { name: 'Дома', description: 'Фасады, подъезды и общее имущество домов', color: '#a97bd6', icon: 'building', sortOrder: 50, resolveHours: 72 },
  { name: 'Транспорт', description: 'Остановки, маршруты и работа городского транспорта', color: '#4ca9a2', icon: 'transport', sortOrder: 60, resolveHours: 48 },
  { name: 'Озеленение', description: 'Деревья, кустарники и газоны', color: '#7fb069', icon: 'tree', sortOrder: 70, resolveHours: 72 },
  { name: 'Благоустройство', description: 'Скамейки, урны и малые архитектурные формы', color: '#c08a5e', icon: 'bench', sortOrder: 80, resolveHours: 72 },
]

for (const category of categories) {
  await pool.query(
    `INSERT INTO categories (name, description, color, icon, sort_order, resolve_hours)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT DO NOTHING`,
    [category.name, category.description, category.color, category.icon, category.sortOrder, category.resolveHours],
  )
}
console.log('Категорий в справочнике:', categories.length)

await pool.end()
console.log('Пароль для всех тестовых пользователей: demo1234')
