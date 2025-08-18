<template>
  <div class="search-page">
    <div v-if="!hasResults" class="search-section">
      <div class="search-container">
        <h1 class="search-title">Buscador de Libros</h1>
        
        <div class="search-box">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Escribe el nombre de un Libro para continuar"
            @keyup.enter="searchBooks"
          />
          <button @click="searchBooks" class="btn btn-primary" :disabled="!searchQuery || loading">
            {{ loading ? 'Buscando...' : 'Buscar' }}
          </button>
        </div>

        <div v-if="recentSearches.length > 0" class="recent-searches">
          <h3>Búsquedas recientes:</h3>
          <div class="search-history">
            <span
              v-for="search in recentSearches"
              :key="search"
              @click="searchFromHistory(search)"
              class="search-tag"
            >
              {{ search }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="results-section">
      <div class="results-header">
        <button @click="clearResults" class="btn btn-secondary">
          ← Nueva Búsqueda
        </button>
        <h2>Resultados para: "{{ lastSearchQuery }}"</h2>
      </div>

      <div v-if="searchResults.length === 0 && !loading" class="no-results">
        <h3>No encontramos libros con el título ingresado</h3>
        <button @click="clearResults" class="btn btn-primary">
          Intentar otra búsqueda
        </button>
      </div>

      <div v-else class="results-grid">
        <div
          v-for="book in searchResults"
          :key="book.key || book.title"
          @click="selectBook(book)"
          class="book-card"
          :class="{ 'in-library': book.inLibrary }"
        >
          <img
            v-if="book.coverUrl || book.localCoverUrl"
            :src="book.localCoverUrl || book.coverUrl"
            :alt="book.title"
            class="book-cover"
            @error="handleImageError($event)"
          />
          <div v-else class="book-cover-placeholder">
            <span>Sin portada</span>
          </div>
          
          <div class="book-info">
            <h3 class="book-title">{{ book.title }}</h3>
            <p class="book-author">{{ book.author }}</p>
            <p v-if="book.publishYear" class="book-year">{{ book.publishYear }}</p>
            <div v-if="book.inLibrary" class="library-badge">
              ✓ En tu biblioteca
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para agregar libro -->
    <AddBookModal
      v-if="selectedBook"
      :book-data="selectedBook"
      @close="selectedBook = null"
      @saved="handleBookSaved"
    />

    <!-- Mensaje de éxito -->
    <UiSuccessMessage
      v-if="showSuccess"
      message="¡Libro agregado exitosamente a tu biblioteca!"
      @close="showSuccess = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useBooksStore } from '~/stores/books'
import AddBookModal from '~/components/ui/AddBookModal.vue'

definePageMeta({
  middleware: 'auth'
})

const booksStore = useBooksStore()

const searchQuery = ref('')
const lastSearchQuery = ref('')
const loading = ref(false)
const selectedBook = ref(null)
const showSuccess = ref(false)

const searchResults = computed(() => booksStore.getSearchResults)
const recentSearches = computed(() => booksStore.getRecentSearches)
const hasResults = computed(() => searchResults.value.length > 0 || lastSearchQuery.value)

onMounted(async () => {
  await booksStore.fetchRecentSearches()
})

const searchBooks = async () => {
  if (!searchQuery.value.trim()) return
  
  loading.value = true
  lastSearchQuery.value = searchQuery.value
  await booksStore.searchBooks(searchQuery.value)
  loading.value = false
}

const searchFromHistory = (search) => {
  searchQuery.value = search
  searchBooks()
}

const clearResults = () => {
  booksStore.clearSearchResults()
  lastSearchQuery.value = ''
  searchQuery.value = ''
}

const selectBook = (book) => {
  if (book.inLibrary && book.libraryBookId) {
    // Si el libro ya está en la biblioteca, ir al detalle
    navigateTo(`/library/${book.libraryBookId}`)
  } else {
    // Si no está, abrir modal para agregar
    selectedBook.value = {
      title: book.title,
      author: book.author_name ? book.author_name[0] : 'Autor desconocido',
      publishYear: book.first_publish_year || null,
      coverUrl: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` : null,
      key: book.key
    }
  }
}

const handleBookSaved = () => {
  showSuccess.value = true
  // Actualizar resultados de búsqueda
  searchBooks()
  setTimeout(() => {
    showSuccess.value = false
  }, 3000)
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
  const placeholder = event.target.nextElementSibling
  if (placeholder) {
    placeholder.style.display = 'flex'
  }
}
</script>

<style scoped>
.search-page {
  min-height: calc(100vh - 80px);
}

.results-section {
  padding: 2rem;
}

.results-header {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.results-header h2 {
  flex: 1;
  margin: 0;
  color: #333;
}

.no-results {
  background: white;
  border-radius: 1rem;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.no-results h3 {
  color: #666;
  margin-bottom: 1.5rem;
}

.book-card {
  position: relative;
}

.book-card.in-library {
  border: 2px solid #10b981;
}

.library-badge {
  background: #10b981;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  margin-top: 0.5rem;
  text-align: center;
}

.book-cover-placeholder {
  width: 100%;
  height: 280px;
  background: linear-gradient(135deg, #e5e7eb 0%, #f3f4f6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 0.875rem;
}

.book-year {
  font-size: 0.75rem;
  color: #999;
  margin-top: 0.25rem;
}
</style>