<script setup lang="ts">
import { useProductSort } from '~/composables/useProductSort'
import type { Product, Category } from '~/types'
import ProductCard from '~/components/product/ProductCard.vue'

const route = useRoute()
// Cast the route params to any to avoid TypeScript errors
const params = route.params as any
const slug = typeof params.slug === 'string' ? params.slug : 
             Array.isArray(params.slug) && params.slug.length > 0 ? params.slug[0] : ''

// Use the categories store
const categoriesStore = useCategoriesStore()

const category = ref<Category | null>(null)
const products = ref<Product[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)
const currentPage = ref(1)
const totalPages = ref(1)
const totalProducts = ref(0)
const limit = 12
const retryCount = ref(0)
const maxRetries = 3

// Sort options - using centralized composable
const { selectedSort, sortOptions } = useProductSort()

// Fetch category data with retry mechanism and timeout
const fetchCategoryData = async () => {
  isLoading.value = true
  error.value = null
  
  // Set a timeout to prevent infinite loading
  const timeoutId = setTimeout(() => {
    if (isLoading.value) {
      console.log('Category fetch timeout, using fallback data')
      
      // Create a fallback category for development purposes
      if (process.dev) {
        category.value = {
          id: 'fallback-id',
          name: `${slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ')}`,
          slug: slug,
          description: 'Bu kategori şu anda yüklenemiyor. Lütfen daha sonra tekrar deneyin.',
          image: '/images/placeholder.jpg',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        // Fetch products with the fallback category
        fetchProductsData()
      } else {
        isLoading.value = false
        error.value = 'Kategori yüklenirken zaman aşımı oluştu. Lütfen daha sonra tekrar deneyin.'
      }
    }
  }, 10000) // 10 second timeout
  
  try {
    // Use the Pinia store to fetch the category
    const categoryData = await categoriesStore.fetchCategoryBySlug(slug)
    
    // Clear the timeout since we got a response
    clearTimeout(timeoutId)
    
    if (categoryData) {
      category.value = categoryData
      retryCount.value = 0 // Reset retry count on success
    } else {
      // If no data but no error, it might be a 404
      error.value = 'Kategori bulunamadı'
      console.warn(`Category not found for slug: ${slug}`)
    }
  } catch (err) {
    // Clear the timeout since we got an error
    clearTimeout(timeoutId)
    
    console.error('Error fetching category:', err)
    
    // Implement retry logic
    if (retryCount.value < maxRetries) {
      retryCount.value++
      console.log(`Retrying category fetch (${retryCount.value}/${maxRetries})...`)
      setTimeout(fetchCategoryData, 1000) // Retry after 1 second
      return
    }
    
    // After max retries, use fallback data or show error
    error.value = 'Kategori yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.'
    
    // Create a fallback category for development purposes
    if (process.dev) {
      category.value = {
        id: 'fallback-id',
        name: `${slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ')}`,
        slug: slug,
        description: 'Bu kategori şu anda yüklenemiyor. Lütfen daha sonra tekrar deneyin.',
        image: '/images/placeholder.jpg',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }
  } finally {
    // Clear the timeout if it's still active
    clearTimeout(timeoutId)
    
    // Only fetch products if we have a category (real or fallback)
    if (category.value) {
      fetchProductsData()
    } else {
      isLoading.value = false
    }
  }
}

// Computed value to create the params for the products fetch
const productParams = computed(() => {
  return {
    categoryId: category.value?.id,
    page: currentPage.value,
    limit,
    sort: selectedSort.value
  }
})

// Fetch products data with retry mechanism and timeout
const fetchProductsData = async () => {
  if (!category.value?.id) {
    isLoading.value = false
    return
  }
  
  // Set a timeout to prevent infinite loading
  const timeoutId = setTimeout(() => {
    if (isLoading.value) {
      console.log('Products fetch timeout, using fallback data')
      isLoading.value = false
      
      // Create fallback products for development purposes
      if (process.dev) {
        // Create a fallback category if needed
        const fallbackCategory = category.value || {
          id: 'fallback-category',
          name: `${slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ')}`,
          slug: slug,
          description: 'Bu kategori şu anda yüklenemiyor.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        products.value = Array(8).fill(null).map((_, index) => ({
          id: `fallback-${index}`,
          name: `Örnek Ürün ${index + 1}`,
          description: 'Bu ürün şu anda yüklenemiyor. Lütfen daha sonra tekrar deneyin.',
          price: 1000 + (index * 100),
          salePrice: index % 2 === 0 ? 800 + (index * 80) : null,
          images: ['/images/placeholder.jpg'],
          inStock: true,
          featured: false,
          slug: `ornek-urun-${index + 1}`,
          categoryId: fallbackCategory.id || 'fallback-category',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          category: fallbackCategory
        }))
        totalProducts.value = products.value.length
        totalPages.value = 1
      } else {
        error.value = 'Ürünler yüklenirken zaman aşımı oluştu. Lütfen daha sonra tekrar deneyin.'
      }
    }
  }, 10000) // 10 second timeout
  
  let productRetryCount = 0
  const fetchWithRetry = async () => {
    try {
      const { data: productsData } = await useFetch('/api/products', { 
        params: productParams.value,
        timeout: 10000, // 10 second timeout
      })
      
      // Clear the timeout since we got a response
      clearTimeout(timeoutId)
      
      if (productsData.value) {
        products.value = productsData.value.products || []
        totalPages.value = productsData.value.pagination?.totalPages || 1
        totalProducts.value = productsData.value.pagination?.total || 0
      } else {
        // No data but no error
        products.value = []
        totalPages.value = 1
        totalProducts.value = 0
      }
    } catch (err) {
      // Clear the timeout since we got an error
      clearTimeout(timeoutId)
      
      console.error('Error fetching products:', err)
      
      // Implement retry logic
      if (productRetryCount < maxRetries) {
        productRetryCount++
        console.log(`Retrying products fetch (${productRetryCount}/${maxRetries})...`)
        await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
        return fetchWithRetry() // Retry
      }
      
      // After max retries, use fallback data or show error
      error.value = 'Ürünler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.'
      
      // Create fallback products for development purposes
      if (process.dev) {
        // Create a fallback category if needed
        const fallbackCategory = category.value || {
          id: 'fallback-category',
          name: `${slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ')}`,
          slug: slug,
          description: 'Bu kategori şu anda yüklenemiyor.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        products.value = Array(8).fill(null).map((_, index) => ({
          id: `fallback-${index}`,
          name: `Örnek Ürün ${index + 1}`,
          description: 'Bu ürün şu anda yüklenemiyor. Lütfen daha sonra tekrar deneyin.',
          price: 1000 + (index * 100),
          salePrice: index % 2 === 0 ? 800 + (index * 80) : null,
          images: ['/images/placeholder.jpg'],
          inStock: true,
          featured: false,
          slug: `ornek-urun-${index + 1}`,
          categoryId: fallbackCategory.id || 'fallback-category',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          category: fallbackCategory
        }))
        totalProducts.value = products.value.length
        totalPages.value = 1
      }
    } finally {
      // Clear the timeout if it's still active
      clearTimeout(timeoutId)
      isLoading.value = false
    }
  }
  
  await fetchWithRetry()
}

