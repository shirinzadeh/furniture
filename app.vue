<script setup lang="ts">
import { useCartStore, useAuthStore } from '~/stores'
import useFavoritesStore from '~/stores/favorites'

// Initialize stores
const authStore = useAuthStore()
const cartStore = useCartStore()
const favoritesStore = useFavoritesStore()

// Initialize app when loaded on client side
onMounted(async () => {
  try {
    // First initialize auth
    await authStore.init()
    
    // Then initialize cart and favorites (they will check auth status internally)
    await Promise.all([
      cartStore.initCart(),
      favoritesStore.initFavorites()
    ])
  } catch (error) {
    console.error('Failed to initialize app:', error)
  }
})

// Meta tags
useHead({
  htmlAttrs: {
    lang: 'tr'
  },
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ]
})
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    
    <!-- Toast Container -->
    <UiToastContainer />
  </div>
</template>
