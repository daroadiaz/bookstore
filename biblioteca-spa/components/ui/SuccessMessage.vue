<template>
  <div class="success-message">
    {{ message }}
  </div>
</template>

<script setup lang="ts">
defineProps({
  message: {
    type: String,
    required: true
  }
})
</script>