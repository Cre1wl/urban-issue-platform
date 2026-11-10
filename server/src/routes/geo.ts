import { Router } from 'express'
import { isInCity, text } from '../lib/validation'

const router = Router()

interface NominatimResponse {
  display_name?: string
}

// Обратное геокодирование через Nominatim: браузер не ходит во внешний сервис напрямую
router.get('/reverse', async (req, res, next) => {
  try {
    const lat = Number(req.query.lat)
    const lng = Number(req.query.lng)
    if (!isInCity(lat, lng)) return res.status(400).json({ error: 'Точка вне границ города' })

    const url = new URL('https://nominatim.openstreetmap.org/reverse')
    url.searchParams.set('format', 'jsonv2')
    url.searchParams.set('lat', String(lat))
    url.searchParams.set('lon', String(lng))
    url.searchParams.set('accept-language', 'ru')
    url.searchParams.set('zoom', '18')

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 5000)
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'city-portal/1.0 (educational project)' },
    }).finally(() => clearTimeout(timer))

    if (!response.ok) return res.json({ address: '' })
    const data = (await response.json()) as NominatimResponse
    res.json({ address: text(data.display_name, 300) })
  } catch {
    res.json({ address: '' })
  }
})

export default router
