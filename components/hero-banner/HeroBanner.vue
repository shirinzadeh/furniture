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

// Default banner for immediate display
const defaultBanner = {
  id: 'default',
  title: 'MEBEL - Evinizi Yeniden Keşfedin',
  subtitle: 'En Kaliteli Mobilyalar, En Uygun Fiyatlarla',
  image: '/images/placeholder.jpg',
  link: '/products',
  isActive: true,
  order: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

// Computed banners that always includes at least default banner
const displayBanners = computed(() => {
  if (banners.value && banners.value.length > 0) {
    return banners.value
  }
  return [defaultBanner]
})

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
      if (response && response.banners && response.banners.length > 0) {
        banners.value = response.banners as Banner[]
        
        // Preload banner images to prevent flashing
        preloadImages(banners.value.map(banner => banner.image))
      } else {
        console.log('No banners found, using default banner')
        // Keep default banner
      }
      
      hasLoadedOnce.value = true
    } catch (err) {
      console.log('Error fetching banners, using default banner:', err)
      // Keep default banner
    } finally {
      isLoading.value = false
    }
  }
})
</script>

<template>
  <div class="relative">
    <!-- Always show swiper immediately with default or loaded banners -->
    <Swiper
      :modules="[SwiperModules.SwiperAutoplay, SwiperModules.SwiperPagination, SwiperModules.SwiperNavigation]"
      :slides-per-view="1"
      :loop="displayBanners.length > 1"
      :pagination="{ clickable: true }"
      :navigation="displayBanners.length > 1"
      :autoplay="displayBanners.length > 1 ? { delay: 5000, disableOnInteraction: false } : false"
      class="w-full"
    >
      <SwiperSlide v-for="banner in displayBanners" :key="banner.id" class="relative">
        <div class="relative h-[300px] sm:h-[400px] md:h-[500px] bg-gradient-to-br from-amber-50 to-amber-100">
          <NuxtLink :to="banner.link" class="w-full h-full block"> 
            <NuxtImg
              :src="banner.image"
              :alt="banner.title"
              class="w-full h-full object-cover"
              placeholder
              loading="eager"
            />
          </NuxtLink>
          
          <!-- Enhanced overlay content for better visibility -->
          <!-- <div class="absolute inset-0 bg-black bg-opacity-20 flex flex-col justify-center px-6 sm:px-8 md:px-12 lg:px-24 text-left">
            <div class="max-w-lg">
              <h2 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg mb-2 md:mb-4">
                {{ banner.title }}
              </h2>
              <p v-if="banner.subtitle" class="text-lg sm:text-xl md:text-2xl text-white drop-shadow-md mb-4 md:mb-6 hidden sm:block">
                {{ banner.subtitle }}
              </p>
              
              <NuxtLink 
                v-if="banner.link"
                :to="banner.link" 
                class="inline-flex items-center bg-amber-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-amber-700 transition-all duration-300 transform hover:scale-105 shadow-lg text-sm md:text-base"
              >
                Alışverişe Başla
                <Icon name="ph:arrow-right" class="ml-2" />
              </NuxtLink>
            </div>
          </div> -->
        </div>
      </SwiperSlide>
    </Swiper>
    
    <!-- Promotional banner below the slider - responsive for mobile -->
    <div class="bg-gradient-to-r from-amber-50 to-orange-50 py-4 text-center border-t">
      <div class="container mx-auto px-4 flex flex-col sm:flex-row justify-center items-center sm:space-x-4 md:space-x-8 space-y-2 sm:space-y-0">
        <div class="flex items-center">
          <Icon name="ph:credit-card" class="w-5 h-5 text-amber-600 mr-2" />
          <span class="text-sm md:text-base lg:text-lg font-semibold text-gray-800">Peşin Fiyatına 9 Taksit</span>
          <span class="hidden sm:inline text-lg mx-2 text-amber-600">|</span>
        </div>
        <div class="flex items-center">
          <Icon name="ph:calendar" class="w-5 h-5 text-amber-600 mr-2" />
          <span class="text-sm md:text-base lg:text-lg font-semibold text-gray-800">3 Ay Ödeme Erteleme</span>
          <span class="hidden sm:inline text-lg mx-2 text-amber-600">|</span>
        </div>
        <div class="flex items-center">
          <Icon name="ph:wallet" class="w-5 h-5 text-amber-600 mr-2" />
          <span class="text-sm md:text-base lg:text-lg font-semibold text-gray-800">36 Aya Varan Alışveriş Kredisi</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom styles for Swiper pagination */
:deep(.swiper-pagination-bullet) {
  width: 12px;
  height: 12px;
  background: rgba(255, 255, 255, 0.7);
  opacity: 0.7;
  margin: 0 4px;
}

:deep(.swiper-pagination-bullet-active) {
  opacity: 1;
  background: white;
  transform: scale(1.2);
}

/* Custom styles for Swiper navigation buttons */
:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  color: white;
  background: rgba(0, 0, 0, 0.4);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  transition: all 0.3s ease;
}

:deep(.swiper-button-next:hover),
:deep(.swiper-button-prev:hover) {
  background: rgba(0, 0, 0, 0.6);
  transform: scale(1.1);
}

:deep(.swiper-button-next:after),
:deep(.swiper-button-prev:after) {
  font-size: 18px;
  font-weight: 900;
}

/* Hide navigation buttons on mobile */
@media (max-width: 640px) {
  :deep(.swiper-button-next),
  :deep(.swiper-button-prev) {
    display: none;
  }
}

/* Enhanced pagination positioning on mobile */
:deep(.swiper-pagination) {
  bottom: 20px;
}

@media (max-width: 640px) {
  :deep(.swiper-pagination) {
    bottom: 15px;
  }
}
</style>