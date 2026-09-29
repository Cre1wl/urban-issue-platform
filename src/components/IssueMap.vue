<script setup>
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import XYZ from 'ol/source/XYZ'
import VectorSource from 'ol/source/Vector'
import { fromLonLat, transformExtent } from 'ol/proj'
import { onMounted, useTemplateRef } from 'vue'

// Границы Красноярска (lon/lat) — карта не даёт уйти из города
const CITY_BOUNDS = [92.62, 55.93, 93.12, 56.1]

const el = useTemplateRef('map')

onMounted(() => {
  new Map({
    target: el.value,
    layers: [
      new TileLayer({
        source: new XYZ({
          url: 'https://{a-c}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
          attributions: '© OpenStreetMap contributors, © CARTO',
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
})
</script>

<template>
  <main class="map-wrap">
    <div ref="map" class="map"></div>
  </main>
</template>