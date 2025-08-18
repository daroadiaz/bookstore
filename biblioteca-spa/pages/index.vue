<template>
  <div></div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

// Redirigir según el estado de autenticación
if (authStore.isAuthenticated) {
  navigateTo('/search')
} else {
  navigateTo('/login')
}
</script>