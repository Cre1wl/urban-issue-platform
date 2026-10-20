// Преобразует строку таблицы users во «внешний» вид:
// camelCase вместо snake_case и без password_hash.
export function toPublic(row) {
  return {
    id: row.id,
    email: row.email,
    nickname: row.nickname,
    avatar: row.avatar,
    role: row.role,
    createdAt: row.created_at,
  }
}
