import { request } from './api'

// Эндпоинты /api/auth/*
export function login(email, password) {
  return request('/auth/login', { method: 'POST', body: { email, password } })
}

export function register({ email, nickname, password }) {
  return request('/auth/register', { method: 'POST', body: { email, nickname, password } })
}
