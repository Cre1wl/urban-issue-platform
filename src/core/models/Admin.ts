import type { UserRole } from '../constants/roles'

export interface AdminUser {
  id: number
  email: string
  nickname: string
  avatar: string | null
  role: UserRole
  isBlocked: boolean
  createdAt: string
}

export interface AdminUserPatch {
  role?: UserRole
  isBlocked?: boolean
}

export interface CountByGroup {
  id: number
  key?: string | null
  name: string
  color: string
  count: number
}

export interface ModerationStats {
  total: number
  byStatus: CountByGroup[]
  byCategory: CountByGroup[]
  avgResolveHours: number | null
}
