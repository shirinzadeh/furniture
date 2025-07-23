<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useProductSort } from '~/composables/useProductSort'
import { useProductListing } from '~/composables/useProductListing'
import { useGridLayout } from '~/composables/useGridLayout'
import { PAGINATION, UI } from '~/composables/useConstants'
import type { Product } from '~/types'
import ProductCard from '~/components/product/ProductCard.vue'
import ErrorMessage from '~/components/ui/UiErrorMessage.vue'
import Button from '~/components/ui/UiButton.vue'

// Get search query from URL
const route = useRoute()
const searchQuery = computed(() => route.query.q as string || '')

// SEO metadata
useHead({
  title: computed(() => searchQuery.value ? `"${searchQuery.value}" için arama sonuçları | Mebel` : 'Arama | Mebel'),
  meta: [
    { 
      name: 'description', 
      content: computed(() => searchQuery.value 
        ? `"${searchQuery.value}" arama sonuçları. Mebel'de istediğiniz mobilyayı bulun.`
        : 'Mebel\'de aradığınız mobilyayı bulun. Geniş ürün yelpazesi içerisinde arama yapın.'
      )
    }
  ]
})

// Initialize composables
const { fetchRaw } = useApi()
const apiState = useApiState()
const { selectedSort, sortOptions } = useProductSort()
const { productGridClasses, loadingSkeletonClasses } = useGridLayout()

// Product listing with centralized pagination and infinite scroll
const listing = useProductListing({
  itemsPerPage: PAGINATION.DEFAULT_ITEMS_PER_PAGE,
  enableInfiniteScroll: true
})

// Destructure for convenience
const {
  products,
  currentPage,
  totalPages,
  totalProducts,
  hasMoreProducts,
  isLoadingMore,
  showLoadingIndicator,
  error,
  observerRef,
  itemsPerPage,
  resetPagination,
  updatePagination,
  addProducts,
  setupInfiniteScroll,
  loadMore,
  cleanup
} = listing

// Loading state
const isLoading = computed(() => apiState.isLoading.value)

// Main search function
const searchProducts = async (reset = false) => {
  if (!searchQuery.value.trim()) {
    products.value = []
    return
  }

  try {
    error.value = null
    
    if (reset) {
      resetPagination()
    }

    if (!hasMoreProducts.value && !reset) return

    isLoadingMore.value = currentPage.value > 1
    showLoadingIndicator.value = currentPage.value === 1

    const queryParams = new URLSearchParams({
      search: searchQuery.value,
      page: currentPage.value.toString(),
      limit: itemsPerPage.toString(),
      sort: selectedSort.value
    })

    const response = await fetchRaw<{
      products: Product[]
      pagination: {
        page: number
        totalPages: number
        total: number
      }
    }>(`/products?${queryParams.toString()}`)

    if (response?.products) {
      addProducts(response.products, reset)

      // Update pagination info
      if (response.pagination) {
        updatePagination(response.pagination)
      }
    }
  } catch (err: any) {
    console.error('Search error:', err)
    error.value = err.message || 'Arama sırasında bir hata oluştu'
  } finally {
    isLoadingMore.value = false
    showLoadingIndicator.value = false
  }
}

// Load more products for infinite scroll
const loadMoreProducts = async () => {
  await loadMore(() => searchProducts())
}

// Watch for search query changes
watch(searchQuery, (newQuery) => {
  if (newQuery) {
    searchProducts(true)
  } else {
    products.value = []
    totalProducts.value = 0
  }
})

// Watch for sort changes
watch(selectedSort, () => {
  if (searchQuery.value) {
    searchProducts(true)
  }
})

// Initial search on mount
onMounted(() => {
  if (searchQuery.value) {
    searchProducts(true)
  }
  setupInfiniteScroll(loadMoreProducts)
})

onUnmounted(() => {
  cleanup()
})

