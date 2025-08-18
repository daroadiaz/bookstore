<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <h2>Editar Libro</h2>
      
      <div class="review-section">
        <h3>Review</h3>
        <textarea
          v-model="localReview"
          placeholder="Escribe tu opinión sobre este libro..."
          maxlength="500"
        ></textarea>
        <div class="char-count">{{ localReview.length }} / 500 caracteres</div>
      </div>
      
      <div class="rating-component">
        <h3>Calificación</h3>
        <div class="stars">
          <span
            v-for="star in 5"
            :key="star"
            class="star"
            :class="star <= localRating ? 'filled' : 'empty'"
            @click="localRating = star"
          >
            ★
          </span>
        </div>
      </div>
      
      <div class="modal-actions">
        <button class="btn btn-secondary" @click="$emit('close')">
          Cancelar
        </button>
        <button class="btn btn-primary" @click="handleSave">
          Guardar Cambios
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Book {
  id?: string
  title: string
  author: string
  publishYear: number
  coverBase64?: string
  review?: string
  rating?: number
}

const props = defineProps<{
  book: Book
}>()

const emit = defineEmits<{
  close: []
  save: [bookId: string, updates: { review: string, rating: number }]
}>()

const localReview = ref(props.book.review || '')
const localRating = ref(props.book.rating || 0)

const handleSave = () => {
  if (props.book.id) {
    emit('save', props.book.id, {
      review: localReview.value,
      rating: localRating.value
    })
  }
}
</script>