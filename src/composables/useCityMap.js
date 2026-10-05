import Map from 'ol/Map'
import View from 'ol/View'
import ScaleLine from 'ol/control/ScaleLine'
import { defaults as defaultControls } from 'ol/control/defaults'
import { fromLonLat, toLonLat, transformExtent } from 'ol/proj'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { createBasemapLayer, createIssuesLayer } from '../map/layers'

// Границы Красноярска (lon/lat) — карта не даёт уйти из города
const CITY_BOUNDS = [92.62, 55.93, 93.12, 56.1]
const CITY_CENTER = [92.8714, 56.0153]
const INITIAL_ZOOM = 13
const MIN_ZOOM = 12

const formatCoords = ll => `${ll[1].toFixed(5)}, ${ll[0].toFixed(5)}`

function createCityView() {
  return new View({
    center: fromLonLat(CITY_CENTER),
    zoom: INITIAL_ZOOM,
    minZoom: MIN_ZOOM,
    maxExtent: transformExtent(CITY_BOUNDS, 'EPSG:4326', 'EPSG:3857'),
  })
}

function createControls() {
  return defaultControls({ rotate: false }).extend([new ScaleLine({ units: 'metric' })])
}

// Composable: создаёт карту и возвращает её состояние компоненту.
// target — template ref на элемент, куда встраивается карта.
export function useCityMap(target) {
  const cursor = ref('') // координаты под курсором
  const pinned = ref('') // координаты выбранной точки
  let map = null

  onMounted(() => {
    map = new Map({
      target: target.value,
      controls: createControls(),
      layers: [createBasemapLayer(), createIssuesLayer()],
      view: createCityView(),
    })

    // Координаты курсора и точки клика — основа для создания обращения по клику
    map.on('pointermove', evt => {
      if (!evt.dragging) cursor.value = formatCoords(toLonLat(evt.coordinate))
    })
    map.on('singleclick', evt => {
      pinned.value = formatCoords(toLonLat(evt.coordinate))
    })
  })

  // Компонент ушёл со страницы — карта больше не нужна, отпускаем тайлы и слушатели
  onBeforeUnmount(() => {
    map?.setTarget(null)
    map = null
  })

  const clearPin = () => {
    pinned.value = ''
  }

  return { cursor, pinned, clearPin }
}
