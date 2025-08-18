<template>
  <div style="padding: 2rem;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
      <h2 style="font-size: 1.5rem; color: #333;">Resultados de búsqueda</h2>
      <button class="btn btn-secondary" @click="handleBack">
        Nueva búsqueda
      </button>
    </div>
    
    <div v-if="searchResults.length === 0" class="empty-state">
      <h2>No encontramos libros con el título ingresado</h2>
      <p>Intenta con otro término de búsqueda</p>
    </div>
    
    <div v-else class="results-grid">
      <div
        v-for="(book, index) in searchResults.slice(0, 10)"
        :key="index"
        class="book-card"
        @click="selectBook(book)"
      >
        <img
          v-if="book.coverUrl"
          :src="book.coverUrl"
          :alt="book.title"
          class="book-cover"
        />
        <div v-else class="book-cover" style="display: flex; align-items: center; justify-content: center; font-size: 3rem; color: #ccc;">
          📚
        </div>
        <div class="book-info">
          <h3 class="book-title">{{ book.title }}</h3>
          <p class="book-author">{{ book.author }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBooksStore } from '~/stores/books'

interface BookResult {
  title: string
  author: string
  publishYear: number
  coverUrl?: string | null
  key?: string
}

const booksStore = useBooksStore()
const searchResults = computed(() => booksStore.getSearchResults)

const handleBack = () => {
  booksStore.clearSearchResults()
}

const selectBook = async (book: BookResult) => {
  let coverBase64 = ''
  
  if (book.coverUrl) {
    try {
      const response = await fetch(book.coverUrl)
      const blob = await response.blob()
      const reader = new FileReader()
      
      coverBase64 = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(blob)
      })
    } catch (error) {
      console.error('Error al convertir imagen:', error)
    }
  }
  
  booksStore.setCurrentBook({
    title: book.title,
    author: book.author,
    publishYear: book.publishYear,
    coverBase64: coverBase64
  })
}
</script>