import type { PublicUser, UserRow } from '../domain'

// Преобразует строку из таблицы users в объект для API:
// camelCase вместо snake_case и без password_hash.
export function toPublic(row: UserRow): PublicUser {
  return {
    id: row.id,
    email: row.email,
    nickname: row.nickname,
    avatar: row.avatar,
    role: row.role,
    createdAt: row.created_at,
  }
}
