import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import XYZ from 'ol/source/XYZ'
import VectorSource from 'ol/source/Vector'

// Ключ подложки CARTO; хранится в .env и в git не попадает
const CARTO_KEY = import.meta.env.VITE_CARTO_KEY

const BASEMAP_URL = 'https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png'

const ATTRIBUTION =
  '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, © <a href="https://carto.com/attribution/">CARTO</a>'

// Растровая подложка CARTO: URL, атрибуция и ключ заданы здесь,
// чтобы инициализация карты оставалась лаконичной
export function createBasemapLayer() {
  if (!CARTO_KEY) {
    console.warn('[map] VITE_CARTO_KEY не задан — тайлы с водяным знаком. Ключ: https://carto.com/basemaps/apikey')
  }

  return new TileLayer({
    source: new XYZ({
      url: `${BASEMAP_URL}?key=${CARTO_KEY}`,
      attributions: ATTRIBUTION,
      maxZoom: 19,
    }),
  })
}

// Слой маркеров обращений. Стили фич добавятся при реализации обращений
export function createIssuesLayer() {
  return new VectorLayer({ source: new VectorSource() })
}
