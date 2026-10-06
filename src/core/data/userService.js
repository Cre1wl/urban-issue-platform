// Заглушка на время разработки: имитирует ответ сервера.
// Когда появится бэкенд, здесь будет запрос к API — GET /api/users/me
export default function getUser() {
  return { id: 1, nickname: 'Лира', email: 'lira@example.com', role: 'resident', avatar: '', createdAt: '2026-09-15T10:00:00Z' }
}