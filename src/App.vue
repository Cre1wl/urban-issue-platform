<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import useUser from './composables/useUser'

const { load } = useUser()

onMounted(load)
</script>

<template>
  <RouterView />
</template>
