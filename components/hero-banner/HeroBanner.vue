<script setup lang="ts">
import type { Banner } from '~/types'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, Pagination, Navigation } from 'swiper/modules'
// Import Swiper styles
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

const SwiperModules = {
  SwiperAutoplay: Autoplay,
  SwiperPagination: Pagination,
  SwiperNavigation: Navigation
}

// Use useState to persist banner data across page navigations
const banners = useState<Banner[]>('hero-banners', () => [])
const isLoading = useState<boolean>('hero-banners-loading', () => true)
const error = useState<string | null>('hero-banners-error', () => null)
const hasLoadedOnce = useState<boolean>('hero-banners-loaded', () => false)

// Preload banner images
const preloadImages = (imageUrls: string[]) => {
  imageUrls.forEach(url => {
    const img = new Image()
    img.src = url
  })
}

onMounted(async () => {
  // Only fetch banners if they haven't been loaded before
  if (!hasLoadedOnce.value) {
    try {
      const response = await $fetch('/api/banners')
      
      // Check if response has banners property
      if (response && response.banners) {
        banners.value = response.banners
        
        // Preload banner images to prevent flashing
        if (banners.value.length > 0) {
          preloadImages(banners.value.map(banner => banner.image))
        }
      } else {
        console.error('Invalid banner response format:', response)
        error.value = 'Invalid banner data format'
      }
      
      hasLoadedOnce.value = true
    } catch (err) {
      error.value = 'Failed to load banners'
      console.error('Error fetching banners:', err)
    } finally {
      isLoading.value = false
    }
  }
})
</script>

<template>
  <div class="relative">
    
    <div v-if="error" class="h-64 md:h-80 lg:h-96 bg-gray-100 flex items-center justify-center">
      <div class="flex flex-col items-center">
        <NuxtImg 
          src="/images/placeholder.jpg" 
          alt="Banner placeholder" 
          class="w-full h-48 object-cover mb-4 opacity-50"
        />
      </div>
    </div>
    
    <!-- Show placeholder when no banners are available -->
    <div v-else-if="!isLoading && (!banners || banners.length === 0)" class="h-64 md:h-80 lg:h-96 bg-gray-100 flex items-center justify-center">
      <div class="flex flex-col items-center">
        <NuxtImg 
          src="/images/placeholder.jpg" 
          alt="Banner placeholder" 
          class="w-full h-48 object-cover mb-4 opacity-50"
        />
        <p class="text-gray-500">No banners available</p>
      </div>
    </div>
    
    <Swiper
      v-else-if="banners && banners.length > 0"
      :modules="[SwiperModules.SwiperAutoplay, SwiperModules.SwiperPagination, SwiperModules.SwiperNavigation]"
      :slides-per-view="1"
      :loop="true"
      :pagination="{ clickable: true }"
      :navigation="true"
      :autoplay="{ delay: 5000, disableOnInteraction: false }"
      class="w-full"
    >
      <SwiperSlide v-for="banner in banners" :key="banner.id" class="relative">
        <div class="relative h-[300px] sm:h-[400px] md:h-[500px] bg-pink-100">
          <NuxtLink :to="banner.link" class="w-full h-full"> 
            <NuxtImg
            :src="banner.image"
            :alt="banner.title"
            class="w-full h-full object-cover"
            placeholder
          />
          </NuxtLink>
          
          <!-- <div class="absolute inset-0 flex flex-col justify-center px-6 sm:px-8 md:px-12 lg:px-24 text-left">
            <div class="max-w-lg">
              <h2 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-2 md:mb-4">{{ banner.title }}</h2>
              <p v-if="banner.subtitle" class="text-lg sm:text-xl md:text-2xl text-gray-700 mb-4 md:mb-6 hidden sm:block">{{ banner.subtitle }}</p>
              
              <NuxtLink 
                v-if="banner.link"
                :to="banner.link" 
                class="inline-block bg-gray-800 text-white px-4 py-2 md:px-6 md:py-3 rounded-md font-medium hover:bg-gray-700 transition-colors text-sm md:text-base"
              >
                Alışverişe Başla
              </NuxtLink>
            </div>
          </div> -->
        </div>
      </SwiperSlide>
    </Swiper>
    
    <!-- Promotional banner below the slider - responsive for mobile -->
    <div class="bg-gray-100 py-4 text-center">
      <div class="container mx-auto px-4 flex flex-col sm:flex-row justify-center items-center sm:space-x-4 md:space-x-8 space-y-2 sm:space-y-0">
        <div class="flex items-center">
          <span class="text-sm md:text-base lg:text-lg font-semibold">Peşin Fiyatına 9 Taksit</span>
          <span class="hidden sm:inline text-lg mx-2">|</span>
        </div>
        <div class="flex items-center">
          <span class="text-sm md:text-base lg:text-lg font-semibold">3 Ay Ödeme Erteleme</span>
          <span class="hidden sm:inline text-lg mx-2">|</span>
        </div>
        <div class="flex items-center">
          <span class="text-sm md:text-base lg:text-lg font-semibold">36 Aya Varan Alışveriş Kredisi</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom styles for Swiper pagination */
:deep(.swiper-pagination-bullet) {
  width: 10px;
  height: 10px;
  background: white;
  opacity: 0.5;
}

:deep(.swiper-pagination-bullet-active) {
  opacity: 1;
  background: white;
}

/* Custom styles for Swiper navigation buttons */
:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  color: white;
  background: rgba(0, 0, 0, 0.3);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.swiper-button-next:after),
:deep(.swiper-button-prev:after) {
  font-size: 18px;
}

/* Hide navigation buttons on mobile */
@media (max-width: 640px) {
  :deep(.swiper-button-next),
  :deep(.swiper-button-prev) {
    display: none;
  }
}
</style>