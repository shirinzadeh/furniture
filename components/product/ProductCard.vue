<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import type { Product } from '~/types'
import { useCartStore } from '~/stores'
import useFavoritesStore from '~/stores/favorites'
import useAuthStore from '~/stores/auth'
import { useToast } from '~/composables/useToast'

interface Props {
  product: Product
  showDiscount?: boolean
  showOriginalPrice?: boolean
  labelPosition?: 'top-left' | 'top-right'
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  showDiscount: true,
  showOriginalPrice: true,
  labelPosition: 'top-left',
  size: 'md'
})

// Initialize stores and composables
const cartStore = useCartStore()
const favoritesStore = useFavoritesStore()
const { cartAdded, cartError } = useToast()

// Local loading states for this specific product
const addingToCart = ref(false)
const togglingFavorite = ref(false)

// Calculate discount percentage
const discountPercentage = computed(() => {
  if (props.product.salePrice && props.product.price > props.product.salePrice) {
    return Math.round((1 - props.product.salePrice / props.product.price) * 100)
  }
  return 0
})

// Determine if product is on sale
const isOnSale = computed(() => {
  return props.product.salePrice && props.product.price > props.product.salePrice
})

// Get product ID safely
const productId = computed(() => {
  return props.product.id || props.product._id?.toString() || ''
})

// Check if product is already in cart (specific to this product)
const isInCart = computed(() => {
  return productId.value ? cartStore.isInCart(productId.value) : false
})

// Get current quantity in cart (specific to this product)
const cartQuantity = computed(() => {
  return productId.value ? cartStore.getItemQuantity(productId.value) : 0
})

// Check if product is in favorites (specific to this product)
const isFavorite = computed(() => {
  return productId.value ? favoritesStore.isFavorite(productId.value) : false
})

// Determine image height based on size prop
const imageHeight = computed(() => {
  switch (props.size) {
    case 'sm': return 'h-40'
    case 'lg': return 'h-56'
    default: return 'h-48'
  }
})

// Handle add to favorites
const handleAddToFavorites = async (e: Event) => {
  e.preventDefault()
  e.stopPropagation()
  
  if (!productId.value) {
    console.error('Product ID is missing:', props.product)
    const { error: toastError } = useToast()
    toastError('Hata', 'Ürün ID\'si bulunamadı')
    return
  }
  
  // Check if user is authenticated
  const authStore = useAuthStore()
  if (!authStore.isAuthenticated) {
    const { info } = useToast()
    info('Giriş Gerekli', 'Favorilere eklemek için giriş yapmalısınız')
    await navigateTo('/login')
    return
  }
  
  togglingFavorite.value = true
  
  try {
    const newFavoriteStatus = await favoritesStore.toggleFavorite(productId.value)
    
    const { success, info } = useToast()
    if (newFavoriteStatus) {
      success('Favorilere Eklendi', `${props.product.name} favorilerinize eklendi`)
    } else {
      info('Favorilerden Çıkarıldı', `${props.product.name} favorilerinizden kaldırıldı`)
    }
  } catch (error: any) {
    console.error('Error toggling favorite:', error)
    const { error: toastError } = useToast()
    toastError('Hata', 'Favori durumu değiştirilirken bir hata oluştu')
  } finally {
    togglingFavorite.value = false
  }
}

// Handle add to cart
const handleAddToCart = async (e: Event) => {
  e.preventDefault()
  e.stopPropagation()
  
  if (!productId.value) {
    console.error('Product ID is missing:', props.product)
    const { error: toastError } = useToast()
    toastError('Hata', 'Ürün ID\'si bulunamadı')
    return
  }
  
  addingToCart.value = true
  
  try {
    await cartStore.addToCart(props.product, 1)
    cartAdded(props.product.name, 1)
  } catch (error: any) {
    console.error('Error adding to cart:', error)
    cartError('Ürün sepete eklenirken bir hata oluştu')
  } finally {
    addingToCart.value = false
  }
}

// Format price with Turkish locale
const formatPrice = (price: number) => {
  return price.toLocaleString('tr-TR')
}

// Image hover state
const isHovered = ref(false)
const currentImageIndex = ref(0)
const imageLoaded = ref(false)
const imageError = ref(false)
const showSkeleton = ref(false)
const skeletonTimer = ref<NodeJS.Timeout | null>(null)

// Change image on hover if multiple images exist
const handleMouseEnter = () => {
  isHovered.value = true
  if (props.product.images && props.product.images.length > 1) {
    currentImageIndex.value = 1
    // Reset loading state for hover image
    imageLoaded.value = false
    imageError.value = false
    showSkeleton.value = false
    
    // Start skeleton timer for alternate image
    if (skeletonTimer.value) {
      clearTimeout(skeletonTimer.value)
    }
    skeletonTimer.value = setTimeout(() => {
      if (!imageLoaded.value && !imageError.value) {
        showSkeleton.value = true
      }
    }, 200) // Shorter delay for hover since user expects faster interaction
  }
}

