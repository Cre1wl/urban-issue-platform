// Границы города должны совпадать с проверкой на сервере (server/src/lib/validation.ts)
export const CITY_BOUNDS = {
  minLat: 55.93,
  maxLat: 56.1,
  minLng: 92.62,
  maxLng: 93.12,
}

export const CITY_CENTER: [number, number] = [92.8714, 56.0153]

export function isInCity(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= CITY_BOUNDS.minLat &&
    lat <= CITY_BOUNDS.maxLat &&
    lng >= CITY_BOUNDS.minLng &&
    lng <= CITY_BOUNDS.maxLng
  )
}

export interface Point {
  lat: number
  lng: number
}

export function formatPoint(point: Point | null): string {
  if (!point) return ''
  return `${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`
}
