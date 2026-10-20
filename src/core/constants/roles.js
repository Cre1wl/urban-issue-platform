// Человекочитаемые названия ролей из ТЗ (resident / moderator / admin)
const ROLE_LABELS = {
  resident: 'Житель',
  moderator: 'Модератор',
  admin: 'Администратор',
}

export function roleLabel(role) {
  return ROLE_LABELS[role] || role
}
