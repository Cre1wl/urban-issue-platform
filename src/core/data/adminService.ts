import { request } from './api'
import type { AdminUser, AdminUserPatch, ModerationStats } from '../models/Admin'

export function fetchUsers(search = ''): Promise<AdminUser[]> {
  const value = search.trim()
  const query = value ? `?search=${encodeURIComponent(value)}` : ''
  return request<AdminUser[]>(`/admin/users${query}`)
}

export function updateUser(id: number, patch: AdminUserPatch): Promise<AdminUser> {
  return request<AdminUser>(`/admin/users/${id}`, { method: 'PATCH', body: patch })
}

export function fetchStats(): Promise<ModerationStats> {
  return request<ModerationStats>('/admin/stats')
}
