<template>
  <div>
    <SearchSection v-if="!selectedBook && searchResults.length === 0" />
    <SearchResults v-else-if="searchResults.length > 0 && !selectedBook" />
    <BookDetail v-else-if="selectedBook" />
  </div>
</template>

<script setup lang="ts">
import { useBooksStore } from '~/stores/books'

definePageMeta({
  middleware: 'auth'
})

const booksStore = useBooksStore()
const searchResults = computed(() => booksStore.getSearchResults)
const selectedBook = computed(() => booksStore.getCurrentBook)

onMounted(() => {
  booksStore.fetchRecentSearches()
})
</script>