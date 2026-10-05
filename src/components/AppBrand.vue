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

<style scoped>
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand__logo {
  display: block;
}

.brand__name {
  font-weight: 600;
  font-size: 14.5px;
  letter-spacing: -0.01em;
}

.brand__city {
  font-size: 12px;
  color: var(--text-muted);
  padding-left: 10px;
  margin-left: 4px;
  border-left: 1px solid var(--border);
}

@media (max-width: 900px) {
  .brand__city {
    display: none;
  }
}
</style>
