<script setup lang="ts">
import { computed } from 'vue'
import type { Product } from '~/types'
import ProductCard from '~/components/product/ProductCard.vue'

// Props
const props = defineProps({
  products: {
    type: Array as () => Product[],
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null as unknown as string | undefined
  },
  title: {
    type: String,
    default: "SEZONUN ÇOK SATANLARI"
  },
  subtitle: {
    type: String,
    default: "Bu sezonun en çok tercih edilen ürünleri"
  },
  viewAllLink: {
    type: String,
    default: "/bestsellers"
  },
  viewAllText: {
    type: String,
    default: "Tümünü Gör"
  },
  backgroundColor: {
    type: String,
    default: "bg-amber-50"
  }
})

// Computed property to determine if we have products to display
const hasProducts = computed(() => {
  return props.products && props.products.length > 0
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
  <section class="py-12" :class="backgroundColor">
    <div class="container mx-auto px-4">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h2 class="text-2xl sm:text-3xl font-bold">{{ title }}</h2>
          <p class="text-gray-600 mt-2">{{ subtitle }}</p>
        </div>
        <NuxtLink :to="viewAllLink" class="text-blue-600 hover:text-blue-800 font-medium flex items-center">
          {{ viewAllText }}
          <Icon name="heroicons:arrow-right" class="w-5 h-5 ml-1" />
        </NuxtLink>
      </div>
      
      <!-- Loading state -->
      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="i in 4" :key="i" class="bg-gray-200 animate-pulse rounded-lg h-80"></div>
      </div>
      
      <!-- Error state -->
      <div v-else-if="error" class="text-center text-red-500 py-8">
        {{ error }}
        <button @click="$emit('retry')" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Tekrar Dene
        </button>
      </div>
      
      <!-- Empty state -->
      <div v-else-if="!hasProducts" class="text-center text-gray-500 py-8">
        Şu an çok satan ürün bulunmamaktadır.
      </div>
      
      <!-- Products list -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ProductCard 
          v-for="product in products" 
          :key="product.id" 
          :product="product"
          @add-to-favorites="handleAddToFavorites"
          @add-to-cart="handleAddToCart"
        />
      </div>
    </div>
  </section>
</template> 