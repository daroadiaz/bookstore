<template>
  <div class="library-page">
    <div class="library-header">
      <h1>Mi Biblioteca</h1>
      <div class="library-filters">
        <input
          v-model="filters.title"
          type="text"
          placeholder="Buscar por título..."
          @input="handleSearch"
        />
        <input
          v-model="filters.author"
          type="text"
          placeholder="Buscar por autor..."
          @input="handleSearch"
        />
        <select v-model="filters.sortByRating" @change="handleSearch">
          <option value="">Ordenar por calificación</option>
          <option value="asc">Menor a mayor</option>
          <option value="desc">Mayor a menor</option>
        </select>
        <label>
          <input
            v-model="filters.excludeNoReview"
            type="checkbox"
            @change="handleSearch"
          />
          Excluir sin review
        </label>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
    </div>

    <div v-else-if="filteredBooks.length === 0" class="empty-state">
      <h2>No hay libros en tu biblioteca</h2>
      <p>Busca libros y agrégalos a tu colección personal</p>
      <button class="btn btn-primary" @click="navigateTo('/')" style="margin-top: 1rem;">
        Buscar Libros
      </button>
    </div>

    <div v-else class="library-grid">
      <LibraryBookCard
        v-for="book in filteredBooks"
        :key="book.id"
        :book="book"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </div>

    <EditBookModal
      v-if="editingBook"
      :book="editingBook"
      @close="editingBook = null"
      @save="handleSaveEdit"
    />

    <ConfirmModal
      v-if="deletingBook"
      :message="`¿Estás seguro de que deseas eliminar '${deletingBook.title}' de tu biblioteca?`"
      @confirm="confirmDelete"
      @cancel="deletingBook = null"
    />
  </div>
</template>

<script setup lang="ts">
import { useBooksStore } from '~/stores/books'

definePageMeta({
  middleware: 'auth'
})

const booksStore = useBooksStore()
const loading = computed(() => booksStore.isLoading)
const myLibrary = computed(() => booksStore.getMyLibrary)

const filters = ref({
  title: '',
  author: '',
  sortByRating: '',
  excludeNoReview: false
})

const editingBook = ref<any>(null)
const deletingBook = ref<any>(null)

const filteredBooks = computed(() => {
  let books = [...myLibrary.value]
  
  if (filters.value.title) {
    books = books.filter(book => 
      book.title.toLowerCase().includes(filters.value.title.toLowerCase())
    )
  }
  
  if (filters.value.author) {
    books = books.filter(book => 
      book.author.toLowerCase().includes(filters.value.author.toLowerCase())
    )
  }
  
  if (filters.value.excludeNoReview) {
    books = books.filter(book => book.review && book.review.trim() !== '')
  }
  
  if (filters.value.sortByRating) {
    books.sort((a, b) => {
      const ratingA = a.rating || 0
      const ratingB = b.rating || 0
      return filters.value.sortByRating === 'asc' 
        ? ratingA - ratingB 
        : ratingB - ratingA
    })
  }
  
  return books
})

const handleSearch = () => {
  booksStore.fetchMyLibrary(filters.value)
}

const handleEdit = (book: any) => {
  editingBook.value = book
}

const handleDelete = (book: any) => {
  deletingBook.value = book
}

const handleSaveEdit = async (bookId: string, updates: any) => {
  const success = await booksStore.updateBook(bookId, updates)
  if (success) {
    editingBook.value = null
  }
}

const confirmDelete = async () => {
  if (deletingBook.value && deletingBook.value.id) {
    const success = await booksStore.deleteBook(deletingBook.value.id)
    if (success) {
      deletingBook.value = null
    }
  }
}

onMounted(() => {
  booksStore.fetchMyLibrary()
})
</script>