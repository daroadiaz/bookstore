import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

interface Book {
  id?: string
  title: string
  author: string
  publishYear: number
  coverBase64?: string
  review?: string
  rating?: number
}

interface SearchResult {
  title: string
  author: string
  publishYear: number
  coverUrl?: string | null
  key?: string
}

interface ApiResponse {
  success?: boolean
  results?: any[]
  searches?: string[]
  books?: Book[]
  book?: Book
  message?: string
}

export const useBooksStore = defineStore('books', {
  state: () => ({
    searchResults: [] as SearchResult[],
    myLibrary: [] as Book[],
    recentSearches: [] as string[],
    currentBook: null as Book | null,
    loading: false,
    error: null as string | null
  }),

  getters: {
    getSearchResults: (state) => state.searchResults,
    getMyLibrary: (state) => state.myLibrary,
    getRecentSearches: (state) => state.recentSearches.slice(0, 5),
    getCurrentBook: (state) => state.currentBook,
    isLoading: (state) => state.loading,
    getError: (state) => state.error
  },

  actions: {
    async searchBooks(query: string) {
      this.loading = true
      this.error = null
      const authStore = useAuthStore()
      const config = useRuntimeConfig()
      
      try {
        console.log(`Buscando libros con query: ${query}`)
        
        const response = await $fetch<ApiResponse>(`${config.public.apiBaseUrl}/api/books/search`, {
          params: { q: query },
          headers: authStore.getAuthHeader
        })
        
        if (response.success && response.results) {
          this.searchResults = response.results.map((book: any) => ({
            title: book.title || '',
            author: book.author_name ? book.author_name[0] : 'Autor desconocido',
            publishYear: book.first_publish_year || 0,
            coverUrl: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : undefined,
            key: book.key || undefined
          }))
          
          console.log(`Se encontraron ${this.searchResults.length} resultados`)
          
          this.addRecentSearch(query)
          await this.fetchRecentSearches()
        } else {
          this.searchResults = []
        }
      } catch (error) {
        console.error('Error al buscar libros:', error)
        this.error = 'Error al buscar libros'
        this.searchResults = []
      } finally {
        this.loading = false
      }
    },

    async fetchRecentSearches() {
      const authStore = useAuthStore()
      const config = useRuntimeConfig()
      
      try {
        console.log('Obteniendo búsquedas recientes')
        
        const response = await $fetch<ApiResponse>(`${config.public.apiBaseUrl}/api/books/last-search`, {
          headers: authStore.getAuthHeader
        })
        
        if (response.searches) {
          this.recentSearches = response.searches
          console.log(`Se obtuvieron ${this.recentSearches.length} búsquedas recientes`)
        }
      } catch (error) {
        console.error('Error al obtener búsquedas recientes:', error)
      }
    },

    addRecentSearch(query: string) {
      if (!this.recentSearches.includes(query)) {
        this.recentSearches.unshift(query)
        if (this.recentSearches.length > 5) {
          this.recentSearches = this.recentSearches.slice(0, 5)
        }
      }
    },

    async fetchMyLibrary(filters?: any) {
      this.loading = true
      const authStore = useAuthStore()
      const config = useRuntimeConfig()
      
      try {
        console.log('Obteniendo biblioteca personal', filters)
        
        const params: any = {}
        if (filters?.title) params.title = filters.title
        if (filters?.author) params.author = filters.author
        if (filters?.sortByRating) params.sortByRating = filters.sortByRating
        if (filters?.excludeNoReview) params.excludeNoReview = filters.excludeNoReview
        
        const response = await $fetch<ApiResponse>(`${config.public.apiBaseUrl}/api/books/my-library`, {
          params,
          headers: authStore.getAuthHeader
        })
        
        if (response.books) {
          this.myLibrary = response.books
          console.log(`Se obtuvieron ${this.myLibrary.length} libros de la biblioteca`)
        }
      } catch (error) {
        console.error('Error al obtener biblioteca:', error)
        this.error = 'Error al obtener la biblioteca'
      } finally {
        this.loading = false
      }
    },

    async addBookToLibrary(book: Book) {
      this.loading = true
      this.error = null
      const authStore = useAuthStore()
      const config = useRuntimeConfig()
      
      try {
        console.log('Agregando libro a la biblioteca:', book.title)
        
        const response = await $fetch<ApiResponse>(`${config.public.apiBaseUrl}/api/books/my-library`, {
          method: 'POST',
          body: book,
          headers: {
            ...authStore.getAuthHeader,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.success) {
          await this.fetchMyLibrary()
          console.log('Libro agregado exitosamente')
          return true
        }
        return false
      } catch (error) {
        console.error('Error al agregar libro:', error)
        this.error = 'Error al agregar el libro'
        return false
      } finally {
        this.loading = false
      }
    },

    async updateBook(bookId: string, updates: { review?: string, rating?: number }) {
      this.loading = true
      const authStore = useAuthStore()
      const config = useRuntimeConfig()
      
      try {
        console.log(`Actualizando libro ${bookId}`)
        
        const response = await $fetch<ApiResponse>(`${config.public.apiBaseUrl}/api/books/my-library/${bookId}`, {
          method: 'PUT',
          body: updates,
          headers: {
            ...authStore.getAuthHeader,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.success) {
          await this.fetchMyLibrary()
          console.log('Libro actualizado exitosamente')
          return true
        }
        return false
      } catch (error) {
        console.error('Error al actualizar libro:', error)
        this.error = 'Error al actualizar el libro'
        return false
      } finally {
        this.loading = false
      }
    },

    async deleteBook(bookId: string) {
      this.loading = true
      const authStore = useAuthStore()
      const config = useRuntimeConfig()
      
      try {
        console.log(`Eliminando libro ${bookId}`)
        
        const response = await $fetch<ApiResponse>(`${config.public.apiBaseUrl}/api/books/my-library/${bookId}`, {
          method: 'DELETE',
          headers: authStore.getAuthHeader
        })
        
        if (response.success) {
          await this.fetchMyLibrary()
          console.log('Libro eliminado exitosamente')
          return true
        }
        return false
      } catch (error) {
        console.error('Error al eliminar libro:', error)
        this.error = 'Error al eliminar el libro'
        return false
      } finally {
        this.loading = false
      }
    },

    async fetchBookById(bookId: string) {
      const authStore = useAuthStore()
      const config = useRuntimeConfig()
      
      try {
        console.log(`Obteniendo libro con ID: ${bookId}`)
        
        const response = await $fetch<ApiResponse>(`${config.public.apiBaseUrl}/api/books/my-library/${bookId}`, {
          headers: authStore.getAuthHeader
        })
        
        if (response.book) {
          this.currentBook = response.book
          console.log('Libro obtenido:', response.book.title)
          return response.book
        }
        return null
      } catch (error) {
        console.error('Error al obtener libro:', error)
        return null
      }
    },

    clearSearchResults() {
      this.searchResults = []
    },

    setCurrentBook(book: Book | null) {
      this.currentBook = book
    }
  }
})