<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch, computed } from 'vue'
import type { Product } from '~/types'
import ProductCard from '~/components/product/ProductCard.vue'
import ErrorMessage from '~/components/ui/UiErrorMessage.vue'
import Button from '~/components/ui/UiButton.vue'
import PageHeroBanner from '~/components/hero-banner/HeroBannerPage.vue'

// Use the products store
const productsStore = useProductsStore()
const categoriesStore = useCategoriesStore()

// Initialize API composable
const api = useApi()
const apiState = useApiState()

// State for products
const products = ref<Product[]>([])
const isLoading = computed(() => apiState.isLoading.value)
const isLoadingMore = ref(false)
const error = ref<string | null>(null)
const observerRef = ref<HTMLElement | null>(null)

// Pagination
const currentPage = ref(1)
const itemsPerPage = 12
const totalPages = ref(1)
const totalProducts = ref(0)
const hasMorePages = ref(true)

// Observer for infinite scroll
let observer: IntersectionObserver | null = null

// Initialize with server-side rendering support for better SEO and performance
let categoryId = ref<string | null>(null)

// Get category from URL
const categorySlug = 'living-room'
const category = ref(categoriesStore.categories.find(c => c.slug === categorySlug))

// SEO
useHead({
  title: 'OTURMA ODASI MOBİLYALARI - Modern & Stylish Designs',
  meta: [
    {
      name: 'description',
      content: 'OTURMA ODASI MOBİLYALARI - Modern & Stylish Designs'
    }
  ]
})

// Use a route watcher to reset state on route change
const route = useRoute()
watch(() => route.fullPath, () => {
  // Reset pagination when route changes
  currentPage.value = 1
  products.value = []
})

// Server-side data fetching with apiAsyncData to prevent duplicate fetches
const { data: initialCategoryData } = await api.asyncData(
  'living-room-category',
  () => api.fetchRaw('/categories/by-slug/living-room'),
  { 
    server: true,
    key: 'living-room-category-data'
  }
)

// Set categoryId from SSR data if available
if (initialCategoryData.value?.category?.id) {
  categoryId.value = initialCategoryData.value.category.id
  
  // Fetch initial products with the category ID
  const { data: initialProductsData } = await api.asyncData(
    'living-room-products',
    () => api.fetchRaw('/products', {
      params: {
        category: categoryId.value,
        page: 1,
        limit: itemsPerPage,
        skip: 0
      }
    }),
    { 
      server: true,
      key: 'living-room-products-initial'
    }
  )
  
  if (initialProductsData.value) {
    products.value = initialProductsData.value.products || []
    totalPages.value = initialProductsData.value.pagination?.pages || 1
    totalProducts.value = initialProductsData.value.pagination?.total || 0
    hasMorePages.value = 1 < totalPages.value
  }
}

// Fetch category and products
const fetchCategoryAndProducts = async (isInitialFetch = false) => {
  if (isInitialFetch) {
    currentPage.value = 1 // Reset to page 1 for initial fetches
    products.value = [] // Clear products on initial fetch
  } else {
    isLoadingMore.value = true
  }
  
  try {
    // Fetch category first if we don't have it
    if (!categoryId.value) {
      console.log('Fetching category data for living-room');
      const categoryResponse = await api.fetchRaw('/categories/by-slug/living-room');
      
      categoryId.value = categoryResponse.category?.id || null
      
      if (!categoryId.value) {
        throw new Error('Living room category not found')
      }
    }
    
    // Set categoryId for filtering products
    if (!categoryId.value) {
      throw new Error('Category ID is required')
    }
    
    console.log('Fetching living room products:', {
      category: categoryId.value,
      page: currentPage.value,
      limit: itemsPerPage,
      skip: 0
    });
    
    // Fetch products for this category using api.fetchRaw
    const response = await api.fetchRaw('/products', {
      params: {
        category: categoryId.value,
        page: currentPage.value,
        limit: itemsPerPage,
        skip: 0 // Always include skip=0 for consistency
      }
    });
    
    if (response) {
      // Update products - append for infinite scroll or replace for initial fetch
      if (isInitialFetch) {
        products.value = response.products || []
      } else {
        const newProducts = response.products || [];
        // Only add if we actually got products
        if (newProducts.length > 0) {
          products.value = [...products.value, ...newProducts]
        }
      }
      
      totalPages.value = response.pagination?.pages || 1
      totalProducts.value = response.pagination?.total || 0
      hasMorePages.value = currentPage.value < totalPages.value
    } else {
      throw new Error('Failed to fetch products')
    }
  } catch (err) {
    console.error('Error fetching category and products:', err)
    error.value = 'Failed to load living room products. Please try again later.'
  } finally {
    if (!isInitialFetch) {
      isLoadingMore.value = false
    }
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
      console.error('Observer element not found in DOM');
      return;
    }
    
    observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMorePages.value && !isLoadingMore.value && !isLoading.value) {
        console.log('Loading more living room products, incrementing to page:', currentPage.value + 1);
        currentPage.value++
        fetchCategoryAndProducts(false)
      }
    }, {
      rootMargin: '200px', // Trigger before user reaches bottom
      threshold: 0.1
    })
    
    observer.observe(observerRef.value)
    console.log('Living room infinite scroll observer setup complete');
  })
}

