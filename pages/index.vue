<script setup lang="ts">
import type { Product } from '~/types'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

// SEO Meta
useHead({
  title: 'MEBEL - Evinizi Yeniden Keşfedin',
  meta: [
    { name: 'description', content: 'Kaliteli mobilyalar ve dekorasyon ürünleri ile evinizi yeniden keşfedin. En uygun fiyatlarla yatak odası, oturma odası, mutfak ve ofis mobilyaları.' }
  ]
})

// Stores
const productsStore = useProductsStore()
const categoriesStore = useCategoriesStore()

// API composable
const api = useApi()

// Swiper modules
const swiperModules = [Autoplay, Navigation, Pagination]

// Initialize essential data immediately (non-blocking)
onMounted(async () => {
  // Prefetch critical resources
  api.prefetch('/products', { params: { featured: true, limit: 8 } })
  api.prefetch('/categories')
  
  // Load essential data in background
  Promise.all([
    productsStore.fetchFeaturedProducts(8),
    categoriesStore.fetchCategories()
  ]).catch(console.error)
})

// Lazy load winter flash sale products
const {
  data: winterFlashSaleProducts,
  pending: isLoadingWinterSale,
  error: winterSaleError,
  execute: executeWinterSale,
  triggerRef: winterSaleRef,
  refresh: refreshWinterSale
} = api.lazyAsyncData(
  'winter-flash-sale',
  () => productsStore.fetchSaleProducts(8),
  { 
    trigger: 'visible',
    threshold: 0.1,
    rootMargin: '100px',
    immediate: false
  }
)

// Lazy load bestseller products
const {
  data: bestsellerProducts,
  pending: isLoadingBestsellers,
  error: bestsellersError,
  execute: executeBestsellers,
  triggerRef: bestsellersRef,
  refresh: refreshBestsellers
} = api.lazyAsyncData(
  'bestsellers',
  () => productsStore.fetchBestsellerProducts(12), // More products for swiper
  { 
    trigger: 'visible',
    threshold: 0.1,
    rootMargin: '100px',
    immediate: false
  }
)

// Lazy load recommended products
const {
  data: recommendedProducts,
  pending: isLoadingRecommended,
  error: recommendedError,
  execute: executeRecommended,
  triggerRef: recommendedRef,
  refresh: refreshRecommended
} = api.lazyAsyncData(
  'recommended',
  () => productsStore.fetchRecommendedProducts('8'),
  { 
    trigger: 'visible',
    threshold: 0.1,
    rootMargin: '100px',
    immediate: false
  }
)

// Error message computed
const errorMessage = computed(() => productsStore.error || categoriesStore.error)

// Manual execution functions for retry
const retryWinterSale = () => {
  refreshWinterSale()
}

const retryBestsellers = () => {
  refreshBestsellers()
}

const retryRecommended = () => {
  refreshRecommended()
}

// Add to cart function
const addToCart = (productId: string) => {
  console.log('Sepete ekle:', productId)
}
</script>

