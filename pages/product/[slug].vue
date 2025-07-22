<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCartStore, useProductsStore } from '~/stores'
import type { Product } from '~/types'

const route = useRoute()
// Cast the route params to any to avoid TypeScript errors
const params = route.params as any
const slug = typeof params.slug === 'string' ? params.slug : 
             Array.isArray(params.slug) && params.slug.length > 0 ? params.slug[0] : ''
const product = ref<Product | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)
const selectedQuantity = ref(1)
const selectedImage = ref(0)
const cartStore = useCartStore()
const productsStore = useProductsStore()

// Retry mechanism
const retryCount = ref(0)
const maxRetries = 3
const retryDelay = 1000 // 1 second

// Fetch product data with timeout and retry
async function fetchProduct() {
  if (retryCount.value > 0) {
    console.log(`Retrying product fetch (attempt ${retryCount.value} of ${maxRetries})`)
  }
  
  try {
    isLoading.value = true
    error.value = null
    
    // Check if we already have the product in the store
    const cachedProduct = productsStore.getProductBySlug(slug as string)
    if (cachedProduct) {
      console.log('Using cached product data')
      product.value = cachedProduct
      isLoading.value = false
      return
    }
    
    // Set up timeout for fetch
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 5000) // 5 second timeout
    })
    
    // Actual fetch request
    const fetchPromise = $fetch<Product>(`/api/products/${slug}`)
    
    // Race between fetch and timeout
    product.value = await Promise.race([fetchPromise, timeoutPromise])
    
    // Prefetch related products in the background
    if (product.value?.category?.id) { 
      const categoryId = product.value.category.id
      setTimeout(() => {
        productsStore.fetchProducts({ 
          categoryId, 
          limit: 4,
          page: 1
        })
      }, 500)
    }
    
  } catch (err: any) {
    console.error('Error fetching product:', err)
    
    // Handle timeout specifically
    if (err.message === 'Request timeout') {
      console.log('Product fetch timed out')
      error.value = 'Ürün yüklenirken zaman aşımı oluştu. Lütfen tekrar deneyin.'
    } else {
      error.value = 'Ürün yüklenirken bir hata oluştu.'
    }
    
    // Retry logic
    if (retryCount.value < maxRetries) {
      retryCount.value++
      setTimeout(() => {
        fetchProduct()
      }, retryDelay * retryCount.value) // Exponential backoff
      return
    }
    
    // After all retries, check if we're in development mode
    if (process.dev) {
      // In development, create a fallback product for testing UI
      product.value = {
        id: '1',
        name: 'Sample Product (Fallback)',
        slug: slug as string,
        description: 'This is a fallback product for development purposes when the API is unavailable.',
        price: 1299,
        salePrice: 999,
        images: ['/images/placeholder.jpg'],
        inStock: true,
        categoryId: '1',
        category: {
          id: '1',
          name: 'Sample Category',
          slug: 'sample-category',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      error.value = null
    }
  } finally {
    isLoading.value = false
  }
}

// Add to cart with error handling
function addToCart() {
  if (!product.value) return
  
  try {
    cartStore.addItem(product.value, selectedQuantity.value)
    
    // Show success notification
    const { cartAdded } = useToast()
    cartAdded(product.value.name, selectedQuantity.value)
    
    console.log(`Added ${product.value.name} to cart`)
  } catch (err) {
    console.error('Error adding to cart:', err)
    
    // Show error notification
    const { cartError } = useToast()
    cartError('Ürün sepete eklenirken bir hata oluştu')
  }
}

// Computed properties
const discountPercentage = computed(() => {
  if (product.value?.salePrice && product.value.price > product.value.salePrice) {
    return Math.round((1 - product.value.salePrice / product.value.price) * 100)
  }
  return 0
})

const formattedPrice = computed(() => {
  if (!product.value) return ''
  return product.value.price.toLocaleString('tr-TR')
})

const formattedSalePrice = computed(() => {
  if (!product.value?.salePrice) return ''
  return product.value.salePrice.toLocaleString('tr-TR')
})

// Fetch data on mount
onMounted(() => {
  fetchProduct()
})

// Update meta tags
useHead(() => ({
  title: product.value?.name || 'Ürün Detayları',
  meta: [
    { 
      name: 'description', 
      content: product.value?.description?.substring(0, 160) || 'Ürün detay sayfası' 
    }
  ],
  link: [
    {
      rel: 'canonical',
      href: `${useRuntimeConfig().public.siteUrl}/product/${slug}`
    }
  ]
}))
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Breadcrumbs -->
    <div class="mb-6">
      <ul class="flex text-sm text-gray-600">
        <li class="flex items-center">
          <NuxtLink to="/" class="hover:text-gray-900">Ana Sayfa</NuxtLink>
          <span class="mx-2">/</span>
        </li>
        <li v-if="product && product.category" class="flex items-center">
          <NuxtLink 
            :to="`/categories/${product.category.slug}`" 
            class="hover:text-gray-900"
          >
            {{ product.category.name }}
          </NuxtLink>
          <span class="mx-2">/</span>
        </li>
        <li v-if="product" class="text-gray-900 font-medium truncate">
          {{ product.name }}
        </li>
      </ul>
    </div>
    
    <!-- Loading state -->
    <div v-if="isLoading" class="flex flex-col md:flex-row gap-8">
      <div class="w-full md:w-1/2 bg-gray-200 animate-pulse h-96 rounded-lg"></div>
      <div class="w-full md:w-1/2">
        <div class="h-8 bg-gray-200 animate-pulse rounded mb-4 w-3/4"></div>
        <div class="h-4 bg-gray-200 animate-pulse rounded mb-2 w-1/2"></div>
        <div class="h-4 bg-gray-200 animate-pulse rounded mb-2 w-1/3"></div>
        <div class="h-4 bg-gray-200 animate-pulse rounded mb-6 w-2/3"></div>
        <div class="h-6 bg-gray-200 animate-pulse rounded mb-6 w-1/4"></div>
        <div class="h-12 bg-gray-200 animate-pulse rounded mb-4 w-full"></div>
      </div>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="bg-red-100 p-4 rounded-lg text-red-700 mb-6">
      <div class="flex items-center mb-2">
        <Icon name="mdi:alert-circle" size="24" class="mr-2" />
        <h2 class="font-bold">Bir hata oluştu</h2>
      </div>
      <p>{{ error }}</p>
      <button 
        @click="retryCount = 0; fetchProduct()"
        class="mt-4 bg-red-700 text-white px-4 py-2 rounded-md hover:bg-red-800 transition-colors"
      >
        Tekrar Dene
      </button>
    </div>
    
    <!-- Product details -->
    <div v-else-if="product" class="flex flex-col md:flex-row gap-8">
      <!-- Product images -->
      <div class="w-full md:w-1/2">
        <div class="relative rounded-lg overflow-hidden mb-4 h-96">
          <NuxtImg
            :src="product.images[selectedImage] || '/images/placeholder.jpg'"
            :alt="product.name"
            class="w-full h-full object-contain"
            format="webp"
            quality="90"
            loading="eager"
            placeholder
          />
          <div 
            v-if="discountPercentage > 0" 
            class="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold"
          >
            {{ discountPercentage }}% İndirim
          </div>
        </div>
        
        <!-- Thumbnail gallery -->
        <div v-if="product.images.length > 1" class="flex gap-2 overflow-x-auto pb-2">
          <button 
            v-for="(image, index) in product.images" 
            :key="index"
            @click="selectedImage = index"
            class="w-20 h-20 rounded-md overflow-hidden border-2"
            :class="selectedImage === index ? 'border-gray-800' : 'border-gray-200'"
          >
            <NuxtImg
              :src="image"
              :alt="`${product.name} - Image ${index + 1}`"
              class="w-full h-full object-cover"
              format="webp"
              quality="80"
              loading="lazy"
            />
          </button>
        </div>
      </div>
      
      <!-- Product info -->
      <div class="w-full md:w-1/2">
        <h1 class="text-3xl font-bold mb-4">{{ product.name }}</h1>
        
        <div class="mb-6">
          <div class="flex items-center mb-2">
            <div v-if="product.salePrice" class="flex items-center">
              <span class="text-2xl font-bold text-red-500">{{ formattedSalePrice }} TL</span>
              <span class="ml-2 text-gray-500 line-through">{{ formattedPrice }} TL</span>
            </div>
            <div v-else>
              <span class="text-2xl font-bold">{{ formattedPrice }} TL</span>
            </div>
          </div>
          
          <div class="text-sm text-gray-600">
            <span v-if="product.inStock" class="text-green-600 font-medium">Stokta Var</span>
            <span v-else class="text-red-600 font-medium">Stokta Yok</span>
          </div>
        </div>
        
        <div class="mb-6">
          <p class="text-gray-700">{{ product.description }}</p>
        </div>
        
        <!-- Quantity selector -->
        <div class="mb-6">
          <label for="quantity" class="block text-sm font-medium text-gray-700 mb-2">Adet</label>
          <div class="flex items-center">
            <button 
              @click="selectedQuantity = Math.max(1, selectedQuantity - 1)"
              class="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-l-md"
              :disabled="selectedQuantity <= 1"
              aria-label="Azalt"
            >
              <Icon name="mdi:minus" size="20" />
            </button>
            <input 
              v-model="selectedQuantity"
              type="number" 
              min="1"
              id="quantity"
              class="w-16 h-10 border-y border-gray-300 text-center focus:outline-none"
              aria-label="Ürün adedi"
            />
            <button 
              @click="selectedQuantity++"
              class="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-r-md"
              aria-label="Arttır"
            >
              <Icon name="mdi:plus" size="20" />
            </button>
          </div>
        </div>
        
        <!-- Add to cart button -->
        <button 
          @click="addToCart"
          class="w-full bg-gray-800 text-white py-3 rounded-md font-medium hover:bg-gray-700 transition-colors flex items-center justify-center"
          :disabled="!product.inStock"
          :class="{'opacity-50 cursor-not-allowed': !product.inStock}"
        >
          <Icon name="mdi:cart" size="20" class="mr-2" />
          {{ product.inStock ? 'Sepete Ekle' : 'Stokta Yok' }}
        </button>
        
        <!-- Payment options -->
        <div class="mt-8 border-t border-gray-200 pt-6">
          <h3 class="text-lg font-medium mb-4">Ödeme Seçenekleri</h3>
          <div class="space-y-2 text-sm text-gray-600">
            <div class="flex items-center">
              <Icon name="mdi:credit-card" size="20" class="mr-2 text-gray-500" />
              <span>Peşin Fiyatına 9 Taksit</span>
            </div>
            <div class="flex items-center">
              <Icon name="mdi:calendar-clock" size="20" class="mr-2 text-gray-500" />
              <span>3 Ay Ödeme Erteleme</span>
            </div>
            <div class="flex items-center">
              <Icon name="mdi:bank" size="20" class="mr-2 text-gray-500" />
              <span>36 Aya Varan Alışveriş Kredisi</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Product not found -->
    <div v-else class="text-center py-12">
      <h2 class="text-2xl font-bold mb-2">Ürün Bulunamadı</h2>
      <p class="text-gray-600 mb-6">Aradığınız ürün bulunamadı veya kaldırılmış olabilir.</p>
      <NuxtLink 
        to="/categories" 
        class="inline-block bg-gray-800 text-white px-6 py-3 rounded-md font-medium hover:bg-gray-700 transition-colors"
      >
        Tüm Kategorilere Dön
      </NuxtLink>
    </div>
  </div>
</template> 