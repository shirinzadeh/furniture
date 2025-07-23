<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import type { PropType } from 'vue'
import type { Product } from '~/types'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import ProductCard from '~/components/product/ProductCard.vue'
import Button from '~/components/ui/UiButton.vue'

// Props from parent component
const props = defineProps({
  externalProducts: {
    type: Array as () => Product[],
    default: () => []
  },
  externalLoading: {
    type: Boolean,
    default: false
  },
  externalError: {
    type: [String, null] as PropType<string | null>,
    default: null
  },
  viewAllLink: {
    type: String,
    default: '/products'
  },
  viewAllText: {
    type: String,
    default: 'Tüm Önerilen Ürünleri Gör'
  }
})

// Pinia store for products
const productsStore = useProductsStore()

// State for recommended products
const recommendedProducts = ref<Product[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)
const retryCount = ref(0)
const maxRetries = 3

// Swiper configuration
const swiperOptions = {
  modules: [Navigation, Pagination, Autoplay],
  slidesPerView: 1,
  spaceBetween: 20,
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
  },
  autoplay: {
    delay: 5000,
    disableOnInteraction: false,
  },
  breakpoints: {
    640: {
      slidesPerView: 2,
    },
    768: {
      slidesPerView: 3,
    },
    1024: {
      slidesPerView: 5,
    },
  }
}

// Fetch recommended products with retry mechanism
const fetchRecommendedProducts = async () => {
  // If external products are provided, use them
  if (props.externalProducts && props.externalProducts.length > 0) {
    recommendedProducts.value = props.externalProducts
    isLoading.value = props.externalLoading
    error.value = props.externalError
    return
  }
  
  isLoading.value = true
  error.value = null
  
  try {
    // Use the dedicated method for fetching recommended products
    const response = await productsStore.fetchRecommendedProducts('10')
    
    if (response) {
      // Use the recommendedProducts from the store
      recommendedProducts.value = productsStore.recommendedProducts
      
      // If no products found but we have retries left, try again
      if (recommendedProducts.value.length === 0 && retryCount.value < maxRetries) {
        retryCount.value++
        // Clear cache before retrying
        productsStore.clearCache()
        setTimeout(() => fetchRecommendedProducts(), 1000) // Wait 1 second before retrying
        return
      }
    }
  } catch (err) {
    error.value = 'Önerilen ürünler yüklenirken bir hata oluştu.'
    
    // Retry on error if we have retries left
    if (retryCount.value < maxRetries) {
      retryCount.value++
      // Clear cache before retrying
      productsStore.clearCache()
      setTimeout(() => fetchRecommendedProducts(), 1000) // Wait 1 second before retrying
      return
    }
  } finally {
    isLoading.value = false
  }
}

// Watch for changes in external products
watch(() => props.externalProducts, (newProducts) => {
  if (newProducts && newProducts.length > 0) {
    recommendedProducts.value = newProducts
    isLoading.value = props.externalLoading
    error.value = props.externalError
  }
}, { deep: true, immediate: true })

// Watch for changes in the store's recommended products
watch(() => productsStore.recommendedProducts, (newProducts) => {
  // Only update if we're not using external products
  if ((!props.externalProducts || props.externalProducts.length === 0) && newProducts.length > 0) {
    recommendedProducts.value = newProducts
  }
}, { deep: true })

// Fetch data on component mount
onMounted(() => {
  // Only fetch if external products are not provided
  if (!props.externalProducts || props.externalProducts.length === 0) {
    fetchRecommendedProducts()
  }
})

// Handle add to favorites
const handleAddToFavorites = (productId: string) => {
  // This would typically use a store action
  console.log('Add to favorites:', productId)
}

// Handle add to cart
const handleAddToCart = (productId: string) => {
  // This would typically use a store action
  console.log('Add to cart:', productId)
}
</script>

<template>
  <section class="py-12 bg-white">
    <div class="container mx-auto px-4">
      <!-- Section Header -->
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold mb-2">SENİN İÇİN SEÇTİKLERİMİZ</h2>
        <p class="text-gray-600">Sizin için özenle seçtiğimiz ürünleri keşfedin</p>
      </div>
      
      <!-- Loading State -->
      <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <div 
          v-for="i in 5" 
          :key="i" 
          class="bg-gray-200 animate-pulse rounded-lg h-80"
        ></div>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="text-center text-red-500 py-8">
        {{ error }}
      </div>
      
      <!-- Empty State -->
      <div v-else-if="recommendedProducts.length === 0" class="text-center text-gray-500 py-8">
        Henüz ürün bulunmamaktadır.
      </div>
      
      <!-- Products Swiper -->
      <div v-else class="relative">
        <Swiper
          v-bind="swiperOptions"
          class="recommended-products-swiper"
        >
          <SwiperSlide 
            v-for="product in recommendedProducts" 
            :key="product.id"
            class="h-full"
          >
            <ProductCard 
              :product="product"
              size="md"
              @add-to-favorites="handleAddToFavorites"
              @add-to-cart="handleAddToCart"
            />
          </SwiperSlide>
        </Swiper>
        
        <!-- Navigation Buttons -->
        <div class="swiper-button-prev !text-gray-800 !-left-1 lg:!-left-5 after:!text-lg"></div>
        <div class="swiper-button-next !text-gray-800 !-right-1 lg:!-right-5 after:!text-lg"></div>
        
        <!-- Pagination -->
        <div class="swiper-pagination !bottom-0 !mt-4"></div>
      </div>
      
      <!-- View All Button -->
      <div class="text-center mt-12">
        <Button 
          :to="viewAllLink" 
          variant="outline"
        >
          {{ viewAllText }}
          <span class="ml-2">→</span>
        </Button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.recommended-products-swiper {
  padding-bottom: 40px;
}

:deep(.swiper-button-prev),
:deep(.swiper-button-next) {
  width: 40px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

:deep(.swiper-button-prev)::after,
:deep(.swiper-button-next)::after {
  font-size: 18px;
  font-weight: bold;
}

:deep(.swiper-pagination-bullet) {
  width: 10px;
  height: 10px;
  background-color: #d1d5db;
  opacity: 0.7;
}

:deep(.swiper-pagination-bullet-active) {
  background-color: #4b5563;
  opacity: 1;
}
</style> 