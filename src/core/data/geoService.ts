import { request } from './api'
import type { Point } from '../constants/city'

interface ReverseResponse {
  address: string
}

// Обратное геокодирование выполняет сервер, чтобы не зависеть от CORS и лимитов браузера
export async function reverseGeocode(point: Point): Promise<string> {
  try {
    const data = await request<ReverseResponse>(
      `/geo/reverse?lat=${point.lat}&lng=${point.lng}`,
    )
    return data.address || ''
  } catch {
    return ''
  }
}
