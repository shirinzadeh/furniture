<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
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

// Change image on hover if multiple images exist
const handleMouseEnter = () => {
  isHovered.value = true
  if (props.product.images && props.product.images.length > 1) {
    currentImageIndex.value = 1
  }
}

const handleMouseLeave = () => {
  isHovered.value = false
  currentImageIndex.value = 0
}

// Initialize favorite status when component mounts
onMounted(async () => {
  // Initialize stores if not already done
  await favoritesStore.initFavorites()
})
</script>

<template>
  <NuxtLink 
    :to="`/product/${product.slug}`"
    class="product-card group relative bg-white rounded-xl overflow-hidden transition-all duration-300 flex flex-col h-full"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- Quick action buttons that appear on hover -->
    <div class="absolute top-4 right-4 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
    <div class="relative aspect-auto overflow-hidden bg-gray-50">
      <div class="w-full h-full transition-all duration-500 ease-out">
        <NuxtImg
          :src="product.images[currentImageIndex] || '/images/placeholder.jpg'"
          :alt="product.name"
          class="w-full h-full max-h-[296px] object-cover transition-all duration-700 ease-out group-hover:scale-105"
          format="webp"
          quality="85"
          loading="lazy"
        />
      </div>
      
      <!-- Discount badge -->
      <div 
        v-if="isOnSale && showDiscount" 
        :class="[
          'discount-badge absolute z-10',
          labelPosition === 'top-left' ? 'top-3 left-3' : 'top-3 right-3'
        ]"
      >
        -{{ discountPercentage }}%
      </div>
      
      <!-- Hover overlay with "View Details" -->
      <div class="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <span class="view-details-btn py-2 px-4 bg-white/90 backdrop-blur-sm text-amber-800 rounded-full text-sm font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          Ürün Detayları
        </span>
      </div>
    </div>
    
    <!-- Product info -->
    <div class="p-5 flex flex-col flex-grow">
      <!-- Category tag -->
      <div class="mb-2">
        <span v-if="product.category" class="category-tag">
          {{ product.category.name }}
        </span>
      </div>
      
      <!-- Product name -->
      <h3 class="text-base font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-amber-800 transition-colors">
        {{ product.name }}
      </h3>
      
      <!-- Price section -->
      <div class="mt-auto pt-3 flex items-baseline">
        <span v-if="isOnSale" class="price-sale text-lg">{{ formatPrice(product.salePrice || 0) }} TL</span>
        <span v-else class="price-regular text-lg">{{ formatPrice(product.price) }} TL</span>
        
        <span v-if="isOnSale && showOriginalPrice" class="price-old ml-2">
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
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4b5563;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.discount-badge {
  background-color: #d97706; /* amber-600 */
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.category-tag {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #78716c; /* stone-500 */
  font-weight: 600;
}

.price-sale {
  font-weight: 700;
  color: #b45309; /* amber-700 */
}

.price-old {
  text-decoration: line-through;
  color: #9ca3af; /* gray-400 */
  font-size: 0.875em;
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
</style> 