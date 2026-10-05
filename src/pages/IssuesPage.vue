<script setup>
import AppHeader from '../components/AppHeader.vue'
import IssueSidebar from '../components/IssueSidebar.vue'
import IssueMap from '../components/IssueMap.vue'
</script>

<template>
  <div class="map-page">
    <AppHeader />
    <div class="workspace">
      <IssueSidebar />
      <IssueMap />
    </div>
  </div>
</template>

<style scoped>
.map-page {
  height: 100%;
  display: grid;
  grid-template-rows: 56px 1fr;
  overflow: hidden;
}

.workspace {
  display: grid;
  grid-template-columns: 340px 1fr;
  min-height: 0;
}

@media (max-width: 900px) {
  .workspace {
    grid-template-columns: 300px 1fr;
  }
}
</style>
