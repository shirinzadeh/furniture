<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Product } from '~/types'

interface Props {
  title?: string
  subtitle?: string
  products: Product[]
  loading?: boolean
  error?: string | null
  limit?: number
  viewAllLink?: string
  viewAllText?: string
  backgroundColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'KIŞIN EN FLAŞ FİYATLARI',
  subtitle: '',
  loading: false,
  error: null,
  limit: 4,
  viewAllLink: '/flash-sales',
  viewAllText: 'Fırsatları Yakala',
  backgroundColor: 'bg-gray-50'
})

// Limit the number of products to display
const displayedProducts = computed(() => {
  return props.products.slice(0, props.limit)
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
  <section :class="[backgroundColor, 'py-12']">
    <div class="container mx-auto px-4">
      <!-- Section Header -->
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold mb-2">{{ title }}</h2>
        <p v-if="subtitle" class="text-gray-600">{{ subtitle }}</p>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          v-for="i in limit" 
          :key="i" 
          class="bg-gray-200 animate-pulse rounded-lg h-80"
        ></div>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="text-center text-red-500 py-8">
        {{ error }}
      </div>
      
      <!-- Empty State -->
      <div v-else-if="products.length === 0" class="text-center text-gray-500 py-8">
        Henüz ürün bulunmamaktadır.
      </div>
      
      <!-- Products Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ProductCard 
          v-for="product in displayedProducts" 
          :key="product.id" 
          :product="product"
          @add-to-favorites="handleAddToFavorites"
          @add-to-cart="handleAddToCart"
        />
      </div>
      
      <!-- View All Link -->
      <div v-if="viewAllLink" class="text-center mt-8">
        <NuxtLink 
          :to="viewAllLink" 
          class="relative z-10 inline-flex items-center bg-gray-800 text-white px-6 py-3 rounded-md font-medium hover:bg-gray-700 transition-colors"
        >
          <span>{{ viewAllText }}</span>
          <Icon name="mdi:arrow-right" class="ml-2" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template> 