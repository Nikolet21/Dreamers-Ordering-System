<template>
  <div id="app">
    <RouterView/>
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/userStore'
import { onMounted } from 'vue'

const userStore = useUserStore()

onMounted(() => {
  userStore.initializeFromStorage()
})
</script>