// Reset and fetch from the beginning
const resetAndFetch = () => {
  products.value = []
  currentPage.value = 1
  fetchCategoryAndProducts(true)
}

// Format price with Turkish locale
const formatPrice = (price: number) => {
  return price.toLocaleString('tr-TR')
}

// Calculate discount percentage
const calculateDiscount = (originalPrice: number, salePrice: number) => {
  return Math.round((1 - salePrice / originalPrice) * 100)
}

// Set up observers and fetch data on client side if needed
onMounted(() => {
  // If data wasn't loaded on server, fetch it on the client
  if (products.value.length === 0) {
    fetchCategoryAndProducts(true)
  }
  
  // Setup infinite scroll
  nextTick(() => {
    setupInfiniteScroll()
  })
})

// Cleanup observers on component unmount
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
</script>

<template>
  <div class="min-h-screen bg-warmWhite">
    <!-- Category Header -->
    <PageHeroBanner
      title="Oturma Odası Mobilyaları"
      highlighted-text="Mobilyaları"
      description="Şık ve konforlu oturma odası mobilyalarımızla yaşam alanınızı dönüştürün. Zarif koltuklardan sehpalara ve eğlence ünitelerine kadar, koleksiyonumuz rahat ve davetkar bir atmosfer yaratmak için mükemmel parçalar sunar."
      color-scheme="blue"
    />
    
    <!-- Main Content -->
    <div class="container mx-auto px-4 py-12">
      <!-- Category Stats -->
      <div class="mb-8 text-amber-900 font-medium">
        <span v-if="totalProducts > 0" class="text-2xl mr-2">{{ totalProducts }}</span>
        <span v-if="totalProducts > 0" class="text-gray-600">ürün bulundu</span>
      </div>
      
      <!-- Loading State -->
      <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
        <div 
          v-for="i in 8" 
          :key="i" 
          class="bg-gray-100 animate-pulse rounded-xl h-96"
        ></div>
      </div>
      
      <!-- Error State -->
      <ErrorMessage 
        v-else-if="error" 
        :message="error" 
        @retry="resetAndFetch" 
      >
        <template #retry>
          <Button 
            @click="resetAndFetch" 
            variant="primary"
            icon="ph:arrow-clockwise"
            icon-position="left"
          >
            Tekrar Dene
          </Button>
        </template>
      </ErrorMessage>
      
      <!-- Empty State -->
      <div v-else-if="products.length === 0" class="text-center text-gray-500 py-12">
        <Icon name="ph:armchair" class="text-gray-300 w-20 h-20 mx-auto mb-4" />
        <p class="text-xl">Bu kategoride henüz ürün bulunmamaktadır.</p>
      </div>
      
      <!-- Products Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
        <ProductCard 
          v-for="product in products" 
          :key="product.id" 
          :product="product" 
        />
      </div>
      
      <!-- Loading more indicator -->
      <div v-if="isLoadingMore" class="flex justify-center py-8">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 border-t-2 border-r-2 border-amber-700 rounded-full animate-spin"></div>
          <span class="text-gray-600 font-medium">Daha fazla ürün yükleniyor...</span>
        </div>
      </div>
      
      <!-- End of results message -->
      <div v-if="!hasMorePages && products.length > 0 && !isLoadingMore" 
        class="text-center text-gray-500 py-8 font-medium">
        Tüm ürünler gösteriliyor
      </div>
      
      <!-- Featured Room Inspiration Section -->
      <div class="mt-16 py-12 bg-amber-50 rounded-xl">
        <div class="text-center mb-10">
          <h2 class="text-3xl font-serif font-medium text-gray-900 mb-4">Oturma Odası İlham Köşesi</h2>
          <p class="text-gray-600 max-w-2xl mx-auto">Bu sezon en çok tercih edilen oturma odası kombinasyonları</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 px-6">
          <div class="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group">
            <div class="aspect-[4/3] overflow-hidden">
              <NuxtImg src="/images/living-room-1.jpg" alt="Modern Oturma Odası" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div class="p-5">
              <h3 class="text-lg font-medium text-gray-900 mb-2">Modern Minimalist</h3>
              <p class="text-gray-600 text-sm">Sade ve işlevsel mobilyalarla ferah bir yaşam alanı</p>
            </div>
          </div>
          <div class="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group">
            <div class="aspect-[4/3] overflow-hidden">
              <NuxtImg src="/images/living-room-2.jpg" alt="Klasik Oturma Odası" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div class="p-5">
              <h3 class="text-lg font-medium text-gray-900 mb-2">Klasik Zarafet</h3>
              <p class="text-gray-600 text-sm">Zamansız tasarımlarla şık ve konforlu bir yaşam alanı</p>
            </div>
          </div>
          <div class="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group">
            <div class="aspect-[4/3] overflow-hidden">
              <NuxtImg src="/images/living-room-3.jpg" alt="Endüstriyel Oturma Odası" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div class="p-5">
              <h3 class="text-lg font-medium text-gray-900 mb-2">Endüstriyel Stil</h3>
              <p class="text-gray-600 text-sm">Ham dokularla karakteristik bir yaşam alanı</p>
            </div>
          </div>
        </div>
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

/* Smooth fade in for products */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.grid > a {
  animation: fadeIn 0.5s ease forwards;
  animation-delay: calc(var(--animation-order, 0) * 0.1s);
  opacity: 0;
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