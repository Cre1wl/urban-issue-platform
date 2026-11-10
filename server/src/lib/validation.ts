export const CITY = {
  minLat: 55.93,
  maxLat: 56.1,
  minLng: 92.62,
  maxLng: 93.12,
}

export function isInCity(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= CITY.minLat &&
    lat <= CITY.maxLat &&
    lng >= CITY.minLng &&
    lng <= CITY.maxLng
  )
}

export function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value)
}

export function text(value: unknown, max: number): string {
  return String(value ?? '').trim().slice(0, max)
}

export function intOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isInteger(parsed) ? parsed : null
}

export function int(value: unknown): number | null {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}
