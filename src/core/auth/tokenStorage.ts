// Хранение JWT в браузере. Токен живёт в localStorage: это единственное
// место, где обращаемся к нему — остальной код работает с functions ниже.
export function saveToken(token: string): void {
  localStorage.setItem('token', token)
}

export function clearToken(): void {
  localStorage.removeItem('token')
}

export function getToken(): string | null {
  return localStorage.getItem('token')
}

export function hasToken(): boolean {
  return Boolean(getToken())
}
