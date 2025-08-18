<template>
  <div class="app-container">
    <header class="main-header">
      <div class="header-left">
        <NuxtLink to="/search" class="header-title">
          📚 Biblioteca Virtual
        </NuxtLink>
      </div>
      
      <div class="header-center">
        <div v-if="showSearchBar" class="header-search">
          <input
            v-model="quickSearch"
            type="text"
            placeholder="Buscar libros..."
            @keyup.enter="performQuickSearch"
          />
          <button @click="performQuickSearch" class="btn-search">
            🔍
          </button>
        </div>
      </div>
      
      <div class="header-actions">
        <NuxtLink to="/search" class="btn btn-secondary">
          🔍 Buscar
        </NuxtLink>
        <NuxtLink to="/library" class="btn btn-primary">
          📚 Mi Biblioteca
        </NuxtLink>
        <div class="user-info">
          <span>👤 {{ username }}</span>
          <button @click="logout" class="btn btn-danger">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </header>
    
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useBooksStore } from '~/stores/books'
import { useRoute, useRouter } from 'vue-router'

const authStore = useAuthStore()
const booksStore = useBooksStore()
const route = useRoute()
const router = useRouter()

const quickSearch = ref('')
const username = computed(() => authStore.user?.username || 'Usuario')
const showSearchBar = computed(() => route.path !== '/search' && route.path !== '/login')

const performQuickSearch = async () => {
  if (quickSearch.value.trim()) {
    await booksStore.searchBooks(quickSearch.value)
    router.push('/search')
    quickSearch.value = ''
  }
}

const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.main-header {
  background: rgba(255, 255, 255, 0.98);
  padding: 1rem 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  flex: 0 0 auto;
}

.header-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #667eea;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 0 2rem;
}

.header-search {
  display: flex;
  gap: 0.5rem;
  max-width: 500px;
  width: 100%;
}

.header-search input {
  flex: 1;
  padding: 0.5rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
}

.header-search input:focus {
  outline: none;
  border-color: #667eea;
}

.btn-search {
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
}

.btn-search:hover {
  background: #5a67d8;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-left: 1rem;
  border-left: 1px solid #e5e7eb;
}

.user-info span {
  color: #666;
  font-size: 0.875rem;
}

.main-content {
  min-height: calc(100vh - 80px);
  padding: 0;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: white;
  color: #667eea;
  border: 1px solid #667eea;
}

.btn-secondary:hover {
  background: #f7f9ff;
}

.btn-danger {
  background: #ef4444;
  color: white;
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
}

.btn-danger:hover {
  background: #dc2626;
}

@media (max-width: 768px) {
  .main-header {
    flex-wrap: wrap;
    padding: 1rem;
  }
  
  .header-center {
    order: 3;
    width: 100%;
    padding: 1rem 0 0 0;
  }
  
  .header-actions {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
}
</style>