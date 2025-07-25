<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { Product } from '~/types'
import PageHeroBanner from '~/components/hero-banner/HeroBannerPage.vue'

// SEO metadata
useHead({
  title: 'Sezonun Çok Satanları | Mebel',
  meta: [
    { name: 'description', content: 'Bu sezonun en çok tercih edilen mobilya ürünlerini keşfedin. Kalite ve şıklığı bir arada sunan en popüler mobilyalar.' }
  ]
})

// Initialize store and state
const productsStore = useProductsStore()
const bestSellerProducts = ref<Product[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)
const retryCount = ref(0)
const maxRetries = 3

// Pagination
const currentPage = ref(1)
const itemsPerPage = 12
const totalPages = computed(() => {
  if (!productsStore.bestsellerProducts.length) return 1
  return Math.ceil(productsStore.bestsellerProducts.length / itemsPerPage)
})

// Fetch best seller products with retry mechanism
const fetchBestSellerProducts = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    // Use the dedicated method for fetching bestseller products
    const response = await productsStore.fetchBestsellerProducts(itemsPerPage)
    
    if (response) {
      // Use the bestsellerProducts from the store
      bestSellerProducts.value = productsStore.bestsellerProducts
      
      // If no products found but we have retries left, try again
      if (bestSellerProducts.value.length === 0 && retryCount.value < maxRetries) {
        retryCount.value++
        console.log(`No best seller products found, retrying (${retryCount.value}/${maxRetries})`)
        // Clear cache before retrying
        productsStore.clearCache()
        setTimeout(() => fetchBestSellerProducts(), 1000) // Wait 1 second before retrying
        return
      }
    }
  } catch (err) {
    error.value = 'En çok satan ürünler yüklenirken bir hata oluştu.'
    console.error('Error fetching best seller products:', err)
    
    // Retry on error if we have retries left
    if (retryCount.value < maxRetries) {
      retryCount.value++
      console.log(`Error fetching best seller products, retrying (${retryCount.value}/${maxRetries})`)
      // Clear cache before retrying
      productsStore.clearCache()
      setTimeout(() => fetchBestSellerProducts(), 1000) // Wait 1 second before retrying
      return
    }
  } finally {
    isLoading.value = false
  }
}

// Handle page change
const handlePageChange = (page: number) => {
  currentPage.value = page
  // Scroll to top when changing page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Watch for changes in bestseller products
watch(() => productsStore.bestsellerProducts, (newProducts) => {
  if (newProducts.length > 0) {
    bestSellerProducts.value = newProducts
  }
}, { deep: true })

// Fetch data on mount
onMounted(() => {
  fetchBestSellerProducts()
})
</script>

<template>
  <div>
    <!-- Banner -->
    <PageHeroBanner
      title="Sezonun Çok Satanları"
      highlighted-text="Çok Satanları"
      description="Bu sezonun en çok tercih edilen mobilya ürünlerini keşfedin. Kalite ve şıklığı bir arada sunan en popüler mobilyalar."
      color-scheme="amber"
    />
    
    <div class="container mx-auto px-4 pb-16">
      <!-- Loading State -->
      <div v-if="isLoading" class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div 
          v-for="i in itemsPerPage" 
          :key="i" 
          class="bg-gray-200 animate-pulse rounded-lg h-80"
        ></div>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="text-center text-red-500 py-8">
        {{ error }}
      </div>
      
      <!-- Empty State -->
      <div v-else-if="bestSellerProducts.length === 0" class="text-center text-gray-500 py-8">
        Henüz ürün bulunmamaktadır.
      </div>
      
      <!-- Products Grid -->
      <div v-else class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <ProductCard 
          v-for="product in bestSellerProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)" 
          :key="product.id" 
          :product="product"
        />
      </div>
      
      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center mt-8">
        <div class="flex space-x-2">
          <button 
            v-for="page in totalPages" 
            :key="page" 
            @click="handlePageChange(page)"
            :class="[
              'px-4 py-2 rounded-md',
              currentPage === page 
                ? 'bg-amber-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            ]"
          >
            {{ page }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bg-amber-50 {
  position: relative;
}

.bg-amber-50::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23fbbf24' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E");
  opacity: 0.5;
}
</style> 