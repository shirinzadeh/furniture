<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Product } from '~/types'
import PageHeroBanner from '~/components/hero-banner/HeroBannerPage.vue'

// Use the products store
const productsStore = useProductsStore()
const categoriesStore = useCategoriesStore()

// State for products
const products = ref<Product[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

// Pagination
const page = ref(1)
const limit = ref(12)
const totalPages = ref(1)
const totalProducts = ref(0)
const categoryId = ref<string | null>(null)

// Get category from URL
const categorySlug = 'dining-room'
const category = computed(() => categoriesStore.categories.find(c => c.slug === categorySlug))

// SEO
useHead({
  title: 'Yemek Odası Mobilyaları - Elegant & Modern Collections',
  meta: [
    {
      name: 'description',
      content: 'Yemek odası mobilya koleksiyonumuzu keşfedin. Yemek masalarından masalarına, yemek odasınız için ihtiyacınız olan her şeye sahibiz.'
    }
  ]
})

// Fetch category and products
const fetchCategoryAndProducts = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    // First fetch categories if they're not already loaded
    if (categoriesStore.categories.length === 0) {
      await categoriesStore.fetchCategories()
    }
    
    // Set categoryId for filtering products
    if (category.value) {
      categoryId.value = category.value.id
    }
    
    // Fetch products for this category
    const response = await productsStore.fetchProducts({
      page: page.value,
      limit: limit.value,
      category: categoryId.value || undefined
    })
    
    if (response) {
      products.value = productsStore.products
      totalPages.value = productsStore.pagination.pages
      totalProducts.value = productsStore.pagination.total
    }
  } catch (err) {
    console.error('Error fetching dining room data:', err)
    error.value = 'Failed to load dining room products. Please try again later.'
  } finally {
    isLoading.value = false
  }
}

// Handle page change
const handlePageChange = (newPage: number) => {
  page.value = newPage
  window.scrollTo({ top: 0, behavior: 'smooth' })
  fetchCategoryAndProducts()
}

// Fetch data on component mount
onMounted(() => {
  fetchCategoryAndProducts()
})
</script>

<template>
  <div>
    <!-- Page Header -->
    <PageHeroBanner
      title="Yemek Odası Mobilyaları"
      highlighted-text="Yemek Odası"
      description="Yemek odasınız için mükemmel alanı yaratın. Lüks yemek masalarından rahat koltuklarına ve görsel depolama çözümlerine kadar, yemek odanız için ihtiyacınız olan her şeye sahibiz."
      color-scheme="teal"
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
      
      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center mt-12">
        <div class="flex space-x-2">
          <button 
            v-for="p in totalPages" 
            :key="p"
            @click="handlePageChange(p)"
            class="w-10 h-10 flex items-center justify-center rounded-md"
            :class="p === page ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'"
          >
            {{ p }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template> 