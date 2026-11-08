import { request } from './api'
import type { UserDto } from '../models/User'

export interface UpdateProfilePayload {
  nickname?: string
  email?: string
  currentPassword?: string
  newPassword?: string
}

// Эндпоинты /api/users/*
export function fetchMe(): Promise<UserDto> {
  return request<UserDto>('/users/me')
}

export function updateProfile(patch: UpdateProfilePayload): Promise<UserDto> {
  return request<UserDto>('/users/me', { method: 'PATCH', body: patch })
}

export function uploadAvatar(file: File): Promise<UserDto> {
  const formData = new FormData()
  formData.append('avatar', file)
  return request<UserDto>('/users/me/avatar', { method: 'POST', formData })
}