const handleMouseLeave = () => {
  isHovered.value = false
  currentImageIndex.value = 0
  // Reset loading state for main image
  imageLoaded.value = false
  imageError.value = false
  showSkeleton.value = false
  
  // Clear any existing timer and start new one for main image
  if (skeletonTimer.value) {
    clearTimeout(skeletonTimer.value)
  }
  skeletonTimer.value = setTimeout(() => {
    if (!imageLoaded.value && !imageError.value) {
      showSkeleton.value = true
    }
  }, 300)
}

// Handle image loading
const handleImageLoad = () => {
  imageLoaded.value = true
  imageError.value = false
  showSkeleton.value = false
  
  // Clear skeleton timer if image loads quickly
  if (skeletonTimer.value) {
    clearTimeout(skeletonTimer.value)
    skeletonTimer.value = null
  }
}

const handleImageError = () => {
  // Clear skeleton timer if image fails
  if (skeletonTimer.value) {
    clearTimeout(skeletonTimer.value)
    skeletonTimer.value = null
  }
  
  // If primary image fails, try placeholder
  const currentSrc = props.product.images[currentImageIndex.value]
  if (currentSrc && currentSrc !== '/images/placeholder.jpg') {
    // Don't set error state, let it fallback to placeholder
    return
  }
  
  imageError.value = true
  imageLoaded.value = false
  showSkeleton.value = false
}

// Initialize favorite status when component mounts
onMounted(async () => {
  // Initialize stores if not already done
  await favoritesStore.initFavorites()
  
  // Start skeleton timer - only show skeleton if image takes longer than 300ms to load
  skeletonTimer.value = setTimeout(() => {
    if (!imageLoaded.value && !imageError.value) {
      showSkeleton.value = true
    }
  }, 300)
  
      // Reset image loading state
    imageLoaded.value = false
    imageError.value = false
    showSkeleton.value = false
})

// Cleanup timer when component unmounts
onUnmounted(() => {
  if (skeletonTimer.value) {
    clearTimeout(skeletonTimer.value)
    skeletonTimer.value = null
  }
})
</script>

<template>
  <NuxtLink 
    :to="`/product/${product.slug}`"
    class="product-card group relative bg-white rounded-xl overflow-hidden transition-all duration-300 flex flex-col h-full"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- Quick action buttons - always visible on mobile, hover on desktop -->
    <div class="absolute top-2 right-2 sm:top-4 sm:right-4 z-20 flex flex-col gap-1.5 sm:gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
      <button 
        @click="handleAddToFavorites"
        :disabled="togglingFavorite"
        :class="[
          'action-button backdrop-blur-sm transition-all',
          isFavorite 
            ? 'bg-red-100 text-red-600 hover:bg-red-200' 
            : 'bg-white/90 hover:bg-red-50 hover:text-red-600'
        ]"
        :aria-label="isFavorite ? 'Remove from favorites' : 'Add to favorites'"
      >
        <Icon 
          v-if="togglingFavorite" 
          name="mdi:loading" 
          size="20" 
          class="animate-spin" 
        />
        <Icon 
          v-else
          :name="isFavorite ? 'ph:heart-fill' : 'ph:heart'" 
          size="20" 
        />
      </button>
      
      <button 
        @click="handleAddToCart"
        :disabled="addingToCart"
        :class="[
          'action-button backdrop-blur-sm transition-all',
          isInCart 
            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
            : 'bg-white/90 hover:bg-amber-50 hover:text-amber-600'
        ]"
        :aria-label="isInCart ? `${cartQuantity} in cart` : 'Add to cart'"
      >
        <Icon 
          v-if="addingToCart" 
          name="mdi:loading" 
          size="20" 
          class="animate-spin" 
        />
        <Icon 
          v-else
          :name="isInCart ? 'ph:check-circle-fill' : 'ph:shopping-cart'" 
          size="20" 
        />
        <!-- Cart quantity badge -->
        <span 
          v-if="cartQuantity > 0" 
          class="absolute -top-1 -right-1 bg-amber-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
        >
          {{ cartQuantity }}
        </span>
      </button>
    </div>
    
    <!-- Product image with hover effect -->
    <div class="relative aspect-[4/3] overflow-hidden bg-gray-100">
      <!-- Image Loading Skeleton -->
      <div 
        v-if="showSkeleton && !imageLoaded && !imageError"
        class="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer flex items-center justify-center transition-opacity duration-200"
      >
        <div class="bg-gray-300 rounded-full p-3">
          <Icon name="mdi:image" class="w-8 h-8 text-gray-500" />
        </div>
      </div>
      
      <!-- Main Image -->
      <div class="w-full h-full transition-all duration-500 ease-out">
                  <NuxtImg
            :src="product.images[currentImageIndex] || '/images/placeholder.jpg'"
            :alt="product.name"
            :class="[
              'w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-105',
              imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            ]"
            format="webp"
            quality="85"
            loading="lazy"
            @load="handleImageLoad"
            @error="handleImageError"
          />
      </div>
      
      <!-- Error State -->
      <div 
        v-if="imageError"
        class="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center text-gray-400"
      >
        <Icon name="mdi:image-broken" class="w-12 h-12 mb-2" />
        <span class="text-sm">Resim yüklenemedi</span>
      </div>
      
      <!-- Discount badge -->
      <div 
        v-if="isOnSale && showDiscount" 
        :class="[
          'discount-badge absolute z-10',
          labelPosition === 'top-left' ? 'top-2 left-2 sm:top-3 sm:left-3' : 'top-2 right-2 sm:top-3 sm:right-3'
        ]"
      >
        -{{ discountPercentage }}%
      </div>
      
      <!-- Hover overlay with "View Details" -->
      <div class="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <span class="view-details-btn py-1.5 px-3 sm:py-2 sm:px-4 bg-white/90 backdrop-blur-sm text-amber-800 rounded-full text-xs sm:text-sm font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          Ürün Detayları
        </span>
      </div>
    </div>
    
    <!-- Product info -->
    <div class="p-3 sm:p-4 md:p-5 flex flex-col flex-grow">
      <!-- Category tag -->
      <div class="mb-1 sm:mb-2">
        <span v-if="product.category" class="category-tag">
          {{ product.category.name }}
        </span>
      </div>
      
      <!-- Product name -->
      <h3 class="text-sm sm:text-base font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-amber-800 transition-colors">
        {{ product.name }}
      </h3>
      
      <!-- Price section -->
      <div class="mt-auto pt-2 sm:pt-3 flex items-baseline">
        <span v-if="isOnSale" class="price-sale text-xs sm:text-base md:text-lg">{{ formatPrice(product.salePrice || 0) }} TL</span>
        <span v-else class="price-regular text-xs sm:text-base md:text-lg">{{ formatPrice(product.price) }} TL</span>
        
        <span v-if="isOnSale && showOriginalPrice" class="price-old ml-1 sm:ml-2">
          {{ formatPrice(product.price) }} TL
        </span>
      </div>
    </div>
    
  </NuxtLink>
