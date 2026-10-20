const API = '/api'

async function request(path, { method = 'GET', body, formData } = {}) {
  const headers = {}
  const token = localStorage.getItem('token')
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

export function saveToken(token) {
  localStorage.setItem('token', token)
}

export function clearToken() {
  localStorage.removeItem('token')
}

export function hasToken() {
  return Boolean(localStorage.getItem('token'))
}

export function login(email, password) {
  return request('/auth/login', { method: 'POST', body: { email, password } })
}

export function register({ email, nickname, password }) {
  return request('/auth/register', { method: 'POST', body: { email, nickname, password } })
}

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
