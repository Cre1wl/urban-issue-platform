<script setup>
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import XYZ from 'ol/source/XYZ'
import VectorSource from 'ol/source/Vector'
import ScaleLine from 'ol/control/ScaleLine'
import { defaults as defaultControls } from 'ol/control/defaults'
import { fromLonLat, toLonLat, transformExtent } from 'ol/proj'
import { onMounted, useTemplateRef, ref } from 'vue'

// Границы Красноярска (lon/lat) — карта не даёт уйти из города
const CITY_BOUNDS = [92.62, 55.93, 93.12, 56.1]

// Ключ CARTO basemaps — из .env, в git не попадает (см. .gitignore)
const CARTO_KEY = import.meta.env.VITE_CARTO_KEY

const el = useTemplateRef('map')

const pinned = ref('')
const live = ref('')
const format = ll => `${ll[1].toFixed(5)}, ${ll[0].toFixed(5)}`

onMounted(() => {
  if (!CARTO_KEY) {
    console.warn('[map] VITE_CARTO_KEY не задан — тайлы с водяным знаком. Ключ: https://carto.com/basemaps/apikey')
  }

  const map = new Map({
    target: el.value,
    controls: defaultControls({ rotate: false }).extend([new ScaleLine({ units: 'metric' })]),
    layers: [
      new TileLayer({
        source: new XYZ({
          url: `https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png?key=${CARTO_KEY}`,
          attributions:
            '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, © <a href="https://carto.com/attribution/">CARTO</a>',
          maxZoom: 19,
        }),
      }),
      new VectorLayer({ source: new VectorSource() }),
    ],
    view: new View({
      center: fromLonLat([92.8714, 56.0153]),
      zoom: 13,
      minZoom: 12,
      maxExtent: transformExtent(CITY_BOUNDS, 'EPSG:4326', 'EPSG:3857'),
    }),
  })

  // Координаты курсора и точки клика — основа для создания обращения по клику
  map.on('pointermove', evt => {
    if (!evt.dragging) live.value = format(toLonLat(evt.coordinate))
  })
  map.on('singleclick', evt => {
    pinned.value = format(toLonLat(evt.coordinate))
  })
})
</script>

<template>
  <main class="map-wrap">
    <div ref="map" class="map"></div>

    <button class="map-readout" :title="pinned ? 'Снять точку' : ''" @click.stop="pinned = ''">
      <span v-if="pinned" class="map-readout__value">{{ pinned }}</span>
      <span v-if="pinned" class="map-readout__hint">снять</span>
      <span v-else class="map-readout__value map-readout__value--live">
        {{ live || 'наведите курсор' }}
      </span>
    </button>
  </main>
</template>