// Computed for displaying results summary
const resultsSummary = computed(() => {
  if (!searchQuery.value) return ''
  if (totalProducts.value === 0) return `"${searchQuery.value}" için sonuç bulunamadı`
  if (totalProducts.value === 1) return `"${searchQuery.value}" için 1 sonuç bulundu`
  return `"${searchQuery.value}" için ${totalProducts.value} sonuç bulundu`
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Page header -->
    <div class="bg-white shadow-sm border-b border-gray-100">
      <div class="container mx-auto px-4 py-6">
        <div class="text-center">
          <h1 class="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">
            Arama Sonuçları
          </h1>
          <p v-if="searchQuery" class="text-lg text-gray-600">
            {{ resultsSummary }}
          </p>
          <p v-else class="text-lg text-gray-600">
            Arama yapmak için bir terim girin
          </p>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="container mx-auto px-4 py-8">
      <!-- No search query message -->
      <div v-if="!searchQuery" class="text-center py-16">
        <Icon name="ph:magnifying-glass" size="64" class="text-gray-300 mx-auto mb-4" />
        <h2 class="text-2xl font-semibold text-gray-600 mb-2">Arama Yapın</h2>
        <p class="text-gray-500">Aradığınız ürünü bulmak için üst kısımdaki arama kutusunu kullanın.</p>
      </div>

      <!-- Search results -->
      <div v-else>
        <!-- Sort and filters bar -->
        <div v-if="totalProducts > 0" class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div class="text-sm text-gray-600">
            {{ products.length }} / {{ totalProducts }} ürün gösteriliyor
          </div>
          
          <div class="flex items-center space-x-2">
            <span class="text-sm font-medium text-gray-700">Sırala:</span>
            <select 
              v-model="selectedSort"
              class="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- Loading indicator -->
        <div v-if="showLoadingIndicator" class="flex justify-center items-center py-16">
          <div class="text-center">
            <Icon name="ph:spinner" size="48" class="text-amber-600 animate-spin mx-auto mb-4" />
            <p class="text-gray-600">Ürünler aranıyor...</p>
          </div>
        </div>

        <!-- Error message -->
        <ErrorMessage v-else-if="error" :message="error" />

        <!-- No results -->
        <div v-else-if="!showLoadingIndicator && products.length === 0 && searchQuery" class="text-center py-16">
          <Icon name="ph:magnifying-glass-minus" size="64" class="text-gray-300 mx-auto mb-4" />
          <h2 class="text-2xl font-semibold text-gray-600 mb-2">Sonuç Bulunamadı</h2>
          <p class="text-gray-500 mb-4">
            "<span class="font-medium">{{ searchQuery }}</span>" için herhangi bir ürün bulunamadı.
          </p>
          <div class="text-gray-500">
            <p class="mb-2">Öneriler:</p>
            <ul class="text-left inline-block">
              <li>• Arama teriminizi kontrol edin</li>
              <li>• Daha genel terimler kullanın</li>
              <li>• Farklı kelimeler deneyin</li>
            </ul>
          </div>
        </div>

                <!-- Products grid -->
        <div v-else-if="products.length > 0">
          <div :class="productGridClasses">
            <ProductCard 
              v-for="product in products" 
              :key="product._id?.toString() || product.slug" 
              :product="product" 
            />
          </div>

          <!-- Load more trigger for infinite scroll -->
          <div 
            v-if="hasMoreProducts" 
            ref="observerRef" 
            class="flex justify-center items-center py-8"
          >
            <div v-if="isLoadingMore" class="text-center">
              <Icon name="ph:spinner" size="32" class="text-amber-600 animate-spin mx-auto mb-2" />
              <p class="text-gray-600">Daha fazla ürün yükleniyor...</p>
            </div>
            <Button 
              v-else
              @click="loadMoreProducts"
              variant="outline"
              class="px-8 py-3"
            >
              Daha Fazla Yükle
            </Button>
          </div>

          <!-- End of results indicator -->
          <div v-else-if="products.length > 0" class="text-center py-8">
            <p class="text-gray-500">Tüm sonuçlar gösteriliyor</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Additional styles if needed */
</style> 