// Refresh data when sort or page changes
watch([selectedSort, currentPage], () => {
  if (category.value?.id) {
    isLoading.value = true
    fetchProductsData()
  }
})

// Pagination helpers
const handlePageChange = (page: number) => {
  currentPage.value = page
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Handle sort change
function changeSort(sort: string) {
  selectedSort.value = sort
  currentPage.value = 1
}

// Update meta tags
useHead(() => ({
  title: category.value?.name || 'Kategori',
  meta: [
    { name: 'description', content: category.value?.description || 'Kategori sayfası' }
  ]
}))

// Fetch data on component mount
onMounted(fetchCategoryData)
</script>

<template>
  <div>
    <!-- Category Header -->
    <div v-if="category" class="relative overflow-hidden bg-gradient-to-r from-gray-50 to-gray-100">
      <div class="absolute inset-0 pattern-bg opacity-10"></div>
      <div class="container mx-auto px-4 py-12 md:py-16 relative z-10">
        <div class="max-w-4xl">
          <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-gray-900 leading-tight">
            <span class="relative inline-block">
              <span class="relative z-10">{{ category.name }}</span>
              <span class="absolute bottom-2 left-0 w-full h-3 bg-amber-200 opacity-50 -z-10"></span>
            </span>
          </h1>
          <p v-if="category.description" class="text-lg text-gray-700 max-w-2xl leading-relaxed">
            {{ category.description }}
          </p>
        </div>
      </div>
      
      <!-- Decorative elements -->
      <div class="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-amber-100 opacity-50"></div>
      <div class="absolute top-16 -right-8 w-32 h-32 rounded-full bg-gray-200 opacity-40"></div>
    </div>
    
    <div class="container mx-auto px-4 py-8">
      <!-- Breadcrumbs -->
      <div class="mb-6">
        <ul class="flex text-sm text-gray-600">
          <li class="flex items-center">
            <NuxtLink to="/" class="hover:text-gray-900 transition-colors">Ana Sayfa</NuxtLink>
            <span class="mx-2">/</span>
          </li>
          <li class="flex items-center">
            <NuxtLink to="/categories" class="hover:text-gray-900 transition-colors">Kategoriler</NuxtLink>
            <span class="mx-2">/</span>
          </li>
          <li v-if="category" class="text-gray-900 font-medium">
            {{ category.name }}
          </li>
        </ul>
      </div>
      
      <!-- Loading state -->
      <div v-if="isLoading">
        <div class="h-8 bg-gray-200 animate-pulse rounded mb-8 w-1/4"></div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          <div v-for="i in 8" :key="i" class="bg-gray-200 animate-pulse rounded-xl h-80"></div>
        </div>
      </div>
      
      <!-- Error state -->
      <div v-else-if="error" class="bg-red-50 border border-red-100 rounded-xl p-8 text-center">
        <div class="flex flex-col items-center">
          <div class="bg-red-100 p-3 rounded-full mb-4">
            <Icon name="mdi:alert-circle-outline" class="text-red-500" size="32" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Bir Hata Oluştu</h3>
          <p class="text-gray-600 mb-6">{{ error }}</p>
          <NuxtLink 
            to="/categories" 
            class="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <Icon name="mdi:arrow-left" size="20" />
            Tüm Kategorilere Dön
          </NuxtLink>
        </div>
      </div>
      
      <!-- Category content -->
      <div v-else-if="category">
        <!-- Filters and sorting -->
        <div class="bg-white rounded-xl shadow-sm p-4 mb-8">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div class="text-sm text-gray-600 flex items-center">
              <Icon name="mdi:tag-multiple-outline" size="20" class="mr-2 text-gray-500" />
              <span>{{ totalProducts }} ürün bulundu</span>
            </div>
            
            <div class="flex items-center">
              <label for="sort" class="text-sm text-gray-600 mr-2">Sırala:</label>
              <select 
                id="sort"
                v-model="selectedSort"
                @change="changeSort(selectedSort)"
                class="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>
        </div>
        
        <!-- Products grid -->
        <div v-if="products.length === 0" class="bg-gray-50 border border-gray-100 rounded-xl p-12 text-center">
          <div class="flex flex-col items-center">
            <div class="bg-gray-100 p-4 rounded-full mb-4">
              <Icon name="mdi:package-variant-closed" class="text-gray-500" size="32" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Bu kategoride ürün bulunamadı</h3>
            <p class="text-gray-600 mb-6 max-w-md mx-auto">Başka bir kategori seçmeyi deneyin veya daha sonra tekrar kontrol edin.</p>
            <NuxtLink 
              to="/categories" 
              class="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <Icon name="mdi:arrow-left" size="20" />
              Tüm Kategorilere Dön
            </NuxtLink>
          </div>
        </div>
        
        <div v-else>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            <ProductCard 
              v-for="product in products" 
              :key="product.id" 
              :product="product" 
            />
          </div>
          
          <!-- Pagination -->
          <div v-if="totalPages > 1" class="flex justify-center mt-12">
            <div class="flex space-x-1">
              <button 
                @click="handlePageChange(currentPage - 1)"
                :disabled="currentPage === 1"
                class="px-4 py-2 border rounded-md flex items-center"
                :class="currentPage === 1 ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-gray-700 border-gray-300 hover:bg-gray-50'"
              >
                <Icon name="mdi:chevron-left" size="20" />
              </button>
              
              <button 
                v-for="page in totalPages" 
                :key="page"
                @click="handlePageChange(page)"
                class="px-4 py-2 border rounded-md"
                :class="currentPage === page ? 'bg-gray-900 text-white border-gray-900' : 'text-gray-700 border-gray-300 hover:bg-gray-50'"
              >
                {{ page }}
              </button>
              
              <button 
                @click="handlePageChange(currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="px-4 py-2 border rounded-md flex items-center"
                :class="currentPage === totalPages ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-gray-700 border-gray-300 hover:bg-gray-50'"
              >
                <Icon name="mdi:chevron-right" size="20" />
              </button>
            </div>
          </div>
          
          <!-- Related Categories Section -->
          <div v-if="categoriesStore.categories.length > 1 && category" class="mt-20 pt-12 border-t border-gray-100">
            <div class="flex justify-between items-center mb-8">
              <h2 class="text-2xl font-bold text-gray-900">
                <span class="relative inline-block">
                  <span class="relative z-10">Diğer Kategoriler</span>
                  <span class="absolute bottom-1 left-0 w-full h-2 bg-amber-200 opacity-40 -z-10"></span>
                </span>
              </h2>
              <NuxtLink to="/categories" class="text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-1 group">
                Tüm Kategoriler
                <Icon name="mdi:arrow-right" size="18" class="transform group-hover:translate-x-1 transition-transform duration-300" />
              </NuxtLink>
            </div>
            
            <div class="related-categories-grid">
              <NuxtLink 
                v-for="(relatedCategory, index) in categoriesStore.categories.filter(c => category && c.id !== category.id).slice(0, 4)" 
                :key="`related-${relatedCategory.id}`" 
                :to="`/categories/${relatedCategory.slug}`"
                :class="[
                  'related-category-item',
                  index === 0 ? 'related-category-item--featured' : ''
                ]"
              >
                <div class="relative h-full overflow-hidden rounded-xl">
                  <NuxtImg
                    :src="relatedCategory.image || '/images/placeholder.jpg'"
                    :alt="relatedCategory.name"
                    class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    format="webp"
                    quality="80"
                    loading="lazy"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/40 to-transparent"></div>
                  
                  <div class="absolute inset-0 flex flex-col justify-end p-6">
                    <h3 class="text-xl font-bold text-white mb-1 group-hover:translate-y-0 translate-y-2 transition-transform duration-300">
                      {{ relatedCategory.name }}
                    </h3>
                    <div class="w-10 h-0.5 bg-amber-400 mb-3 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                    <p v-if="relatedCategory.description" class="text-gray-200 text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {{ relatedCategory.description }}
                    </p>
                    
                    <div class="flex justify-between items-center mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span class="text-xs text-white bg-gray-800/60 backdrop-blur-sm px-2 py-1 rounded-full">
                        {{ relatedCategory._count?.products || 0 }} ürün
                      </span>
                      <span class="text-white bg-amber-500/90 backdrop-blur-sm p-1.5 rounded-full inline-flex">
                        <Icon name="mdi:arrow-right" size="16" />
                      </span>
                    </div>
                  </div>
                </div>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pattern-bg {
  background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23000000' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E");
}

.product-card {
  @apply bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300;
}

.product-card:hover {
  transform: translateY(-4px);
}

.featured-category-card {
  @apply transition-all duration-300;
}

.featured-category-card:hover {
  transform: translateY(-2px);
}

/* Related Categories Grid */
.related-categories-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.related-category-item {
  @apply bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300;
  height: 280px;
}

.related-category-item:hover {
  transform: translateY(-4px);
}

@media (min-width: 640px) {
  .related-categories-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 280px);
  }
  
  .related-category-item--featured {
    grid-column: span 2;
    grid-row: span 1;
  }
}

@media (min-width: 1024px) {
  .related-categories-grid {
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(2, 240px);
  }
  
  .related-category-item--featured {
    grid-column: span 2;
    grid-row: span 2;
  }
}
</style>