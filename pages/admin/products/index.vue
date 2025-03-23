<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold text-gray-900">Products</h1>
      <NuxtLink 
        to="/admin/products/create" 
        class="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 flex items-center"
      >
        <Icon name="mdi:plus" class="mr-2" />
        Add Product
      </NuxtLink>
    </div>

    <!-- Search and filters -->
    <div class="bg-white p-4 rounded-lg shadow mb-6">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <label for="search" class="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon name="mdi:magnify" class="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="search"
              v-model="filters.search"
              type="text"
              placeholder="Search products..."
              class="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
              @keyup.enter="handleFilterChange"
            />
          </div>
        </div>
        <div class="w-full md:w-64">
          <label for="category" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            id="category"
            v-model="filters.categoryId"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
          >
            <option value="">All Categories</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>
        <div class="w-full md:w-48">
          <label for="sort" class="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
          <select
            id="sort"
            v-model="filters.sort"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
          >
            <option value="name:asc">Name (A-Z)</option>
            <option value="name:desc">Name (Z-A)</option>
            <option value="price:asc">Price (Low-High)</option>
            <option value="price:desc">Price (High-Low)</option>
            <option value="createdAt:desc">Newest First</option>
            <option value="createdAt:asc">Oldest First</option>
          </select>
        </div>
        <div class="flex items-end">
          <button
            @click="handleFilterChange"
            class="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 flex items-center"
          >
            <Icon name="mdi:filter" class="mr-2" />
            Apply Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Initial Loading state -->
    <div v-if="initialLoading" class="bg-white p-6 rounded-lg shadow mb-6">
      <div class="animate-pulse flex space-x-4">
        <div class="flex-1 space-y-4 py-1">
          <div class="h-4 bg-gray-200 rounded w-3/4"></div>
          <div class="space-y-2">
            <div class="h-4 bg-gray-200 rounded"></div>
            <div class="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="bg-red-50 p-4 rounded-md mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <Icon name="mdi:alert-circle" class="h-5 w-5 text-red-400" />
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error loading products</h3>
          <div class="mt-2 text-sm text-red-700">
            <p>{{ error }}</p>
          </div>
          <div class="mt-4">
            <button 
              @click="resetAndFetch" 
              class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="products.length === 0" class="bg-white p-12 rounded-lg shadow text-center mb-6">
      <Icon name="mdi:package-variant" class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-sm font-medium text-gray-900">No products</h3>
      <p class="mt-1 text-sm text-gray-500">Get started by creating a new product.</p>
      <div class="mt-6">
        <NuxtLink 
          to="/admin/products/create" 
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          <Icon name="mdi:plus" class="-ml-1 mr-2 h-5 w-5" />
          New Product
        </NuxtLink>
      </div>
    </div>

    <!-- Products table -->
    <div v-else ref="productTableRef" class="bg-white shadow rounded-lg mb-6 overflow-hidden">
      <div class="grid overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="product in products" :key="product.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center overflow-hidden">
                  <img v-if="product.images && product.images.length > 0" :src="product.images[0]" alt="" class="h-10 w-10 object-cover" />
                  <Icon v-else name="mdi:image-off" class="h-5 w-5 text-gray-400" />
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ product.name }}</div>
                <div class="text-sm text-gray-500">{{ product.slug }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">{{ product.category?.name || 'Uncategorized' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${{ product.price.toFixed(2) }}</div>
                <div v-if="product.compareAtPrice" class="text-sm text-gray-500 line-through">
                  ${{ product.compareAtPrice.toFixed(2) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="{
                    'bg-green-100 text-green-800': product.stock > 10,
                    'bg-yellow-100 text-yellow-800': product.stock > 0 && product.stock <= 10,
                    'bg-red-100 text-red-800': !product.inStock || product.stock === 0
                  }"
                >
                  {{ (product.inStock && product.stock > 0) ? product.stock : 'Out of Stock' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <NuxtLink 
                  :to="`/admin/products/${product.id}`" 
                  class="text-gray-600 hover:text-gray-900 mr-3"
                >
                  <Icon name="mdi:pencil" class="h-5 w-5" />
                </NuxtLink>
                <button 
                  @click="confirmDelete(product)" 
                  class="text-red-600 hover:text-red-900"
                >
                  <Icon name="mdi:delete" class="h-5 w-5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Loading indicator for infinite scroll -->
      <div v-if="loadingMore && hasMorePages" class="p-4 flex justify-center">
        <div class="flex items-center space-x-2">
          <div class="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-900"></div>
          <span class="text-sm text-gray-500">Loading more products...</span>
        </div>
      </div>

      <!-- End of results message -->
      <div v-if="!hasMorePages && products.length > 0" class="p-4 text-center text-sm text-gray-500">
        End of results
      </div>
    </div>

    <!-- Scroll observer element -->
    <div ref="observerRef" class="h-4 w-full"></div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <div class="sm:flex sm:items-start">
          <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <Icon name="mdi:alert" class="h-6 w-6 text-red-600" />
          </div>
          <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 class="text-lg leading-6 font-medium text-gray-900">Delete Product</h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500">
                Are you sure you want to delete the product "{{ productToDelete?.name }}"? This action cannot be undone.
              </p>
            </div>
          </div>
        </div>
        <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <button 
            type="button" 
            @click="deleteProduct" 
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
            :disabled="formSubmitting"
          >
            <span v-if="formSubmitting" class="flex items-center">
              <Icon name="mdi:loading" class="animate-spin -ml-1 mr-2 h-4 w-4" />
              Deleting...
            </span>
            <span v-else>Delete</span>
          </button>
          <button 
            type="button" 
            @click="showDeleteModal = false" 
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:w-auto sm:text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed, nextTick, watch } from 'vue'
import { useToast } from '~/composables/useToast'

definePageMeta({
  layout: 'admin'
})

// Toast
const toast = useToast()

// Types
interface Product {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  compareAtPrice?: number
  salePrice?: number
  stock: number
  inStock: boolean
  images?: string[]
  category?: {
    id: string
    name: string
  }
}

interface Category {
  id: string
  name: string
}

interface Pagination {
  total: number
  page: number
  limit: number
  pages: number
}

interface ApiResponse {
  statusCode: number
  products?: Product[]
  pagination?: Pagination
  categories?: Category[]
  [key: string]: any
}

// DOM refs
const productTableRef = ref<HTMLElement | null>(null)
const observerRef = ref<HTMLElement | null>(null)

// State
const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const initialLoading = ref(true)
const loadingMore = ref(false)
const error = ref<string | null>(null)
const showDeleteModal = ref(false)
const formSubmitting = ref(false)
const productToDelete = ref<Product | null>(null)
const currentPage = ref(1)
const totalPages = ref(1)
const totalProducts = ref(0)
const limit = ref(20)
const hasMorePages = ref(false)

// Filters
const filters = reactive({
  search: '',
  categoryId: '',
  sort: 'createdAt:desc'
})

// Observer for infinite scroll
let observer: IntersectionObserver | null = null

// Fetch categories for filter dropdown
const fetchCategories = async () => {
  try {
    // Use useAsyncData to ensure proper Nuxt lifecycle
    const { data } = await useAsyncData<ApiResponse>(
      'admin-categories',
      () => $fetch<ApiResponse>('/api/admin/categories')
    )
    
    if (data.value) {
      categories.value = data.value.categories || []
    }
  } catch (err: any) {
    console.error('Error fetching categories:', err)
  }
}

// Apply filters and reset products list
const handleFilterChange = () => {
  resetAndFetch()
}

// Reset to first page and fetch products
const resetAndFetch = () => {
  products.value = []
  currentPage.value = 1
  fetchProducts(true)
}

// Fetch products with filters and pagination
const fetchProducts = async (isInitialFetch = false) => {
  if (isInitialFetch) {
    initialLoading.value = true
  } else {
    loadingMore.value = true
  }
  
  error.value = null
  
  try {
    // Build query params
    const queryParams = new URLSearchParams()
    queryParams.append('page', currentPage.value.toString())
    queryParams.append('limit', limit.value.toString())
    
    if (filters.search) {
      queryParams.append('search', filters.search)
    }
    
    if (filters.categoryId) {
      queryParams.append('categoryId', filters.categoryId)
    }
    
    if (filters.sort) {
      queryParams.append('sort', filters.sort)
    }
    
    // Use useAsyncData to ensure proper Nuxt lifecycle
    const { data } = await useAsyncData<ApiResponse>(
      `admin-products-${queryParams.toString()}`,
      () => $fetch<ApiResponse>(`/api/admin/products?${queryParams.toString()}`)
    )
    
    if (!data.value) return
    
    // For initial fetch replace products, for infinite scroll append
    if (isInitialFetch) {
      products.value = data.value.products || []
    } else {
      products.value = [...products.value, ...(data.value.products || [])]
    }
    
    // Update pagination data
    if (data.value.pagination) {
      totalPages.value = data.value.pagination.pages
      totalProducts.value = data.value.pagination.total
      hasMorePages.value = currentPage.value < totalPages.value
    }
  } catch (err: any) {
    console.error('Error fetching products:', err)
    error.value = err.message || 'Failed to load products'
  } finally {
    initialLoading.value = false
    loadingMore.value = false
  }
}

// Setup infinite scrolling with Intersection Observer
const setupInfiniteScroll = () => {
  if (typeof window === 'undefined' || !window.IntersectionObserver) return
  
  // Cleanup previous observer if it exists
  if (observer) {
    observer.disconnect()
  }
  
  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && hasMorePages.value && !loadingMore.value) {
      // Load more products
      currentPage.value++
      fetchProducts()
    }
  }, {
    rootMargin: '200px', // Trigger before user reaches bottom
    threshold: 0.1
  })
  
  if (observerRef.value) {
    observer.observe(observerRef.value)
  }
}

