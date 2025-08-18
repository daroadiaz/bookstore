<template>
  <div class="search-section">
    <div class="search-container">
      <h1 class="search-title">Buscar Libros</h1>
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Escribe el nombre de un Libro para continuar"
          @keyup.enter="handleSearch"
        />
        <button 
          class="btn btn-primary" 
          @click="handleSearch"
          :disabled="!searchQuery.trim() || loading"
        >
          {{ loading ? 'Buscando...' : 'Buscar' }}
        </button>
      </div>
      
      <div v-if="recentSearches.length > 0" class="recent-searches">
        <h3>Búsquedas recientes:</h3>
        <div class="search-history">
          <span
            v-for="search in recentSearches"
            :key="search"
            class="search-tag"
            @click="performSearch(search)"
          >
            {{ search }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBooksStore } from '~/stores/books'

const booksStore = useBooksStore()
const searchQuery = ref('')
const loading = computed(() => booksStore.isLoading)
const recentSearches = computed(() => booksStore.getRecentSearches)

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    performSearch(searchQuery.value)
  }
}

const performSearch = async (query: string) => {
  searchQuery.value = query
  await booksStore.searchBooks(query)
}
</script>