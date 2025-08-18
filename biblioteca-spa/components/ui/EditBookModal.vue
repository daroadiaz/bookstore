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
const props = defineProps({
  book: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'save'])

const localReview = ref(props.book.review || '')
const localRating = ref(props.book.rating || 0)

const handleSave = () => {
  emit('save', props.book.id, {
    review: localReview.value,
    rating: localRating.value
  })
}
</script>