</template>

<style scoped>
.product-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.product-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.07);
  transform: translateY(-2px);
}

.action-button {
  position: relative;
  width: 32px; /* Smaller on mobile */
  height: 32px; /* Smaller on mobile */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4b5563;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); /* Stronger shadow for mobile visibility */
}

@media (min-width: 640px) {
  .action-button {
    width: 36px; /* Original size on sm and up */
    height: 36px; /* Original size on sm and up */
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); /* Lighter shadow for desktop */
  }
}

.discount-badge {
  background-color: #d97706; /* amber-600 */
  color: white;
  font-size: 0.625rem; /* Smaller on mobile */
  font-weight: 700;
  padding: 0.2rem 0.5rem; /* Smaller padding on mobile */
  border-radius: 9999px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

@media (min-width: 640px) {
  .discount-badge {
    font-size: 0.75rem; /* Original size on sm and up */
    padding: 0.25rem 0.75rem; /* Original padding on sm and up */
  }
}

.category-tag {
  font-size: 0.625rem; /* Smaller on mobile */
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #78716c; /* stone-500 */
  font-weight: 600;
}

@media (min-width: 640px) {
  .category-tag {
    font-size: 0.7rem; /* Original size on sm and up */
  }
}

.price-sale {
  font-weight: 700;
  color: #b45309; /* amber-700 */
}

.price-old {
  text-decoration: line-through;
  color: #9ca3af; /* gray-400 */
  font-size: 0.8em; /* Slightly smaller on mobile */
}

@media (min-width: 640px) {
  .price-old {
    font-size: 0.875em; /* Original size on sm and up */
  }
}

.price-regular {
  font-weight: 700;
  color: #1f2937; /* gray-800 */
}

.stock-indicator {
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
  padding: 0.25rem;
  width: 100%;
}

.out-of-stock {
  background-color: #f3f4f6; /* gray-100 */
  color: #ef4444; /* red-500 */
}

.low-stock {
  background-color: #fffbeb; /* amber-50 */
  color: #d97706; /* amber-600 */
}

/* Smooth animation for view details button */
.view-details-btn {
  opacity: 0;
  transition: all 0.3s ease;
}

.product-card:hover .view-details-btn {
  opacity: 1;
}

/* Custom shimmer animation for image loading */
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.animate-shimmer {
  animation: shimmer 1.5s ease-in-out infinite;
  background-size: 200% 100%;
}
</style> 