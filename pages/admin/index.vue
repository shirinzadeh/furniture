<template>
  <div>
    <AdminLayout>
      <div class="mb-8">
        <h1 class="text-2xl font-bold mb-6">Admin Dashboard</h1>
        
        <!-- Database Management -->
        <AdminDatabaseSeeder />
      </div>
      
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-semibold text-gray-900">Dashboard</h1>
        
        <div class="flex items-center gap-4">
          <AdminClearCacheButton />
        </div>
      </div>
      
      <!-- Loading state -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div v-for="i in 3" :key="i" class="bg-white p-6 rounded-lg shadow">
          <div class="animate-pulse space-y-4">
            <div class="h-4 bg-gray-200 rounded w-1/4"></div>
            <div class="h-8 bg-gray-200 rounded w-1/2"></div>
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
            <h3 class="text-sm font-medium text-red-800">Error loading dashboard data</h3>
            <div class="mt-2 text-sm text-red-700">
              <p>{{ error }}</p>
            </div>
            <div class="mt-4">
              <button 
                @click="fetchDashboardData" 
                class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Dashboard content -->
      <div v-else>
        <!-- Stats cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-blue-100 text-blue-600">
                <Icon name="mdi:package-variant" class="h-6 w-6" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Total Products</p>
                <p class="text-2xl font-semibold text-gray-900">{{ stats.totalProducts }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-green-100 text-green-600">
                <Icon name="mdi:account-group" class="h-6 w-6" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Total Users</p>
                <p class="text-2xl font-semibold text-gray-900">{{ stats.totalUsers }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-purple-100 text-purple-600">
                <Icon name="mdi:tag-multiple" class="h-6 w-6" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Categories</p>
                <p class="text-2xl font-semibold text-gray-900">{{ stats.totalCategories }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Recent products -->
        <div class="bg-white shadow rounded-lg mb-8 grid overflow-x-auto scrollbar-hide">
          <div class="px-6 py-5 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Recent Products</h3>
          </div>
          
          <div class="grid overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Added
                  </th>
                  <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="product in recentProducts" :key="product.id">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center overflow-hidden">
                        <img v-if="product.images && product.images.length > 0" :src="product.images[0]" alt="" class="h-10 w-10 object-cover" />
                        <Icon v-else name="mdi:image-off" class="h-5 w-5 text-gray-400" />
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">{{ product.name }}</div>
                        <div class="text-sm text-gray-500">{{ product.slug }}</div>
                      </div>
                    </div>
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
                    <div class="text-sm text-gray-500">{{ formatDate(product.createdAt) }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <NuxtLink 
                      :to="`/admin/products/${product.id}`" 
                      class="text-gray-600 hover:text-gray-900"
                    >
                      <Icon name="mdi:pencil" class="h-5 w-5" />
                    </NuxtLink>
                  </td>
                </tr>
                <tr v-if="recentProducts.length === 0">
                  <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">
                    No products found
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="px-6 py-4 border-t border-gray-200">
            <NuxtLink 
              to="/admin/products" 
              class="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center"
            >
              View all products
              <Icon name="mdi:chevron-right" class="ml-1 h-5 w-5" />
            </NuxtLink>
          </div>
        </div>
        
        <!-- Quick links -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-5 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Quick Links</h3>
          </div>
          
          <div class="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <NuxtLink 
              to="/admin/products/create" 
              class="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <div class="p-2 rounded-full bg-gray-100">
                <Icon name="mdi:plus" class="h-5 w-5 text-gray-600" />
              </div>
              <span class="ml-3 text-sm font-medium text-gray-900">Add Product</span>
            </NuxtLink>
            
            <NuxtLink 
              to="/admin/categories" 
              class="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <div class="p-2 rounded-full bg-gray-100">
                <Icon name="mdi:tag-multiple" class="h-5 w-5 text-gray-600" />
              </div>
              <span class="ml-3 text-sm font-medium text-gray-900">Manage Categories</span>
            </NuxtLink>
            
            <NuxtLink 
              to="/admin/users" 
              class="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <div class="p-2 rounded-full bg-gray-100">
                <Icon name="mdi:account-group" class="h-5 w-5 text-gray-600" />
              </div>
              <span class="ml-3 text-sm font-medium text-gray-900">Manage Users</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </AdminLayout>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

definePageMeta({
  layout: 'admin'
})

// Types
interface Product {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  compareAtPrice?: number
  stock: number
  images?: string[]
  createdAt: string
  category?: {
    id: string
    name: string
  }
}

interface DashboardStats {
  totalProducts: number
  totalUsers: number
  totalCategories: number
}

interface ApiResponse {
  statusCode: number
  stats?: DashboardStats
  recentProducts?: Product[]
  [key: string]: any
}

// State
const loading = ref(true)
const error = ref<string | null>(null)
const stats = ref<DashboardStats>({
  totalProducts: 0,
  totalUsers: 0,
  totalCategories: 0
})
const recentProducts = ref<Product[]>([])

// Use Nuxt's useAsyncData to fetch dashboard data within the Nuxt lifecycle
const { data: dashboardData, pending, refresh } = await useAsyncData<ApiResponse>(
  'admin-dashboard',
  () => $fetch<ApiResponse>('/api/admin/dashboard'),
  {
    default: () => ({
      statusCode: 200,
      stats: {
        totalProducts: 0,
        totalUsers: 0,
        totalCategories: 0
      },
      recentProducts: []
    })
  }
)

// Update reactive refs when data changes
watch(dashboardData, (newData) => {
  if (newData) {
    stats.value = newData.stats || {
      totalProducts: 0,
      totalUsers: 0,
      totalCategories: 0
    }
    recentProducts.value = newData.recentProducts || []
  }
}, { immediate: true })

// Map pending to loading
watch(pending, (isPending) => {
  loading.value = isPending
}, { immediate: true })

// Handle errors
const fetchDashboardData = () => {
  error.value = null
  refresh()
}

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
}

// Load data on mount
  fetchDashboardData()
</script> 