<script setup lang="ts">
import { ref, computed, watch, watchEffect, onMounted, onUnmounted, nextTick } from 'vue'
import { useProductsStore } from '~/stores'
import { useProductSort } from '~/composables/useProductSort'
import type { Product } from '~/types'
import ProductCard from '~/components/product/ProductCard.vue'
import ErrorMessage from '~/components/ui/UiErrorMessage.vue'
import Button from '~/components/ui/UiButton.vue'
import PageHeroBanner from '~/components/hero-banner/HeroBannerPage.vue'

// SEO metadata
useHead({
  title: 'Tüm Ürünler | Mebel',
  meta: [
    { name: 'description', content: 'Mebel\'de tüm mobilya ve ev dekorasyon ürünlerini keşfedin. Kaliteli ve şık mobilyalar uygun fiyatlarla.' }
  ]
})

// Use products store instead of direct API calls for better caching and state management
const productsStore = useProductsStore()

// Initialize API composable
const api = useApi()
const apiState = useApiState()

// State for products
const products = ref<Product[]>([])
const isLoading = computed(() => apiState.isLoading.value)
const isLoadingMore = ref(false)
const showLoadingIndicator = ref(false)
const error = ref<string | null>(null)
const observerRef = ref<HTMLElement | null>(null)

// Pagination
const currentPage = ref(1)
const itemsPerPage = 12
const totalPages = ref(1)
const totalProducts = ref(0)
const hasMoreProducts = ref(true)

// Sort options - using centralized composable
const { selectedSort, sortOptions } = useProductSort()

// Observer for infinite scroll
let observer: IntersectionObserver | null = null

// Computed value to create the params for the products fetch
const productParams = computed(() => {
  return {
    limit: itemsPerPage,
    page: currentPage.value,
    sort: selectedSort.value,
    skip: 0
  }
})

// Use a route watcher to reset state on route change
const route = useRoute()
watch(() => route.fullPath, () => {
  // Reset pagination when route changes
  currentPage.value = 1
  products.value = []
})

// Server-side fetch - simplified with better error handling
try {
  const { data: initialData } = await useAsyncData(
    'products-initial',
    async () => {
      try {
        // Make sure we use the correct absolute URL with protocol
        const config = useRuntimeConfig()
        const baseUrl = process.server 
          ? config.public.apiBaseUrl || 'http://localhost:3000'
          : ''
          
        // Use simpler fetch with explicit error handling
        const response = await fetch(`${baseUrl}/api/products`)
        
        // Check for non-OK responses
        if (!response.ok) {
          console.error(`API error: ${response.status} ${response.statusText}`)
          return { products: [], count: 0 }
        }
        
        // Check if content type is JSON
        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          console.error(`Expected JSON but got ${contentType}`)
          return { products: [], count: 0 }
        }
        
        // Parse JSON safely
        const data = await response.json()
        return data
      } catch (error) {
        console.error('Server-side fetch error:', error)
        return { products: [], count: 0 }
      }
    },
    { 
      server: true,
    }
  )

  // Initialize with server data if available
  if (initialData.value) {
    products.value = initialData.value.products || []
    totalProducts.value = initialData.value.count || 0
    totalPages.value = Math.ceil(totalProducts.value / itemsPerPage)
    hasMoreProducts.value = products.value.length >= itemsPerPage
  }
} catch (error) {
  console.error('Error in server-side data fetching:', error)
}

