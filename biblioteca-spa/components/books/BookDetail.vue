<template>
  <div style="padding: 2rem;">
    <button class="btn btn-secondary" @click="handleBack" style="margin-bottom: 1rem;">
      ← Volver a resultados
    </button>
    
    <div class="book-detail">
      <div class="detail-header">
        <img
          v-if="currentBook.coverBase64"
          :src="currentBook.coverBase64"
          :alt="currentBook.title"
          class="detail-cover"
        />
        <div v-else class="detail-cover" style="display: flex; align-items: center; justify-content: center; font-size: 4rem; background: #f3f4f6;">
          📚
        </div>
        
        <div class="detail-info">
          <h2>{{ currentBook.title }}</h2>
          <div class="detail-meta">
            <span><strong>Autor:</strong> {{ currentBook.author }}</span>
            <span><strong>Año de publicación:</strong> {{ currentBook.publishYear || 'No disponible' }}</span>
          </div>
        </div>
      </div>
      
      <div class="review-section">
        <h3>Mi Review</h3>
        <textarea
          v-model="review"
          placeholder="Escribe tu opinión sobre este libro..."
          maxlength="500"
        ></textarea>
        <div class="char-count">{{ review.length }} / 500 caracteres</div>
      </div>
      
      <div class="rating-component">
        <h3>Mi Calificación</h3>
        <div class="stars">
          <span
            v-for="star in 5"
            :key="star"
            class="star"
            :class="star <= rating ? 'filled' : 'empty'"
            @click="rating = star"
          >
            ★
          </span>
        </div>
      </div>
      
      <div style="margin-top: 2rem; display: flex; gap: 1rem;">
        <button 
          class="btn btn-primary" 
          @click="saveBook"
          :disabled="saving"
        >
          {{ saving ? 'Guardando...' : 'Guardar en Mi Biblioteca' }}
        </button>
      </div>
    </div>
    
    <SuccessMessage v-if="showSuccess" message="¡Libro guardado exitosamente!" />
  </div>
</template>

<script setup lang="ts">
import { useBooksStore } from '~/stores/books'

const booksStore = useBooksStore()
const currentBook = computed(() => booksStore.getCurrentBook)
const review = ref('')
const rating = ref(0)
const saving = ref(false)
const showSuccess = ref(false)

const handleBack = () => {
  booksStore.setCurrentBook(null)
}

const saveBook = async () => {
  if (rating.value === 0) {
    alert('Por favor, selecciona una calificación')
    return
  }
  
  saving.value = true
  
  const bookData = {
    ...currentBook.value,
    review: review.value,
    rating: rating.value
  }
  
  const success = await booksStore.addBookToLibrary(bookData)
  
  if (success) {
    showSuccess.value = true
    setTimeout(() => {
      showSuccess.value = false
      booksStore.setCurrentBook(null)
      booksStore.clearSearchResults()
    }, 2000)
  }
  
  saving.value = false
}
</script>