// Confirm delete
const confirmDelete = (product: Product) => {
  productToDelete.value = product
  showDeleteModal.value = true
}

// Delete product
const deleteProduct = async () => {
  if (!productToDelete.value) return
  
  formSubmitting.value = true
  
  try {
    await $fetch(`/api/admin/products/${productToDelete.value.id}`, {
      method: 'DELETE'
    })
    
    // Remove product from local list
    products.value = products.value.filter(p => p.id !== productToDelete.value?.id)
    
    showDeleteModal.value = false
    productToDelete.value = null
    
    toast.showToast({ 
      message: 'Product deleted successfully', 
      type: 'success' 
    })
  } catch (err: any) {
    console.error('Error deleting product:', err)
    toast.showToast({ 
      message: err.data?.message || 'Failed to delete product', 
      type: 'error' 
    })
  } finally {
    formSubmitting.value = false
  }
}

// Setup observers
onMounted(() => {
  fetchCategories()
  fetchProducts(true)
  
  // Setup infinite scroll after initial data is loaded
  nextTick(() => {
    setupInfiniteScroll()
  })
})

// Cleanup observers
onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})

// Watch for filter changes to reset the observer
watch([initialLoading], () => {
  if (!initialLoading.value) {
    // Update observer after data loaded
    nextTick(() => {
      setupInfiniteScroll()
    })
  }
})
</script>

<style>
/* Add subtle fade animations for better UX */
.product-enter-active,
.product-leave-active {
  transition: all 0.3s ease;
}
.product-enter-from,
.product-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style> 