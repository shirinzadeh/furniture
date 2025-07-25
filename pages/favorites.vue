<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-6 sm:py-8">
      <!-- Page Header -->
      <div class="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Favorilerim</h1>
            <p class="text-gray-600 text-sm sm:text-base">
              Beğendiğiniz ürünleri burada bulabilirsiniz
            </p>
          </div>
          <div class="text-right">
            <div class="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-amber-600">
              {{ favoritesStore.favoriteCount }}
            </div>
            <div class="text-xs sm:text-sm text-gray-500">favori ürün</div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="favoritesStore.loading && favoritesStore.favorites.length === 0" class="text-center py-8 sm:py-12">
        <Icon name="mdi:loading" size="40" class="sm:w-12 sm:h-12 mx-auto text-gray-400 animate-spin mb-3 sm:mb-4" />
        <p class="text-gray-600 text-sm sm:text-base">Favoriler yükleniyor...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="favoritesStore.error" class="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
        <div class="flex items-center">
          <Icon name="mdi:alert-circle" class="h-4 w-4 sm:h-5 sm:w-5 text-red-400 mr-2 sm:mr-3" />
          <div>
            <h3 class="text-xs sm:text-sm font-medium text-red-800">Favoriler yüklenirken hata oluştu</h3>
            <div class="mt-1 sm:mt-2 text-xs sm:text-sm text-red-700">
              {{ favoritesStore.error }}
            </div>
          </div>
        </div>
        <div class="mt-3 sm:mt-4">
          <button
            @click="loadFavorites"
            class="bg-red-100 hover:bg-red-200 text-red-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="favoritesStore.isEmpty && !favoritesStore.loading" class="text-center py-12 sm:py-16">
        <div class="bg-white rounded-lg shadow-sm p-8 sm:p-12">
          <Icon name="mdi:heart-outline" size="64" class="sm:h-20 sm:w-20 mx-auto text-gray-300 mb-4 sm:mb-6" />
          <h2 class="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Henüz favori ürününüz yok</h2>
          <p class="text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">
            Beğendiğiniz ürünleri favorilere ekleyerek daha sonra kolayca bulabilirsiniz
          </p>
          <NuxtLink 
            to="/products"
            class="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium text-sm sm:text-base"
          >
            <Icon name="mdi:shopping" size="16" class="sm:w-5 sm:h-5 mr-2" />
            Ürünleri İncele
          </NuxtLink>
        </div>
      </div>

      <!-- Favorites Grid -->
      <div v-else-if="favoritesStore.hasFavorites">
        <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          <div 
            v-for="favorite in favoritesStore.favorites" 
            :key="favorite.id"
            class="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
          >
            <!-- Remove from favorites button - always visible on mobile -->
            <button
              @click="removeFavorite(favorite.productId)"
              class="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 w-7 h-7 sm:w-8 sm:h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200"
              :disabled="favoritesStore.loading"
            >
              <Icon name="mdi:close" size="14" class="sm:w-4 sm:h-4" />
            </button>

            <!-- Product Link -->
            <NuxtLink :to="`/product/${favorite.product.slug}`" class="block">
              <!-- Product Image -->
              <div class="aspect-[4/3] overflow-hidden bg-gray-100">
                <NuxtImg
                  :src="favorite.product.images[0] || '/images/placeholder.jpg'"
                  :alt="favorite.product.name"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  format="webp"
                  quality="85"
                  loading="lazy"
                />
              </div>

              <!-- Product Info -->
              <div class="p-3 sm:p-4">
                <!-- Category -->
                <div class="mb-1 sm:mb-2">
                  <span v-if="favorite.product.category" class="text-[10px] sm:text-xs uppercase tracking-wide text-gray-500 font-semibold">
                    {{ favorite.product.category.name }}
                  </span>
                </div>

                <!-- Product Name -->
                <h3 class="text-sm sm:text-base font-medium text-gray-900 mb-1 sm:mb-2 line-clamp-2 group-hover:text-amber-700 transition-colors">
                  {{ favorite.product.name }}
                </h3>

                <!-- Price -->
                <div class="flex items-baseline space-x-1 sm:space-x-2">
                  <span 
                    v-if="favorite.product.salePrice" 
                    class="text-sm sm:text-base md:text-lg font-bold text-red-600"
                  >
                    {{ formatPrice(favorite.product.salePrice) }} TL
                  </span>
                  <span 
                    v-else 
                    class="text-sm sm:text-base md:text-lg font-bold text-gray-900"
                  >
                    {{ formatPrice(favorite.product.price) }} TL
                  </span>
                  <span 
                    v-if="favorite.product.salePrice" 
                    class="text-xs sm:text-sm text-gray-500 line-through"
                  >
                    {{ formatPrice(favorite.product.price) }} TL
                  </span>
                </div>

                <!-- Added date -->
                <div class="mt-1 sm:mt-2 text-[10px] sm:text-xs text-gray-400">
                  {{ formatDate(favorite.addedAt) }} tarihinde eklendi
                </div>
              </div>
            </NuxtLink>

            <!-- Add to Cart Button -->
            <div class="p-3 sm:p-4 pt-0">
              <button
                @click="addToCart(favorite.product, favorite.productId)"
                :disabled="loadingStates[favorite.productId]"
                :class="[
                  'w-full py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xs sm:text-sm',
                  cartStore.isInCart(favorite.productId)
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-amber-600 hover:bg-amber-700 text-white'
                ]"
              >
                <Icon v-if="loadingStates[favorite.productId]" name="mdi:loading" size="14" class="sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
                <Icon 
                  v-else 
                  :name="cartStore.isInCart(favorite.productId) ? 'mdi:check-circle' : 'mdi:cart-plus'" 
                  size="14" 
                  class="sm:w-4 sm:h-4 mr-1 sm:mr-2" 
                />
                <span class="truncate">
                  {{
                    loadingStates[favorite.productId] 
                      ? 'Ekleniyor...' 
                      : cartStore.isInCart(favorite.productId) 
                        ? `Sepette (${cartStore.getItemQuantity(favorite.productId)})` 
                        : 'Sepete Ekle'
                  }}
                </span>
              </button>
            </div>
          </div>
        </div>

        <!-- Load More Button (if pagination is needed) -->
        <div v-if="hasMoreFavorites" class="text-center mt-8 sm:mt-12">
          <button
            @click="loadMoreFavorites"
            :disabled="favoritesStore.loading"
            class="px-4 sm:px-6 py-2 sm:py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50 text-sm sm:text-base"
          >
            <Icon v-if="favoritesStore.loading" name="mdi:loading" size="16" class="mr-2 animate-spin" />
            {{ favoritesStore.loading ? 'Yükleniyor...' : 'Daha Fazla Göster' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCartStore } from '~/stores'
import useFavoritesStore from '~/stores/favorites'
import { useToast } from '~/composables/useToast'
import type { Product } from '~/types'

// Define page meta
definePageMeta({
  middleware: 'auth',
  title: 'Favorilerim'
})

// Initialize stores
const cartStore = useCartStore()
const favoritesStore = useFavoritesStore()
const { success, error: toastError } = useToast()

// Component state
const hasMoreFavorites = ref(false) // Will be used for pagination if needed
const loadingStates = ref<Record<string, boolean>>({})

// Load favorites
const loadFavorites = async () => {
  try {
    await favoritesStore.loadFavorites()
  } catch (error) {
    console.error('Failed to load favorites:', error)
  }
}

// Load more favorites (pagination)
const loadMoreFavorites = async () => {
  // Implementation for pagination if needed
  console.log('Load more favorites')
}

// Remove from favorites
const removeFavorite = async (productId: string) => {
  try {
    const removed = await favoritesStore.toggleFavorite(productId)
    if (!removed) {
      success('Favorilerden Çıkarıldı', 'Ürün favorilerinizden kaldırıldı')
    }
  } catch (error: any) {
    toastError('Hata', error.message || 'Ürün favorilerden çıkarılırken hata oluştu')
  }
}

// Add to cart
const addToCart = async (product: Product, productId: string) => {
  loadingStates.value[productId] = true
  
  try {
    await cartStore.addToCart(product, 1)
    success('Sepete Eklendi', `${product.name} sepetinize eklendi`)
  } catch (error: any) {
    toastError('Hata', error.message || 'Ürün sepete eklenirken hata oluştu')
  } finally {
    loadingStates.value[productId] = false
  }
}

// Format price
const formatPrice = (price: number) => {
  return price.toLocaleString('tr-TR')
}

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Meta tags
useHead({
  title: 'Favorilerim - MEBEL',
  meta: [
    { name: 'description', content: 'Favori ürünlerinizi görüntüleyin ve yönetin' }
  ]
})

// Initialize data on mount
onMounted(async () => {
  await favoritesStore.initFavorites()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 