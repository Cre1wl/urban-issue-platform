import Map from 'ol/Map'
import View from 'ol/View'
import { fromLonLat, toLonLat, transformExtent } from 'ol/proj'
import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'
import { createBasemapLayer, createIssuesLayer } from '../map/layers'

// Ограничение области показа картой города (координаты в EPSG:4326)
const CITY_BOUNDS = [92.62, 55.93, 93.12, 56.1]
const CITY_CENTER = [92.8714, 56.0153]
const INITIAL_ZOOM = 13
const MIN_ZOOM = 12

const formatCoords = (ll: number[]): string => `${ll[1].toFixed(5)}, ${ll[0].toFixed(5)}`

function createCityView(): View {
  return new View({
    center: fromLonLat(CITY_CENTER),
    zoom: INITIAL_ZOOM,
    minZoom: MIN_ZOOM,
    extent: transformExtent(CITY_BOUNDS, 'EPSG:4326', 'EPSG:3857'),
  })
}

// Создаёт карту и отдаёт компоненту реактивное состояние координат.
// target — template ref контейнера карты.
export function useCityMap(target: Ref<HTMLElement | null>) {
  const cursor = ref<string>('') // координаты под курсором
  const pinned = ref<string>('') // координаты выбранной точки
  let map: Map | null = null

  onMounted(() => {
    if (!target.value) return
    map = new Map({
      target: target.value,
      layers: [createBasemapLayer(), createIssuesLayer()],
      view: createCityView(),
    })

    // Координаты под курсором и в точке клика
    map.on('pointermove', (evt: any) => {
      if (!evt.dragging) cursor.value = formatCoords(toLonLat(evt.coordinate))
    })
    map.on('singleclick', (evt: any) => {
      pinned.value = formatCoords(toLonLat(evt.coordinate))
    })
  })

  // Освобождаем ресурсы карты при удалении компонента
  onBeforeUnmount(() => {
    map?.setTarget(undefined as any)
    map = null
  })

  const clearPin = () => {
    pinned.value = ''
  }

  return { cursor, pinned, clearPin }
}
