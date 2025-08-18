<template>
  <div class="search-section">
    <div class="search-container">
      <h2 class="search-title">Iniciar Sesión</h2>
      <form @submit.prevent="handleLogin">
        <div style="margin-bottom: 1rem;">
          <input
            v-model="username"
            type="text"
            placeholder="Usuario"
            required
            style="width: 100%; padding: 1rem; border: 2px solid #e5e7eb; border-radius: 0.5rem; font-size: 1rem;"
          />
        </div>
        <div style="margin-bottom: 1.5rem;">
          <input
            v-model="password"
            type="password"
            placeholder="Contraseña"
            required
            style="width: 100%; padding: 1rem; border: 2px solid #e5e7eb; border-radius: 0.5rem; font-size: 1rem;"
          />
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%;">
          Ingresar
        </button>
      </form>
      <div v-if="error" style="margin-top: 1rem; color: #ef4444; text-align: center;">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const username = ref('admin')
const password = ref('admin123')
const error = ref('')

const handleLogin = () => {
  error.value = ''
  
  if (authStore.login(username.value, password.value)) {
    navigateTo('/')
  } else {
    error.value = 'Credenciales incorrectas'
  }
}
</script>