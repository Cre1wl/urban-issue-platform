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