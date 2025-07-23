<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import type { Product } from '~/types'
import PageHeroBanner from '~/components/hero-banner/HeroBannerPage.vue'

// SEO metadata
useHead({
  title: 'Kışın En Flaş İndirimleri | Mebel',
  meta: [
    { name: 'description', content: 'Kış sezonuna özel indirimli mobilya ve ev dekorasyon ürünleri. Sınırlı süre için geçerli flaş indirimlerle evinizi yenileyin.' }
  ]
})

// Pinia store for products
const productsStore = useProductsStore()

// State for winter flash sale products
const winterFlashSaleProducts = ref<Product[]>([])
const isLoading = ref(true)
const isLoadingMore = ref(false)
const error = ref<string | null>(null)
const retryCount = ref(0)
const maxRetries = 3
const hasMoreProducts = ref(true)

// Pagination for infinite scroll
const currentPage = ref(1)
const itemsPerPage = 12
const totalProducts = ref(0)

// Observer for infinite scroll
let observer: IntersectionObserver | null = null
const observerTarget = ref<HTMLElement | null>(null)

// Fetch winter flash sale products with retry mechanism
const fetchWinterFlashSaleProducts = async (isLoadMore = false) => {
  if (isLoadMore) {
    isLoadingMore.value = true
  } else {
    isLoading.value = true
    currentPage.value = 1
    winterFlashSaleProducts.value = []
    retryCount.value = 0
  }
  
  error.value = null
  
  try {
    // Use useApi for consistent API calls
    const api = useApi()
    const queryParams = new URLSearchParams({
      onSale: 'true',
      page: currentPage.value.toString(),
      limit: itemsPerPage.toString()
    });
    
    const response = await api.fetchRaw(`/api/products?${queryParams.toString()}`)
    
    if (response) {
      const newProducts = response.products || []
      
      if (isLoadMore) {
        // Force reactivity update by creating new array reference
        winterFlashSaleProducts.value = [...winterFlashSaleProducts.value, ...newProducts]
      } else {
        winterFlashSaleProducts.value = [...newProducts]
      }
      
      totalProducts.value = response.pagination?.totalItems || 0
      hasMoreProducts.value = winterFlashSaleProducts.value.length < totalProducts.value
      
      console.log(`Loaded ${newProducts.length} winter flash sale products, total: ${winterFlashSaleProducts.value.length}/${totalProducts.value}`)
      
      // If no products found but we have retries left, try again
      if (winterFlashSaleProducts.value.length === 0 && retryCount.value < maxRetries && !isLoadMore) {
        retryCount.value++
        console.log(`No winter flash sale products found, retrying (${retryCount.value}/${maxRetries})`)
        productsStore.clearCache()
        setTimeout(() => fetchWinterFlashSaleProducts(), 1000)
        return
      }
    }
  } catch (err) {
    error.value = 'Flaş indirim ürünleri yüklenirken bir hata oluştu.'
    console.error('Error fetching winter flash sale products:', err)
    
    // Retry on error if we have retries left
    if (retryCount.value < maxRetries && !isLoadMore) {
      retryCount.value++
      console.log(`Error fetching winter flash sale products, retrying (${retryCount.value}/${maxRetries})`)
      productsStore.clearCache()
      setTimeout(() => fetchWinterFlashSaleProducts(), 1000)
      return
    }
  } finally {
    isLoading.value = false
    isLoadingMore.value = false
  }
}

// Load more products
const loadMoreProducts = () => {
  if (!isLoadingMore.value && hasMoreProducts.value) {
    currentPage.value++
    fetchWinterFlashSaleProducts(true)
  }
}

// Setup infinite scroll
const setupInfiniteScroll = () => {
  if (typeof window === 'undefined' || !window.IntersectionObserver) return
  
  if (observer) {
    observer.disconnect()
  }
  
  nextTick(() => {
    if (!observerTarget.value) return
    
    observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMoreProducts.value && !isLoadingMore.value && !isLoading.value) {
        loadMoreProducts()
      }
    }, {
      rootMargin: '200px',
      threshold: 0.1
    })
    
    observer.observe(observerTarget.value)
  })
}

// Fetch data on component mount
onMounted(async () => {
  await fetchWinterFlashSaleProducts()
  setupInfiniteScroll()
})

// Cleanup observer
onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>

<template>
  <div class="winter-flash-sales-page">
    <!-- Winter Flash Sales Banner -->
    <PageHeroBanner
      title="Kışın En Flaş İndirimleri"
      highlighted-text="Flaş İndirimleri"
      description="Sınırlı süre için geçerli kış sezonu fırsatlarını kaçırmayın! Kış sezonuna özel indirimli mobilyalar sizleri bekliyor."
      color-scheme="blue"
    />

    <!-- Products Section -->
    <div class="container mx-auto px-4 pb-16">
      <div v-if="isLoading" class="flex justify-center items-center py-16">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>

      <div v-else-if="error" class="text-center py-16">
        <p class="text-red-500 mb-4">{{ error }}</p>
        <button 
          @click="() => fetchWinterFlashSaleProducts()" 
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Tekrar Dene
        </button>
      </div>

      <div v-else-if="winterFlashSaleProducts.length === 0" class="text-center py-16">
        <p class="text-gray-500 mb-4">Henüz ürün bulunmamaktadır.</p>
      </div>

      <div v-else>
        <!-- Products Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <ProductCard 
            v-for="product in winterFlashSaleProducts" 
            :key="product.id" 
            :product="product" 
            class="winter-product-card"
          />
        </div>

        <!-- Loading more indicator -->
        <div v-if="isLoadingMore" class="flex justify-center py-8">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 border-t-2 border-r-2 border-blue-500 rounded-full animate-spin"></div>
            <span class="text-gray-600 font-medium">Daha fazla ürün yükleniyor...</span>
          </div>
        </div>
        
        <!-- End of results message -->
        <div v-if="!hasMoreProducts && winterFlashSaleProducts.length > 0 && !isLoadingMore" 
          class="text-center text-gray-500 py-8 font-medium">
          Tüm flaş indirim ürünleri gösteriliyor ({{ totalProducts }} ürün)
        </div>
        
        <!-- Intersection observer element for infinite scroll -->
        <div ref="observerTarget" class="h-4 w-full"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.winter-flash-sales-page {
  background-color: #f9fafb;
}

.winter-product-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.winter-product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.winter-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at top right, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
      pointer-events: none;
  }
</style> 