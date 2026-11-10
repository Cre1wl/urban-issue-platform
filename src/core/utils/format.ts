// Форматирование дат и чисел в интерфейсе
export function formatDate(value: string | null | undefined): string {
  if (!value) return ''
  return new Date(value).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return ''
  return new Date(value).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatTime(value: string | null | undefined): string {
  if (!value) return ''
  return new Date(value).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

export function plural(count: number, one: string, few: string, many: string): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few
  return many
}

export function formatHours(hours: number | null): string {
  if (hours === null) return '—'
  if (hours < 24) return `${hours} ч`
  return `${Math.round(hours / 24)} дн`
}

export function resolveLabel(hours: number | null): string {
  if (!hours) return ''
  return hours < 24 ? `${hours} ч` : `${Math.round(hours / 24)} дн`
}
