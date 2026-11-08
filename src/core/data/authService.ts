import { request } from './api'
import type { UserDto } from '../models/User'

export interface AuthResponse {
  token: string
  user: UserDto
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  nickname: string
  password: string
}

export function login(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', { method: 'POST', body: { email, password } })
}

export function register(payload: RegisterPayload): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/register', { method: 'POST', body: payload })
}
