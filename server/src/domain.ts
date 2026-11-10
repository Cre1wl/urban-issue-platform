export interface UserRow {
  id: number
  email: string
  nickname: string
  password_hash: string
  role: UserRole
  avatar: string | null
  created_at: string
  is_blocked: boolean
}

export type UserRole = 'resident' | 'moderator' | 'admin'

export interface TokenPayload {
  id: number
  role: UserRole
}

export interface PublicUser {
  id: number
  email: string
  nickname: string
  avatar: string | null
  role: UserRole
  createdAt: string
}

export interface CategoryRow {
  id: number
  name: string
  description: string
  color: string
  icon: string
  is_active: boolean
  is_system: boolean
  sort_order: number
  resolve_hours: number | null
  created_at: string
}

export interface StatusRow {
  id: number
  key: string | null
  name: string
  description: string
  color: string
  is_default: boolean
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface ServiceRow {
  id: number
  name: string
  created_at: string
}

export interface IssueRow {
  id: number
  category_id: number
  description: string
  photo_urls: string[]
  latitude: number
  longitude: number
  address: string
  status_id: number
  assignee: number | null
  reject_reason: string | null
  resolved_photo_url: string | null
  author_id: number
  votes: number
  created_at: string
}

export interface CommentRow {
  id: number
  issue_id: number
  user_id: number
  text: string
  created_at: string
  nickname: string
  avatar: string | null
}

export interface HistoryRow {
  id: number
  from_name: string | null
  from_color: string | null
  to_name: string | null
  to_color: string | null
  changed_by: string
  comment: string | null
  created_at: string
}
