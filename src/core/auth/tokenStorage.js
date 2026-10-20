// Хранение JWT в браузере. Токен живёт в localStorage: это единственное
// место, где обращаемся к нему — остальной код работает с functions ниже.
export function saveToken(token) {
  localStorage.setItem('token', token)
}

export function clearToken() {
  localStorage.removeItem('token')
}

export function getToken() {
  return localStorage.getItem('token')
}

export function hasToken() {
  return Boolean(getToken())
}
