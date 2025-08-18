<template>
  <div class="modal-overlay" @click.self="$emit('cancel')">
    <div class="modal-content">
      <h2>Confirmar acción</h2>
      <p>{{ message }}</p>
      <div class="modal-actions">
        <button class="btn btn-secondary" @click="$emit('cancel')">
          Cancelar
        </button>
        <button class="btn btn-danger" @click="$emit('confirm')">
          Eliminar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  message: {
    type: String,
    required: true
  }
})

defineEmits(['confirm', 'cancel'])
</script>