// Improved fetch products function with better error handling
const fetchProducts = async (isLoadMore = false) => {
  if (isLoadMore) {
    isLoadingMore.value = true
    // Show loading indicator after a small delay to prevent flash
    setTimeout(() => {
      if (isLoadingMore.value) {
        showLoadingIndicator.value = true
      }
    }, 200)
  } else {
    currentPage.value = 1 
    products.value = [] 
  }
  
  error.value = null
  
  try {
// Fetching products silently
    
    // Build query parameters properly
    const queryParams = new URLSearchParams()
    queryParams.append('page', currentPage.value.toString())
    queryParams.append('limit', itemsPerPage.toString())
    queryParams.append('sort', selectedSort.value)
    
    // Use useApi for consistent API calls
    const api = useApi()
    const response = await api.fetchRaw(`/api/products?${queryParams.toString()}`)
    
    if (response && Array.isArray(response.products)) {
      const newProducts = response.products || []
      
      if (isLoadMore) {
        // Force reactivity update by creating new array reference
        // Try both id and _id fields since MongoDB uses _id
        const existingIds = new Set(products.value.map((p: Product) => p.id || p._id))
        const uniqueNewProducts = newProducts.filter((p: Product) => {
          const productId = p.id || p._id
          return !existingIds.has(productId)
        })
        
        if (uniqueNewProducts.length > 0) {
          products.value = [...products.value, ...uniqueNewProducts]
        }
      } else {
        products.value = [...newProducts]
      }
      
      // Update pagination information
      if (response.pagination) {
        totalProducts.value = response.pagination.totalItems || response.pagination.total || 0
        totalPages.value = response.pagination.totalPages || 1
        hasMoreProducts.value = currentPage.value < totalPages.value
      } else {
        // Fallback: check if we got fewer products than requested
        hasMoreProducts.value = newProducts.length >= itemsPerPage
      }
    } else {
      console.error('Invalid response format:', response)
      error.value = 'Ürünler yüklenirken bir hata oluştu.'
    }
  } catch (err: any) {
    console.error('Error fetching products:', err)
    error.value = err instanceof Error ? err.message : 'Ürünler yüklenirken bir hata oluştu.'
  } finally {
    isLoadingMore.value = false
    showLoadingIndicator.value = false
  }
}

// Setup infinite scrolling with Intersection Observer
const setupInfiniteScroll = () => {
  if (typeof window === 'undefined' || !window.IntersectionObserver) return
  
  // Cleanup previous observer if it exists
  if (observer) {
    observer.disconnect()
    observer = null
  }
  
  // Wait for next tick to ensure the observer element is in the DOM
  nextTick(() => {
    if (!observerRef.value) {
      return;
    }
    
    observer = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (entry.isIntersecting && hasMoreProducts.value && !isLoadingMore.value && !isLoading.value && products.value.length > 0) {
        currentPage.value++
        fetchProducts(true)
      }
    }, {
      rootMargin: '100px', // Reduced trigger distance
      threshold: 0.1
    })
    
    observer.observe(observerRef.value)
  })
}

// Handle sort change
function changeSort(sort: string) {
  if (selectedSort.value === sort) return
  
  selectedSort.value = sort
  resetAndFetch()
}

// Reset pagination and fetch new products
const resetAndFetch = async () => {
  // Clean up observer first
  if (observer) {
    observer.disconnect()
    observer = null
  }
  
  products.value = []
  currentPage.value = 1
  hasMoreProducts.value = true
  
  await fetchProducts(false)
  
  // Re-setup infinite scroll after new data is loaded
  await nextTick()
  setTimeout(() => {
    setupInfiniteScroll()
  }, 100)
}

// Format price with Turkish locale
const formatPrice = (price: number) => {
  return price.toLocaleString('tr-TR')
}

// Calculate discount percentage
const calculateDiscount = (originalPrice: number, salePrice: number) => {
  return Math.round((1 - salePrice / originalPrice) * 100)
}

// Set up observers and initial fetch
onMounted(async () => {
  // If products were not loaded in SSR, fetch them now
  if (products.value.length === 0) {
    await fetchProducts(false)
  }
  
  // Setup infinite scroll after initial data is loaded and DOM is ready
  await nextTick()
  
  // Small delay to ensure everything is properly rendered
  setTimeout(() => {
    setupInfiniteScroll()
  }, 100)
})

// Clean up observers
onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})

// Cleanup on route changes
const router = useRouter()
onBeforeRouteLeave(() => {
  // Clean up any remaining observers
  if (observer) {
    observer.disconnect()
    observer = null
  }
  
  // Reset page number for next visit
  currentPage.value = 1
})

// Watch for filter/sort changes to reset pagination and refetch
watch([selectedSort], async () => {
  await resetAndFetch()
})

// Re-setup infinite scroll when loading states change
watch([isLoading], async () => {
  if (!isLoading.value && products.value.length > 0) {
    await nextTick()
    setTimeout(() => {
      setupInfiniteScroll()
    }, 100)
  }
})
</script>

