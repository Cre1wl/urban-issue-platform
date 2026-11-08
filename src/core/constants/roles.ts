// Роли из ТЗ: гость не хранится в БД, остальные приходят с бэкенда
export type UserRole = 'guest' | 'resident' | 'moderator' | 'admin'

export const ROLE_LABELS: Record<UserRole, string> = {
  guest: 'Гость',
  resident: 'Житель',
  moderator: 'Модератор',
  admin: 'Администратор',
}

export function roleLabel(role: string): string {
  return ROLE_LABELS[role as UserRole] || role
}
