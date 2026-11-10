import Feature from 'ol/Feature'
import Map from 'ol/Map'
import Overlay from 'ol/Overlay'
import View from 'ol/View'
import Point from 'ol/geom/Point'
import { containsCoordinate } from 'ol/extent'
import { fromLonLat, toLonLat, transformExtent } from 'ol/proj'
import Icon from 'ol/style/Icon'
import Style from 'ol/style/Style'
import { onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import { createBasemapLayer, createIssuesLayer, createPointLayer } from '../map/layers'
import { markerSource, pointMarkerSource } from '../map/markers'
import { CITY_BOUNDS, CITY_CENTER, formatPoint, type Point as GeoPoint } from '../core/constants/city'
import type { Issue } from '../core/models/Issue'

const INITIAL_ZOOM = 13
const MIN_ZOOM = 12

interface CityMapOptions {
  target: Ref<HTMLElement | null>
  popupEl: Ref<HTMLElement | null>
  issues: Ref<Issue[]>
  selectedId: Ref<number | null>
  hiddenCategories: Ref<Set<number>>
  picking: Ref<boolean>
  point: Ref<GeoPoint | null>
  onSelect: (id: number | null) => void
  onOpen: (issue: Issue) => void
  onPick: (point: GeoPoint) => void
}

function createCityView(): View {
  return new View({
    center: fromLonLat(CITY_CENTER),
    zoom: INITIAL_ZOOM,
    minZoom: MIN_ZOOM,
    extent: transformExtent(
      [CITY_BOUNDS.minLng, CITY_BOUNDS.minLat, CITY_BOUNDS.maxLng, CITY_BOUNDS.maxLat],
      'EPSG:4326',
      'EPSG:3857',
    ),
  })
}

// Карта города: подложка, слой обращений, метка выбранной точки и popup на Overlay
export function useCityMap(options: CityMapOptions) {
  const cursor = ref<string>('')
  const hovered = ref(false)

  let map: Map | null = null
  let overlay: Overlay | null = null
  const issuesLayer = createIssuesLayer()
  const pointLayer = createPointLayer()
  const source = issuesLayer.getSource()!
  const pointSource = pointLayer.getSource()!

  function issueStyle(feature: Feature): Style | undefined {
    const issue = feature.get('issue') as Issue | undefined
    if (!issue || options.hiddenCategories.value.has(issue.category.id)) return undefined
    const selected = Number(feature.getId()) === options.selectedId.value
    const marker = markerSource(issue.category, issue.status, selected)
    return new Style({
      image: new Icon({
        src: marker.src,
        anchor: marker.anchor,
        anchorXUnits: 'pixels',
        anchorYUnits: 'pixels',
        scale: selected ? 1.08 : 1,
      }),
      zIndex: selected ? 100 : 10,
    })
  }

  function syncIssues() {
    source.clear()
    for (const issue of options.issues.value) {
      const feature = new Feature({
        geometry: new Point(fromLonLat([issue.lng, issue.lat])),
        issue,
      })
      feature.setId(issue.id)
      source.addFeature(feature)
    }
    issuesLayer.changed()
  }

  function syncPoint() {
    pointSource.clear()
    const point = options.point.value
    if (!point) return

    const feature = new Feature({ geometry: new Point(fromLonLat([point.lng, point.lat])) })
    const marker = pointMarkerSource()
    feature.setStyle(
      new Style({
        image: new Icon({
          src: marker.src,
          anchor: marker.anchor,
          anchorXUnits: 'pixels',
          anchorYUnits: 'pixels',
        }),
        zIndex: 200,
      }),
    )
    pointSource.addFeature(feature)
  }

  function refreshStyles() {
    issuesLayer.changed()
  }

  function focusSelected() {
    if (!map) return
    const id = options.selectedId.value
    if (!id) return
    const feature = source.getFeatureById(id)
    const geometry = feature?.getGeometry() as Point | undefined
    if (!geometry) return
    const coordinate = geometry.getCoordinates()
    const view = map.getView()
    const size = map.getSize()
    if (!size) return
    if (!containsCoordinate(view.calculateExtent(size), coordinate)) {
      view.animate({ center: coordinate, duration: 280 })
    }
  }

  function hidePopup() {
    overlay?.setPosition(undefined)
  }

  function openPopup(feature: Feature) {
    const issue = feature.get('issue') as Issue | undefined
    const geometry = feature.getGeometry() as Point | undefined
    if (!issue || !geometry || !overlay) return
    overlay.setPosition(geometry.getCoordinates())
    options.onOpen(issue)
  }

  onMounted(() => {
    if (!options.target.value) return

    map = new Map({
      target: options.target.value,
      layers: [createBasemapLayer(), issuesLayer, pointLayer],
      view: createCityView(),
    })
    issuesLayer.setStyle((feature) => issueStyle(feature as Feature))

    if (options.popupEl.value) {
      overlay = new Overlay({
        element: options.popupEl.value,
        positioning: 'bottom-center',
        offset: [0, -48],
        stopEvent: true,
        autoPan: { animation: { duration: 180 }, margin: 24 },
      })
      map.addOverlay(overlay)
    }

    syncIssues()
    syncPoint()

    map.on('pointermove', (event) => {
      if (event.dragging) return
      const ll = toLonLat(event.coordinate)
      cursor.value = formatPoint({ lat: ll[1], lng: ll[0] })
      const feature = map!.forEachFeatureAtPixel(event.pixel, (item) => item)
      hovered.value = Boolean(feature)
    })

    map.on('singleclick', (event) => {
      if (options.picking.value) {
        const ll = toLonLat(event.coordinate)
        options.onPick({ lat: ll[1], lng: ll[0] })
        return
      }
      const feature = map!.forEachFeatureAtPixel(event.pixel, (item) => item)
      if (feature) {
        options.onSelect(Number(feature.getId()))
        openPopup(feature as Feature)
      } else {
        hidePopup()
        options.onSelect(null)
      }
    })
  })

  watch(options.issues, syncIssues)
  watch(options.hiddenCategories, refreshStyles)
  watch(options.selectedId, () => {
    refreshStyles()
    focusSelected()
  })
  watch(options.point, syncPoint)

  watch(
    [hovered, options.picking],
    ([isHovered, isPicking]) => {
      const element = map?.getTargetElement()
      if (element) element.style.cursor = isPicking ? 'crosshair' : isHovered ? 'pointer' : ''
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    hidePopup()
    map?.setTarget(undefined)
    map = null
    overlay = null
  })

  return { cursor, hidePopup }
}
