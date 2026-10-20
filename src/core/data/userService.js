import { request } from './api'

// Эндпоинты /api/users/*
export function fetchMe() {
  return request('/users/me')
}

export function updateProfile(patch) {
  return request('/users/me', { method: 'PATCH', body: patch })
}

export function uploadAvatar(file) {
  const formData = new FormData()
  formData.append('avatar', file)
  return request('/users/me/avatar', { method: 'POST', formData })
}
