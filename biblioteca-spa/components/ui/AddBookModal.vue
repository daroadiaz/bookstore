<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <h2>Agregar a Mi Biblioteca</h2>
      
      <div class="book-preview">
        <img 
          v-if="bookData.coverUrl" 
          :src="bookData.coverUrl" 
          alt="Portada del libro"
          class="preview-cover"
          @load="convertImageToBase64"
        >
        <div class="preview-info">
          <h3>{{ bookData.title }}</h3>
          <p class="author">{{ bookData.author }}</p>
          <p class="year">{{ bookData.publishYear }}</p>
        </div>
      </div>

      <div class="form-section">
        <div class="review-section">
          <label for="review">Tu Reseña:</label>
          <textarea
            id="review"
            v-model="review"
            placeholder="Escribe tu reseña aquí (máximo 500 caracteres)"
            maxlength="500"
          ></textarea>
          <div class="char-count">{{ review.length }}/500 caracteres</div>
        </div>

        <div class="rating-section">
          <label>Tu Calificación:</label>
          <div class="stars">
            <span
              v-for="star in 5"
              :key="star"
              @click="rating = star"
              :class="['star', star <= rating ? 'filled' : 'empty']"
            >
              ★
            </span>
          </div>
        </div>
      </div>

      <div class="modal-actions">
        <button @click="$emit('close')" class="btn btn-secondary">
          Cancelar
        </button>
        <button 
          @click="saveBook" 
          class="btn btn-primary"
          :disabled="saving"
        >
          {{ saving ? 'Guardando...' : 'Guardar en Mi Biblioteca' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useBooksStore } from '~/stores/books'

const props = defineProps({
  bookData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'saved'])

const booksStore = useBooksStore()
const review = ref('')
const rating = ref(5)
const saving = ref(false)
const coverBase64 = ref('')

// Función para convertir imagen a base64
const convertImageToBase64 = async (event) => {
  const img = event.target
  
  try {
    // Crear canvas
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    // Establecer dimensiones del canvas
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    
    // Dibujar imagen en el canvas
    ctx.drawImage(img, 0, 0)
    
    // Convertir a base64
    coverBase64.value = canvas.toDataURL('image/jpeg', 0.8)
    console.log('Imagen convertida a base64')
  } catch (error) {
    console.error('Error al convertir imagen a base64:', error)
    // Si falla, intentar hacer fetch de la imagen
    if (props.bookData.coverUrl) {
      try {
        const response = await fetch(props.bookData.coverUrl)
        const blob = await response.blob()
        const reader = new FileReader()
        
        reader.onloadend = () => {
          coverBase64.value = reader.result
          console.log('Imagen convertida a base64 con FileReader')
        }
        
        reader.readAsDataURL(blob)
      } catch (fetchError) {
        console.error('Error al hacer fetch de la imagen:', fetchError)
      }
    }
  }
}

const saveBook = async () => {
  saving.value = true
  
  const bookToSave = {
    title: props.bookData.title,
    author: props.bookData.author,
    publishYear: props.bookData.publishYear,
    coverBase64: coverBase64.value,
    review: review.value,
    rating: rating.value,
    openLibraryKey: props.bookData.key
  }
  
  const success = await booksStore.addBookToLibrary(bookToSave)
  
  if (success) {
    emit('saved')
    emit('close')
  } else {
    alert('Error al guardar el libro. Es posible que ya esté en tu biblioteca.')
  }
  
  saving.value = false
}
</script>

<style scoped>
.book-preview {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.preview-cover {
  width: 100px;
  height: 150px;
  object-fit: cover;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preview-info {
  flex: 1;
}

.preview-info h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.preview-info .author {
  color: #666;
  margin-bottom: 0.25rem;
}

.preview-info .year {
  color: #999;
  font-size: 0.875rem;
}

.form-section {
  margin-bottom: 1.5rem;
}

.review-section {
  margin-bottom: 1.5rem;
}

.review-section label,
.rating-section label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

.review-section textarea {
  width: 100%;
  min-height: 120px;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  resize: vertical;
}

.review-section textarea:focus {
  outline: none;
  border-color: #667eea;
}

.char-count {
  text-align: right;
  color: #999;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.rating-section .stars {
  display: flex;
  gap: 0.5rem;
  font-size: 2rem;
}

.star {
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.star:hover {
  transform: scale(1.1);
}

.star.filled {
  color: #fbbf24;
}

.star.empty {
  color: #e5e7eb;
}

.star.empty:hover {
  color: #fde047;
}
</style>