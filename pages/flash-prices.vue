<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import type { Product } from '~/types'
import PageHeroBanner from '~/components/hero-banner/HeroBannerPage.vue'

// SEO metadata
useHead({
  title: 'Flaş Fiyatlar | Mebel',
  meta: [
    { name: 'description', content: 'Mebel\'de flaş fiyatlarla sunulan mobilya ve ev dekorasyon ürünleri. Sınırlı süre için geçerli fırsatları kaçırmayın!' }
  ]
})

// Pinia store for products
const productsStore = useProductsStore()

// State for flash sale products
const flashSaleProducts = ref<Product[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)
const retryCount = ref(0)
const maxRetries = 3

// Pagination
const currentPage = ref(1)
const itemsPerPage = 12
const totalPages = ref(1)

// Fetch flash sale products with retry mechanism
const fetchFlashSaleProducts = async () => {
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
      flashSaleProducts.value = productsStore.saleProducts
      
      // Calculate total pages
      if (productsStore.totalSaleProducts) {
        totalPages.value = Math.ceil(productsStore.totalSaleProducts / itemsPerPage)
      }
      
      // If no products found but we have retries left, try again
      if (flashSaleProducts.value.length === 0 && retryCount.value < maxRetries) {
        retryCount.value++
        console.log(`No flash sale products found, retrying (${retryCount.value}/${maxRetries})`)
        // Clear cache before retrying
        productsStore.clearCache(`sale-products-${itemsPerPage}-${(currentPage.value - 1) * itemsPerPage}`)
        setTimeout(() => fetchFlashSaleProducts(), 1000) // Wait 1 second before retrying
        return
      }
    }
  } catch (err) {
    error.value = 'Flaş fiyatlı ürünler yüklenirken bir hata oluştu.'
    console.error('Error fetching flash sale products:', err)
    
    // Retry on error if we have retries left
    if (retryCount.value < maxRetries) {
      retryCount.value++
      console.log(`Error fetching flash sale products, retrying (${retryCount.value}/${maxRetries})`)
      // Clear cache before retrying
      productsStore.clearCache(`sale-products-${itemsPerPage}-${(currentPage.value - 1) * itemsPerPage}`)
      setTimeout(() => fetchFlashSaleProducts(), 1000) // Wait 1 second before retrying
      return
    }
  } finally {
    isLoading.value = false
  }
}

// Handle page change
const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchFlashSaleProducts()
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Watch for changes in the store's sale products
watch(() => productsStore.saleProducts, (newProducts) => {
  if (newProducts.length > 0) {
    flashSaleProducts.value = newProducts
  }
}, { deep: true })

// Format price with Turkish locale
const formatPrice = (price: number) => {
  return price.toLocaleString('tr-TR')
}

// Calculate discount percentage
const calculateDiscount = (originalPrice: number, salePrice: number) => {
  return Math.round((1 - salePrice / originalPrice) * 100)
}

// Fetch data on component mount
onMounted(fetchFlashSaleProducts)
</script>

<template>
  <div class="flash-prices-page">
    <!-- Flash Prices Banner -->
    <PageHeroBanner
      title="Flaş Fiyatlar"
      highlighted-text="Flaş"
      description="Sınırlı süre için geçerli flaş fiyat fırsatlarını kaçırmayın! En kaliteli mobilyalar, en uygun fiyatlarla sizleri bekliyor."
      color-scheme="rose"
    />

    <!-- Products Section -->
    <div class="container mx-auto px-4 pb-16">
      <div v-if="isLoading" class="flex justify-center items-center py-16">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>

      <div v-else-if="error" class="text-center py-16">
        <p class="text-red-500 mb-4">{{ error }}</p>
        <button 
          @click="fetchFlashSaleProducts" 
          class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Tekrar Dene
        </button>
      </div>

      <div v-else-if="flashSaleProducts.length === 0" class="text-center py-16">
        <p class="text-gray-500 mb-4">Henüz flaş fiyatlı ürün bulunmamaktadır.</p>
      </div>

      <div v-else>
        <!-- Products Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <NuxtLink 
            v-for="product in flashSaleProducts" 
            :key="product.id" 
            :to="`/product/${product.slug}`"
            class="flash-product-card bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative"
          >
            <!-- Flash Sale Badge -->
            <div class="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10 flex items-center">
              <Icon name="mdi:flash" class="mr-1" />
              Flaş Fiyat
            </div>
            
            <!-- Discount Badge -->
            <div v-if="product.salePrice && product.salePrice < product.price" 
              class="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
              %{{ calculateDiscount(product.price, product.salePrice) }}
            </div>
            
            <!-- Product Image -->
            <div class="relative h-48 overflow-hidden">
              <NuxtImg
                :src="product.images[0] || '/images/placeholder.jpg'"
                :alt="product.name"
                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                format="webp"
                quality="80"
              />
            </div>
            
            <!-- Product Info -->
            <div class="p-4">
              <h3 class="text-lg font-semibold mb-2 line-clamp-2">{{ product.name }}</h3>
              <p class="text-gray-600 text-sm mb-2 line-clamp-2">{{ product.description }}</p>
              
              <!-- Price -->
              <div class="mt-4 flex items-center">
                <span class="text-red-500 font-bold text-xl">{{ formatPrice(product.salePrice || 0) }} TL</span>
                <span class="text-gray-400 line-through ml-2 text-sm">{{ formatPrice(product.price) }} TL</span>
              </div>
            </div>
          </NuxtLink>
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
                  ? 'bg-red-500 text-white' 
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
.flash-prices-page {
  background-color: #f9fafb;
}

.flash-product-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.flash-product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.flash-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at top right, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

@keyframes pulse-red {
  0%, 100% {
    background-color: rgba(239, 68, 68, 0.7);
  }
  50% {
    background-color: rgba(239, 68, 68, 0.9);
  }
}

.flash-product-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background-color: rgba(239, 68, 68, 0.7);
  animation: pulse-red 2s infinite;
}
</style> 