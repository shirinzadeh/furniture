<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import type { Product } from '~/types'
import PageHeroBanner from '~/components/hero-banner/HeroBannerPage.vue'

// Use the products store
const productsStore = useProductsStore()
const categoriesStore = useCategoriesStore()

// State for products
const products = ref<Product[]>([])
const isLoading = ref(false) // Start with false, will be set based on actual need
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

// Get category from URL
const categorySlug = 'office'
const category = computed(() => categoriesStore.categories.find(c => c.slug === categorySlug))

// SEO
useHead({
  title: 'Office Furniture - Stylish & Functional Workspace Solutions',
  meta: [
    {
      name: 'description',
      content: 'Create a productive workspace with our office furniture collection. From desks and chairs to bookcases and file cabinets, find everything for your home office.'
    }
  ]
})

// Fetch category and products
const fetchCategoryAndProducts = async (isLoadMore = false) => {
  if (isLoadMore) {
    isLoadingMore.value = true
  } else {
    // First fetch categories if they're not already loaded
    if (categoriesStore.categories.length === 0) {
      isLoading.value = true
      await categoriesStore.fetchCategories()
    }
    
    // Set categoryId for filtering products
    if (category.value) {
      categoryId.value = category.value.id?.toString() || null
      console.log('Office category found:', category.value.name, 'ID:', categoryId.value)
    } else {
      console.log('Office category not found')
      return
    }
    
    // Check if we have cached products for this category
    if (categoryId.value && productsStore.hasCachedCategoryProducts(categoryId.value)) {
      const cached = productsStore.getCachedCategoryProducts(categoryId.value)
      if (cached) {
        products.value = [...cached.products]
        totalProducts.value = cached.totalItems
        hasMoreProducts.value = !cached.allLoaded
        console.log(`Using cached office products: ${products.value.length}/${totalProducts.value}`)
        isLoading.value = false
        return
      }
    }
    
    // Show loading only if we need to fetch new data
    isLoading.value = true
    page.value = 1
    products.value = []
  }
  
  error.value = null
  
  try {
    if (!categoryId.value) return
    
    // Use useApi for consistent API calls
    const api = useApi()
    const queryParams = new URLSearchParams({
      page: page.value.toString(),
      limit: limit.value.toString(),
      categoryId: categoryId.value
    })
    
    const response = await api.fetchRaw(`/api/products?${queryParams.toString()}`)
    
    if (response) {
      const newProducts = response.products || []
      const responseTotal = response.pagination?.totalItems || 0
      
      if (isLoadMore) {
        // Append to existing products
        products.value = [...products.value, ...newProducts]
        
        // Update cache with appended products
        const allLoaded = products.value.length >= responseTotal
        productsStore.appendCategoryProducts(categoryId.value, newProducts, responseTotal, allLoaded)
      } else {
        // Set initial products
        products.value = [...newProducts]
        
        // Cache the products
        const allLoaded = newProducts.length >= responseTotal
        productsStore.setCategoryProducts(categoryId.value, newProducts, responseTotal, allLoaded)
      }
      
      totalProducts.value = responseTotal
      hasMoreProducts.value = products.value.length < totalProducts.value
      
      console.log(`Loaded ${newProducts.length} office products, total: ${products.value.length}/${totalProducts.value}`)
    }
  } catch (err) {
    console.error('Error fetching office data:', err)
    error.value = 'Failed to load office products. Please try again later.'
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
      title="Office Furniture"
      highlighted-text="Office"
      description="Create a productive and inspiring workspace with our office furniture collection. From ergonomic desks and comfortable chairs to stylish bookcases and practical storage solutions, we have everything you need for the perfect home office."
      color-scheme="indigo"
    />
    
    <!-- Main Content -->
    <div class="container mx-auto px-4 py-8">
      <!-- Category Stats -->
      <div class="mb-8 text-gray-600">
        <p v-if="totalProducts > 0">{{ totalProducts }} products found</p>
      </div>
      
      <!-- Loading State -->
      <div v-if="isLoading" class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
        No products found in this category.
      </div>
      
      <!-- Products Grid -->
      <div v-else class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        <ProductCard 
          v-for="product in products" 
          :key="product.id" 
          :product="product"
        />
      </div>
      
      <!-- Loading more indicator -->
      <div v-if="isLoadingMore" class="flex justify-center py-8">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 border-t-2 border-r-2 border-indigo-600 rounded-full animate-spin"></div>
          <span class="text-gray-600 font-medium">Loading more products...</span>
        </div>
      </div>
      
      <!-- End of results message -->
      <div v-if="!hasMoreProducts && products.length > 0 && !isLoadingMore" 
        class="text-center text-gray-500 py-8 font-medium">
        All products shown ({{ totalProducts }} products)
      </div>
      
             <!-- Intersection observer element for infinite scroll -->
       <div ref="observerTarget" class="h-4 w-full"></div>
     </div>
   </div>
 </template> 