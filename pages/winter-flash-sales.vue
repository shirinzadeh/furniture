<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
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
const error = ref<string | null>(null)
const retryCount = ref(0)
const maxRetries = 3

// Pagination
const currentPage = ref(1)
const itemsPerPage = 12
const totalPages = ref(1)

// Fetch winter flash sale products with retry mechanism
const fetchWinterFlashSaleProducts = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    // Use the dedicated method for fetching sale products with pagination
    const response = await productsStore.fetchSaleProducts(
      itemsPerPage,
      (currentPage.value - 1) * itemsPerPage
    )
    
    if (response) {
      // Use the saleProducts from the store
      winterFlashSaleProducts.value = productsStore.saleProducts
      
      // Calculate total pages
      if (productsStore.totalSaleProducts) {
        totalPages.value = Math.ceil(productsStore.totalSaleProducts / itemsPerPage)
      }
      
      // If no products found but we have retries left, try again
      if (winterFlashSaleProducts.value.length === 0 && retryCount.value < maxRetries) {
        retryCount.value++
        console.log(`No winter flash sale products found, retrying (${retryCount.value}/${maxRetries})`)
        // Clear cache before retrying
        productsStore.clearCache(`sale-products-${itemsPerPage}-${(currentPage.value - 1) * itemsPerPage}`)
        setTimeout(() => fetchWinterFlashSaleProducts(), 1000) // Wait 1 second before retrying
        return
      }
    }
  } catch (err) {
    error.value = 'Flaş indirim ürünleri yüklenirken bir hata oluştu.'
    console.error('Error fetching winter flash sale products:', err)
    
    // Retry on error if we have retries left
    if (retryCount.value < maxRetries) {
      retryCount.value++
      console.log(`Error fetching winter flash sale products, retrying (${retryCount.value}/${maxRetries})`)
      // Clear cache before retrying
      productsStore.clearCache(`sale-products-${itemsPerPage}-${(currentPage.value - 1) * itemsPerPage}`)
      setTimeout(() => fetchWinterFlashSaleProducts(), 1000) // Wait 1 second before retrying
      return
    }
  } finally {
    isLoading.value = false
  }
}

// Handle page change
const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchWinterFlashSaleProducts()
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Watch for changes in the store's sale products
watch(() => productsStore.saleProducts, (newProducts) => {
  if (newProducts.length > 0) {
    winterFlashSaleProducts.value = newProducts
  }
}, { deep: true })

// Fetch data on component mount
onMounted(fetchWinterFlashSaleProducts)
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
          @click="fetchWinterFlashSaleProducts" 
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

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="mt-12 flex justify-center">
          <div class="flex space-x-2">
            <button 
              v-for="page in totalPages" 
              :key="page" 
              @click="handlePageChange(page)" 
              :class="[
                'px-4 py-2 rounded transition',
                currentPage === page 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              ]"
            >
              {{ page }}
            </button>
          </div>
        </div>
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