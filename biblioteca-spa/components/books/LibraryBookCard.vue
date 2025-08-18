<template>
  <div class="library-book-card">
    <div class="library-book-header">
      <img
        v-if="book.coverBase64"
        :src="book.coverBase64"
        :alt="book.title"
      />
      <div v-else style="width: 80px; height: 120px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; border-radius: 0.25rem;">
        📚
      </div>
      <div class="library-book-info">
        <h3>{{ book.title }}</h3>
        <div class="book-meta">{{ book.author }}</div>
        <div class="book-meta">Año: {{ book.publishYear || 'N/A' }}</div>
        <div class="book-rating">
          <span v-for="n in 5" :key="n">
            {{ n <= (book.rating || 0) ? '★' : '☆' }}
          </span>
        </div>
      </div>
    </div>
    
    <div v-if="book.review" class="library-book-review">
      <p>{{ book.review }}</p>
    </div>
    
    <div class="library-book-actions">
      <button class="btn btn-secondary" @click="$emit('edit', book)">
        Editar
      </button>
      <button class="btn btn-danger" @click="$emit('delete', book)">
        Eliminar
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  book: {
    type: Object,
    required: true
  }
})

defineEmits(['edit', 'delete'])
</script>