<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import type { Product } from '~/types'
import PageHeroBanner from '~/components/hero-banner/HeroBannerPage.vue'

// Use the products store
const productsStore = useProductsStore()
const categoriesStore = useCategoriesStore()

// State for products
const products = ref<Product[]>([])
const isLoading = ref(true)
const isLoadingMore = ref(false)
const error = ref<string | null>(null)
const hasMoreProducts = ref(true)

// Pagination for infinite scroll
const page = ref(1)
const limit = ref(12)
const totalProducts = ref(0)
const categoryId = ref<string | null>(null)

// Observer for infinite scroll
let observer: IntersectionObserver | null = null
const observerTarget = ref<HTMLElement | null>(null)

// Get category from URL - use the correct category slug
const categorySlug = 'kids-youth'
const category = computed(() => categoriesStore.categories.find(c => c.slug === categorySlug))

// SEO
useHead({
  title: 'Çocuk & Genç Mobilyaları - Eğlenceli ve Fonksiyonel Çözümler',
  meta: [
    {
      name: 'description',
      content: 'Çocuk ve genç odaları için eğlenceli ve pratik mobilya koleksiyonumuzu keşfedin. Yataklardan masalara, depolama çözümlerine kadar, çocuğunuzla birlikte büyüyen mobilyalar bulun.'
    }
  ]
})

// Fetch category and products
const fetchCategoryAndProducts = async (isLoadMore = false) => {
  if (isLoadMore) {
    isLoadingMore.value = true
  } else {
    isLoading.value = true
    page.value = 1
    products.value = []
  }
  
  error.value = null
  
  try {
    // First fetch categories if they're not already loaded
    if (categoriesStore.categories.length === 0) {
      await categoriesStore.fetchCategories()
    }
    
    // Set categoryId for filtering products
    if (category.value) {
      categoryId.value = category.value._id?.toString() || null
      console.log('Kids-Youth category found:', category.value.name, 'ID:', categoryId.value)
    } else {
      console.log('Kids-Youth category not found')
    }
    
    // Use useApi for consistent API calls
    const api = useApi()
    const queryParams = new URLSearchParams({
      page: page.value.toString(),
      limit: limit.value.toString()
    });
    
    if (categoryId.value) {
      queryParams.append('categoryId', categoryId.value);
    }
    
    const response = await api.fetchRaw(`/api/products?${queryParams.toString()}`)
    
    if (response) {
      const newProducts = response.products || []
      
      if (isLoadMore) {
        // Force reactivity update by creating new array reference
        products.value = [...products.value, ...newProducts]
      } else {
        products.value = [...newProducts]
      }
      
      totalProducts.value = response.pagination?.totalItems || 0
      hasMoreProducts.value = products.value.length < totalProducts.value
      
      console.log(`Loaded ${newProducts.length} products, total: ${products.value.length}/${totalProducts.value}`)
    }
  } catch (err) {
    console.error('Error fetching kids and youth data:', err)
    error.value = 'Failed to load kids and youth products. Please try again later.'
  } finally {
    isLoading.value = false
    isLoadingMore.value = false
  }
}

// Load more products
const loadMoreProducts = () => {
  if (!isLoadingMore.value && hasMoreProducts.value) {
    page.value++
    fetchCategoryAndProducts(true)
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
  await fetchCategoryAndProducts()
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
  <div>
    <!-- Page Header -->
    <PageHeroBanner
      title="Çocuk & Genç Mobilyaları"
      highlighted-text="Çocuk & Genç"
      description="Çocuklarınız için mükemmel alanı yaratın. Çocuk ve genç mobilya koleksiyonumuz, hem eğlence hem de işlevsellik düşünülerek tasarlanmıştır. Mobilyalarımız, çocuğunuzun erken yıllarından gençlik dönemine kadar büyümesine eşlik eder."
      color-scheme="rose"
    />
    
    <!-- Main Content -->
    <div class="container mx-auto px-4 py-8">
      <!-- Category Stats -->
      <div class="mb-8 text-gray-600">
        <p v-if="totalProducts > 0">{{ totalProducts }} ürün bulundu</p>
      </div>
      
      <!-- Loading State -->
      <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div 
          v-for="i in 8" 
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
        Bu kategoride ürün bulunamadı.
      </div>
      
      <!-- Products Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <ProductCard 
          v-for="product in products" 
          :key="product.id" 
          :product="product"
        />
      </div>
      
      <!-- Loading more indicator -->
      <div v-if="isLoadingMore" class="flex justify-center py-8">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 border-t-2 border-r-2 border-rose-600 rounded-full animate-spin"></div>
          <span class="text-gray-600 font-medium">Daha fazla ürün yükleniyor...</span>
        </div>
      </div>
      
      <!-- End of results message -->
      <div v-if="!hasMoreProducts && products.length > 0 && !isLoadingMore" 
        class="text-center text-gray-500 py-8 font-medium">
        Tüm ürünler gösteriliyor ({{ totalProducts }} ürün)
      </div>
      
             <!-- Intersection observer element for infinite scroll -->
       <div ref="observerTarget" class="h-4 w-full"></div>
     </div>
   </div>
 </template> 