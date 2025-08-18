<template>
  <header class="main-header">
    <div class="header-title" @click="navigateTo('/')">
      📚 Biblioteca Digital
    </div>
    <div class="header-actions">
      <button class="btn btn-primary" @click="navigateTo('/library')">
        Mi Biblioteca
      </button>
      <button class="btn btn-secondary" @click="handleLogout">
        Cerrar Sesión
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
  navigateTo('/login')
}
</script>