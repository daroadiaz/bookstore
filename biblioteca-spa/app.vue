<template>
  <div class="app-container">
    <AppHeader v-if="authStore.isAuthenticated" />
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  authStore.initAuth()
})
</script>