<template>
  <div>
    <!-- Hero Banner - Always visible immediately -->
    <HeroBanner />
    
    <!-- Winter Flash Sale Section - Lazy loaded -->
    <section ref="winterSaleRef" class="py-16 bg-gradient-to-br from-red-50 via-orange-50 to-amber-50">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">❄️ KIŞ FLASH İNDİRİMLERİ</h2>
          <p class="text-xl text-gray-600">Kış indirimleri başladı! Sınırlı süre fırsatları kaçırmayın.</p>
        </div>
        
        <!-- Loading skeleton -->
        <div v-if="isLoadingWinterSale" class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div v-for="i in 8" :key="i" class="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
            <div class="h-48 bg-gray-200"></div>
            <div class="p-6 space-y-3">
              <div class="h-4 bg-gray-200 rounded w-3/4"></div>
              <div class="h-4 bg-gray-200 rounded w-1/2"></div>
              <div class="h-6 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        </div>
        
        <!-- Error state -->
        <div v-else-if="winterSaleError" class="text-center py-12">
          <div class="max-w-md mx-auto">
            <Icon name="ph:warning-circle" class="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p class="text-red-600 mb-6 text-lg">{{ winterSaleError.message }}</p>
            <UiButton @click="retryWinterSale" variant="danger" size="lg">
              Tekrar Dene
            </UiButton>
          </div>
        </div>
        
        <!-- Empty state -->
        <div v-else-if="winterFlashSaleProducts && winterFlashSaleProducts.length === 0" class="text-center py-12">
          <Icon name="ph:snowflake" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p class="text-gray-500 text-lg">Şu anda indirimli ürün bulunmamaktadır.</p>
        </div>
        
        <!-- Products grid -->
        <div v-else-if="winterFlashSaleProducts" class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
          <ProductCard
            v-for="product in winterFlashSaleProducts"
            :key="String(product._id)"
            :product="product as Product"
            show-sale-badge
            @add-to-cart="addToCart"
          />
        </div>
        
        <!-- View all button -->
        <div v-if="winterFlashSaleProducts && winterFlashSaleProducts.length > 0" class="text-center">
          <UiButton to="/winter-flash-sales" variant="primary" size="lg" rounded class="px-10">
            Tüm İndirimleri Gör
            <Icon name="ph:arrow-right" class="ml-2" />
          </UiButton>
        </div>
      </div>
    </section>
    
    <!-- Featured Categories - Load immediately -->
    <CategoriesFeatured
      :categories="categoriesStore.categories"
      :loading="categoriesStore.loading"
      :error="errorMessage"
    />
    
    <!-- Featured Products Section - Load immediately -->
    <section class="py-16 bg-white">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">⭐ Öne Çıkan Ürünler</h2>
          <p class="text-xl text-gray-600">En popüler ve kaliteli mobilyalarımız</p>
        </div>
        
        <!-- Loading skeleton -->
        <div v-if="productsStore.loading" class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div v-for="i in 8" :key="i" class="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse border">
            <div class="h-48 bg-gray-200"></div>
            <div class="p-6 space-y-3">
              <div class="h-4 bg-gray-200 rounded w-3/4"></div>
              <div class="h-4 bg-gray-200 rounded w-1/2"></div>
              <div class="h-6 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        </div>
        
        <!-- Error state -->
        <div v-else-if="errorMessage" class="text-center py-12">
          <div class="max-w-md mx-auto">
            <Icon name="ph:warning-circle" class="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <p class="text-amber-600 mb-6 text-lg">{{ errorMessage }}</p>
            <UiButton @click="productsStore.fetchFeaturedProducts(8)" variant="secondary" size="lg">
              Tekrar Dene
            </UiButton>
          </div>
        </div>
        
        <!-- Empty state -->
        <div v-else-if="productsStore.featuredProducts.length === 0" class="text-center py-12">
          <Icon name="ph:package" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p class="text-gray-500 text-lg">Henüz ürün bulunmamaktadır.</p>
        </div>
        
        <!-- Products grid -->
        <div v-else class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
          <ProductCard
            v-for="product in productsStore.featuredProducts"
            :key="String(product._id)"
            :product="product"
            @add-to-cart="addToCart"
          />
        </div>
        
        <!-- View all button -->
        <div v-if="productsStore.featuredProducts.length > 0" class="text-center">
          <UiButton to="/products" variant="secondary" size="lg" rounded class="px-10">
            Tüm Ürünleri Gör
            <Icon name="ph:arrow-right" class="ml-2" />
          </UiButton>
        </div>
      </div>
    </section>
    
    <!-- Services Section -->
    <section class="py-16 bg-gradient-to-br from-gray-50 to-amber-50">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center group">
            <div class="bg-white w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md group-hover:shadow-lg transition-shadow duration-300">
              <Icon name="mdi:truck-delivery" class="w-10 h-10 text-amber-600" />
            </div>
            <h3 class="text-lg sm:text-xl md:text-2xl font-bold mb-3 text-gray-900">Hızlı Teslimat</h3>
            <p class="text-gray-600 text-lg">Siparişleriniz en kısa sürede adresinize teslim edilir.</p>
          </div>
          
          <div class="text-center group">
            <div class="bg-white w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md group-hover:shadow-lg transition-shadow duration-300">
              <Icon name="mdi:credit-card" class="w-10 h-10 text-amber-600" />
            </div>
            <h3 class="text-lg sm:text-xl md:text-2xl font-bold mb-3 text-gray-900">Güvenli Ödeme</h3>
            <p class="text-gray-600 text-lg">Tüm ödemeleriniz güvenli bir şekilde gerçekleştirilir.</p>
          </div>
          
          <div class="text-center group">
            <div class="bg-white w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md group-hover:shadow-lg transition-shadow duration-300">
              <Icon name="mdi:headset" class="w-10 h-10 text-amber-600" />
            </div>
            <h3 class="text-lg sm:text-xl md:text-2xl font-bold mb-3 text-gray-900">7/24 Destek</h3>
            <p class="text-gray-600 text-lg">Sorularınız için müşteri hizmetlerimiz her zaman yanınızda.</p>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Recommended Products Section - Lazy loaded -->
    <section ref="recommendedRef" class="py-16 bg-gradient-to-br from-amber-50 to-orange-50">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">💡 Size Özel Öneriler</h2>
          <p class="text-xl text-gray-600">Seçimlerinize göre özenle seçilmiş ürünler</p>
        </div>
        
        <!-- Loading skeleton -->
        <div v-if="isLoadingRecommended" class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div v-for="i in 8" :key="i" class="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
            <div class="h-48 bg-gray-200"></div>
            <div class="p-6 space-y-3">
              <div class="h-4 bg-gray-200 rounded w-3/4"></div>
              <div class="h-4 bg-gray-200 rounded w-1/2"></div>
              <div class="h-6 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        </div>
        
        <!-- Error state -->
        <div v-else-if="recommendedError" class="text-center py-12">
          <div class="max-w-md mx-auto">
            <Icon name="ph:warning-circle" class="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <p class="text-amber-600 mb-6 text-lg">{{ recommendedError.message }}</p>
            <UiButton @click="retryRecommended" variant="primary" size="lg">
              Tekrar Dene
            </UiButton>
          </div>
        </div>
        
        <!-- Empty state -->
        <div v-else-if="recommendedProducts && recommendedProducts.length === 0" class="text-center py-12">
          <Icon name="ph:lightbulb" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p class="text-gray-500 text-lg">Şu anda önerilecek ürün bulunmamaktadır.</p>
        </div>
        
        <!-- Products grid -->
        <div v-else-if="recommendedProducts" class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <ProductCard
            v-for="product in recommendedProducts"
            :key="String(product._id)"
            :product="product as Product"
            @add-to-cart="addToCart"
          />
        </div>
      </div>
    </section>
    
    <!-- Season Bestsellers Section - Lazy loaded with Swiper -->
    <section ref="bestsellersRef" class="py-16 bg-white">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">🔥 SEZONUN ÇOK SATANLARI</h2>
          <p class="text-xl text-gray-600">Bu sezonun en çok tercih edilen ürünleri</p>
        </div>
        
        <!-- Loading skeleton -->
        <div v-if="isLoadingBestsellers" class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div v-for="i in 12" :key="i" class="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse border">
            <div class="h-48 bg-gray-200"></div>
            <div class="p-6 space-y-3">
              <div class="h-4 bg-gray-200 rounded w-3/4"></div>
              <div class="h-4 bg-gray-200 rounded w-1/2"></div>
              <div class="h-6 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        </div>
        
        <!-- Error state -->
        <div v-else-if="bestsellersError" class="text-center py-12">
          <div class="max-w-md mx-auto">
            <Icon name="ph:warning-circle" class="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p class="text-red-600 mb-6 text-lg">{{ bestsellersError.message }}</p>
            <UiButton @click="retryBestsellers" variant="danger" size="lg">
              Tekrar Dene
            </UiButton>
          </div>
        </div>
        
        <!-- Empty state -->
        <div v-else-if="bestsellerProducts && bestsellerProducts.length === 0" class="text-center py-12">
          <Icon name="ph:fire" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p class="text-gray-500 text-lg">Şu anda çok satan ürün bulunmamaktadır.</p>
        </div>
        
        <!-- Products Swiper -->
        <div v-else-if="bestsellerProducts" class="relative">
          <Swiper
            :modules="swiperModules"
            :slides-per-view="1"
            :space-between="24"
            :loop="bestsellerProducts.length > 4"
            :autoplay="{ delay: 4000, disableOnInteraction: false }"
            :navigation="true"
            :pagination="{ clickable: true }"
            :breakpoints="{
              640: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 4 }
            }"
            class="bestsellers-swiper"
          >
            <SwiperSlide v-for="product in bestsellerProducts" :key="String(product._id)">
              <ProductCard
                :product="product as Product"
                @add-to-cart="addToCart"
              />
            </SwiperSlide>
          </Swiper>
        </div>
        
        <!-- View all button -->
        <div v-if="bestsellerProducts && bestsellerProducts.length > 0" class="text-center mt-12">
          <UiButton to="/bestsellers" variant="primary" size="lg" rounded class="px-10">
            Tüm Çok Satanları Gör
            <Icon name="ph:arrow-right" class="ml-2" />
          </UiButton>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Smooth loading animations */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}

