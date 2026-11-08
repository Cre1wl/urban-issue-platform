import type { UserRole } from '../constants/roles'

// Формат пользователя, который отдаёт API
export interface UserDto {
  id: number | null
  email: string
  nickname: string
  avatar: string | null
  role: UserRole
  createdAt: string | null
}

export interface UserData {
  id?: number | string | null
  nickname?: string
  email?: string
  role?: UserRole
  avatar?: string | null
  createdAt?: string | number | Date | null
}

export default class User {
  id: number | string | null
  nickname: string
  email: string
  role: UserRole
  avatar: string | null
  createdAt: string | number | Date | null
  isGuest: boolean

  constructor({
    id = null,
    nickname = '',
    email = '',
    role = 'guest',
    avatar = '',
    createdAt = null,
  }: UserData = {}) {
    this.id = id
    this.nickname = nickname
    this.email = email
    this.role = role
    this.avatar = avatar || ''
    this.createdAt = createdAt
    this.isGuest = !id
  }
}
