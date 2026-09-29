<script setup>
defineProps({
  size: { type: Number, default: 20 },
})
</script>

<template>
  <div class="brand">
    <img class="brand__logo" src="/favicon.svg" alt="" :width="size" :height="size" />
    <div class="brand__name">Городской портал</div>
    <div class="brand__city">Красноярск</div>
  </div>
</template>