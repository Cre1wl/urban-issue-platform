// Общие серверные типы: строка таблицы users и payload JWT
export interface UserRow {
  id: number
  email: string
  nickname: string
  password_hash: string
  role: string
  avatar: string | null
  created_at: string
  is_blocked: boolean
}

export interface TokenPayload {
  id: number
  role: string
}

export interface PublicUser {
  id: number
  email: string
  nickname: string
  avatar: string | null
  role: string
  createdAt: string
}
