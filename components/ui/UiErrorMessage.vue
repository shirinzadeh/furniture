<script setup lang="ts">
import Button from '~/components/ui/UiButton.vue'

defineProps({
  message: {
    type: String,
    default: 'Ürünler yüklenirken bir hata oluştu.'
  },
  buttonText: {
    type: String,
    default: 'Tekrar Dene'
  }
})

defineEmits(['retry'])
</script>

<template>
  <div class="text-center py-12">
    <div class="bg-red-50 p-8 rounded-xl inline-block max-w-lg mx-auto">
      <Icon name="ph:warning-circle" class="text-red-500 w-16 h-16 mx-auto mb-4" />
      <p class="text-red-600 mb-6 text-lg">{{ message }}</p>
      
      <!-- Use slot if provided, otherwise use default button -->
      <slot name="retry">
        <Button 
          @click="$emit('retry')" 
          variant="primary"
          icon="ph:arrow-clockwise"
          icon-position="left"
        >
          {{ buttonText }}
        </Button>
      </slot>
    </div>
  </div>
</template> 