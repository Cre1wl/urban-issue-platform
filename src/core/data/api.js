import { getToken } from '../auth/tokenStorage'

const API = '/api'

// Единая обёртка над fetch для всех запросов к API:
// базовый URL, токен в заголовке, разбор ошибок сервера.
export async function request(path, { method = 'GET', body, formData } = {}) {
  const headers = {}
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  if (body) headers['Content-Type'] = 'application/json'

  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: formData || (body ? JSON.stringify(body) : undefined),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Сервер недоступен')
  return data
}