<template>
  <div class="min-h-screen bg-warmWhite">
    <!-- Hero Banner -->
    <PageHeroBanner
      title="Yaşam alanınızı dönüştürecek mobilyalar"
      highlighted-text="dönüştürecek"
      description="Mebel'de kalite ve estetik bir araya geliyor. Modern, şık ve rahat mobilyalarımızla evinizi yeniden keşfedin."
      color-scheme="amber"
    />
    
    <div class="container mx-auto px-4 py-12">
      <!-- Filters and sorting -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div class="text-amber-900 font-medium">
          <span class="text-2xl mr-2">{{ totalProducts }}</span> 
          <span class="text-gray-600">ürün bulundu</span>
        </div>
        
        <div class="flex items-center bg-white rounded-lg shadow-sm border border-gray-100 p-1">
          <label for="sort" class="text-sm text-gray-600 px-3">Sırala:</label>
          <select 
            id="sort"
            v-model="selectedSort"
            @change="changeSort(selectedSort)"
            class="py-2 px-4 rounded-md focus:outline-none focus:ring-0 text-gray-700 bg-transparent"
          >
            <option v-for="option in sortOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>
      
      <!-- Loading State -->
              <div v-if="isLoading" class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8 mb-12">
        <div 
          v-for="i in itemsPerPage" 
          :key="i" 
          class="bg-gray-100 animate-pulse rounded-xl h-96"
        ></div>
      </div>
      
      <!-- Error State -->
      <ErrorMessage 
        v-if="error" 
        :message="error" 
        @retry="resetAndFetch" 
      >
        <template #retry>
          <Button @click="resetAndFetch">
            <Icon name="ph:refresh" class="text-gray-600 mr-2" />
            <span class="text-gray-600">Tekrar deneyin</span>
          </Button>
        </template>
      </ErrorMessage>
      
      <!-- Empty State -->
      <div v-else-if="products.length === 0" class="text-center text-gray-500 py-12">
        <Icon name="ph:shopping-bag" class="text-gray-300 w-20 h-20 mx-auto mb-4" />
        <p class="text-xl">Henüz ürün bulunmamaktadır.</p>
      </div>
      
      <!-- Products Grid -->
              <div v-else class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8 mb-16">
        <TransitionGroup name="product-appear" appear>
          <ProductCard 
            v-for="(product, index) in products" 
            :key="product.id || product._id?.toString() || `product-${index}`" 
            :product="product" 
            class="product-item"
          />
        </TransitionGroup>
      </div>
      
      <!-- Loading more indicator with transition -->
      <Transition name="fade">
        <div v-if="isLoadingMore && showLoadingIndicator" class="flex justify-center py-8">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 border-t-2 border-r-2 border-amber-700 rounded-full animate-spin"></div>
            <span class="text-gray-600 font-medium">Daha fazla ürün yükleniyor...</span>
          </div>
        </div>
      </Transition>
      
      <!-- End of results message -->
      <div v-if="!hasMoreProducts && products.length > 0 && !isLoadingMore" 
        class="text-center text-gray-500 py-8 font-medium">
        Tüm ürünler gösteriliyor ({{ totalProducts }} ürün)
      </div>
      
      <!-- Intersection observer element -->
      <div ref="observerRef" class="h-4 w-full"></div>
    </div>
  </div>
</template>

<style scoped>
/* Base colors for furniture theme */
:root {
  --color-warm-white: #faf9f7;
  --color-wood-accent: #c8a887;
  --color-dark-wood: #8b572a;
}

.bg-warmWhite {
  background-color: var(--color-warm-white);
}

/* Smooth transitions for loading and products */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Product appear animations */
.product-appear-enter-active {
  transition: all 0.4s ease;
  transition-delay: calc(var(--stagger-delay, 0) * 0.05s);
}

.product-appear-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.product-item {
  --stagger-delay: 0;
}

/* Stagger animation for new products */
.product-item:nth-child(n+13) {
  --stagger-delay: calc(var(--index, 0) * 1);
}

/* Typography enhancements */
h1, h2, h3 {
  font-family: 'Playfair Display', Georgia, serif;
}

/* Enhance focus styles for accessibility */
button:focus-visible, a:focus-visible {
  outline: 2px solid var(--color-dark-wood);
  outline-offset: 2px;
}
</style> 