/* Intersection observer trigger styles */
section[ref] {
  min-height: 100px;
}

/* Performance optimizations */
.container {
  contain: layout style;
}

.grid {
  contain: layout;
}

/* Smooth transitions */
.transition-colors {
  transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
}

/* Bestsellers Swiper Styles */
.bestsellers-swiper {
  padding: 0 0 60px 0;
  margin: 0 -12px;
}

:deep(.bestsellers-swiper .swiper-slide) {
  padding: 0 12px;
  height: auto;
}

/* Custom styles for bestsellers swiper navigation */
:deep(.bestsellers-swiper .swiper-button-next),
:deep(.bestsellers-swiper .swiper-button-prev) {
  color: #b45309;
  background: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid #f3f4f6;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  margin-top: -25px;
}

:deep(.bestsellers-swiper .swiper-button-next:hover),
:deep(.bestsellers-swiper .swiper-button-prev:hover) {
  background: #b45309;
  color: white;
  border-color: #b45309;
  transform: scale(1.1);
}

:deep(.bestsellers-swiper .swiper-button-next:after),
:deep(.bestsellers-swiper .swiper-button-prev:after) {
  font-size: 18px;
  font-weight: 900;
}

/* Custom styles for bestsellers swiper pagination */
:deep(.bestsellers-swiper .swiper-pagination) {
  bottom: 20px;
}

:deep(.bestsellers-swiper .swiper-pagination-bullet) {
  width: 10px;
  height: 10px;
  background: #d1d5db;
  opacity: 1;
  margin: 0 4px;
}

:deep(.bestsellers-swiper .swiper-pagination-bullet-active) {
  background: #b45309;
  transform: scale(1.2);
}

/* Hide navigation on mobile */
@media (max-width: 768px) {
  :deep(.bestsellers-swiper .swiper-button-next),
  :deep(.bestsellers-swiper .swiper-button-prev) {
    display: none;
  }
}
</style>

