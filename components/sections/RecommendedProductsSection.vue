<script setup lang="ts">
import { computed } from 'vue'
import type { Product } from '~/types'
import ProductCard from '~/components/product/ProductCard.vue'

// Props
const props = defineProps({
  externalProducts: {
    type: Array as () => Product[],
    default: () => []
  },
  externalLoading: {
    type: Boolean,
    default: false
  },
  externalError: {
    type: String,
    default: null as unknown as string | undefined
  }
})

// Computed property to determine if we have products to display
const hasProducts = computed(() => {
  return props.externalProducts && props.externalProducts.length > 0
})

// Handle add to favorites
const handleAddToFavorites = (productId: string) => {
  // This would typically use a store action
  console.log('Add to favorites:', productId)
}

// Handle add to cart
const handleAddToCart = (productId: string) => {
  // This would typically use a store action
  console.log('Add to cart:', productId)
}
</script>

<template>
  <section class="py-12 bg-white">
    <div class="container mx-auto px-4">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h2 class="text-2xl sm:text-3xl font-bold">Sizin İçin Seçtiklerimiz</h2>
          <p class="text-gray-600 mt-2">Beğenilerinize göre önerilen ürünler</p>
        </div>
        <NuxtLink to="/recommended" class="text-blue-600 hover:text-blue-800 font-medium flex items-center">
          Tümünü Gör
          <Icon name="heroicons:arrow-right" class="w-5 h-5 ml-1" />
        </NuxtLink>
      </div>
      
      <!-- Loading state -->
      <div v-if="externalLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="i in 4" :key="i" class="bg-gray-200 animate-pulse rounded-lg h-80"></div>
      </div>
      
      <!-- Error state -->
      <div v-else-if="externalError" class="text-center text-red-500 py-8">
        {{ externalError }}
        <button @click="$emit('retry')" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Tekrar Dene
        </button>
      </div>
      
      <!-- Empty state -->
      <div v-else-if="!hasProducts" class="text-center text-gray-500 py-8">
        Şu an önerilen ürün bulunmamaktadır.
      </div>
      
      <!-- Products list -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ProductCard 
          v-for="product in externalProducts" 
          :key="product.id" 
          :product="product"
          @add-to-favorites="handleAddToFavorites"
          @add-to-cart="handleAddToCart"
        />
      </div>
    </div>
  </section>
</template> 