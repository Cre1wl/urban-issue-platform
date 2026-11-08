import { getToken } from '../auth/tokenStorage'

const API = '/api'

export interface RequestOptions {
  method?: string
  body?: unknown
  formData?: FormData
}

export async function request<T>(path: string, { method = 'GET', body, formData }: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {}
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  if (body && !formData) headers['Content-Type'] = 'application/json'

  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: formData || (body ? JSON.stringify(body) : undefined),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Сервер недоступен')
  return data as T
}
