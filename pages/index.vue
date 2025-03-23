<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import type { Product, Category } from '~/types'
import { Swiper, SwiperSlide } from 'swiper/vue'
import ProductCard from '~/components/product/ProductCard.vue'
import Button from '~/components/ui/UiButton.vue'
import FeaturedCategories from '~/components/categories/CategoriesFeatured.vue'

// Import Pinia stores
const productsStore = useProductsStore()
const categoriesStore = useCategoriesStore()

// State for winter flash sale products
const winterFlashSaleProducts = ref<Product[]>([])
const isLoadingWinterSale = ref(true)
const winterSaleError = ref<string | null>(null)
const retryCount = ref(0)
const maxRetries = 3

// State for bestseller products
const bestsellerProducts = ref<Product[]>([])
const isLoadingBestsellers = ref(true)
const bestsellersError = ref<string | null>(null)
const bestsellerRetryCount = ref(0)

// State for recommended products
const recommendedProducts = ref<Product[]>([])
const isLoadingRecommended = ref(true)
const recommendedError = ref<string | null>(null)
const recommendedRetryCount = ref(0)

// Add retry flags
const shouldRetryBestsellers = ref(false)
const shouldRetryRecommended = ref(false)
const shouldRetryWinterSale = ref(false)

// Watch for retry flags
watch(shouldRetryBestsellers, (shouldRetry) => {
  if (shouldRetry) {
    // Reset the flag
    shouldRetryBestsellers.value = false
    // Wait a bit before retrying
    setTimeout(() => {
      // This is safe because we're not calling any Nuxt composables directly in the callback
      fetchBestsellerProducts()
    }, 1000)
  }
})

watch(shouldRetryRecommended, (shouldRetry) => {
  if (shouldRetry) {
    // Reset the flag
    shouldRetryRecommended.value = false
    // Wait a bit before retrying
    setTimeout(() => {
      // This is safe because we're not calling any Nuxt composables directly in the callback
      fetchRecommendedProducts()
    }, 1000)
  }
})

watch(shouldRetryWinterSale, (shouldRetry) => {
  if (shouldRetry) {
    // Reset the flag
    shouldRetryWinterSale.value = false
    // Wait a bit before retrying
    setTimeout(() => {
      // This is safe because we're not calling any Nuxt composables directly in the callback
      fetchWinterFlashSaleProducts()
    }, 1000)
  }
})

// Fetch winter flash sale products with retry mechanism
const fetchWinterFlashSaleProducts = async () => {
  isLoadingWinterSale.value = true
  winterSaleError.value = null
  
  try {
    // Use the dedicated method for fetching sale products
    const response = await productsStore.fetchSaleProducts(8)
    
    if (response) {
      // Use the saleProducts from the store
      winterFlashSaleProducts.value = productsStore.saleProducts
      
      // If no products found but we have retries left, try again
      if (winterFlashSaleProducts.value.length === 0 && retryCount.value < maxRetries) {
        retryCount.value++
        console.log(`No winter flash sale products found, retrying (${retryCount.value}/${maxRetries})`)
        // Clear cache before retrying
        productsStore.clearCache(`sale-products-8`)
        // Instead of setTimeout, use a flag and watch
        shouldRetryWinterSale.value = true
        return
      }
    }
  } catch (err) {
    winterSaleError.value = 'Flaş indirim ürünleri yüklenirken bir hata oluştu.'
    console.error('Error fetching winter flash sale products:', err)
    
    // Retry on error if we have retries left
    if (retryCount.value < maxRetries) {
      retryCount.value++
      console.log(`Error fetching winter flash sale products, retrying (${retryCount.value}/${maxRetries})`)
      // Clear cache before retrying
      productsStore.clearCache(`sale-products-8`)
      // Instead of setTimeout, use a flag and watch
      shouldRetryWinterSale.value = true
      return
    }
  } finally {
    isLoadingWinterSale.value = false
  }
}

// Fetch bestseller products with retry mechanism
const fetchBestsellerProducts = async () => {
  isLoadingBestsellers.value = true
  bestsellersError.value = null
  
  try {
    // Use the dedicated method for fetching bestseller products
    const response = await productsStore.fetchBestsellerProducts(8)
    
    if (response) {
      // Use the bestsellerProducts from the store
      bestsellerProducts.value = productsStore.bestsellerProducts
      
      // If no products found but we have retries left, try again
      if (bestsellerProducts.value.length === 0 && bestsellerRetryCount.value < maxRetries) {
        bestsellerRetryCount.value++
        console.log(`No bestseller products found, retrying (${bestsellerRetryCount.value}/${maxRetries})`)
        // Clear cache before retrying
        productsStore.clearCache(`bestseller-products-8`)
        // Instead of setTimeout, use a flag and onMounted
        shouldRetryBestsellers.value = true
        return
      }
    }
  } catch (err) {
    bestsellersError.value = 'Çok satan ürünler yüklenirken bir hata oluştu.'
    console.error('Error fetching bestseller products:', err)
    
    // Retry on error if we have retries left
    if (bestsellerRetryCount.value < maxRetries) {
      bestsellerRetryCount.value++
      console.log(`Error fetching bestseller products, retrying (${bestsellerRetryCount.value}/${maxRetries})`)
      // Clear cache before retrying
      productsStore.clearCache(`bestseller-products-8`)
      // Instead of setTimeout, use a flag and onMounted
      shouldRetryBestsellers.value = true
      return
    }
  } finally {
    isLoadingBestsellers.value = false
  }
}

// Fetch recommended products with retry mechanism
const fetchRecommendedProducts = async () => {
  isLoadingRecommended.value = true
  recommendedError.value = null
  
  try {
    // Use the dedicated method for fetching recommended products
    const response = await productsStore.fetchRecommendedProducts(10)
    
    if (response) {
      // Use the recommendedProducts from the store
      recommendedProducts.value = productsStore.recommendedProducts
      
      // If no products found but we have retries left, try again
      if (recommendedProducts.value.length === 0 && recommendedRetryCount.value < maxRetries) {
        recommendedRetryCount.value++
        console.log(`No recommended products found, retrying (${recommendedRetryCount.value}/${maxRetries})`)
        // Clear cache before retrying
        productsStore.clearCache(`recommended-products-10`)
        // Instead of setTimeout, use a flag and onMounted
        shouldRetryRecommended.value = true
        return
      }
    }
  } catch (err) {
    recommendedError.value = 'Önerilen ürünler yüklenirken bir hata oluştu.'
    console.error('Error fetching recommended products:', err)
    
    // Retry on error if we have retries left
    if (recommendedRetryCount.value < maxRetries) {
      recommendedRetryCount.value++
      console.log(`Error fetching recommended products, retrying (${recommendedRetryCount.value}/${maxRetries})`)
      // Clear cache before retrying
      productsStore.clearCache(`recommended-products-10`)
      // Instead of setTimeout, use a flag and onMounted
      shouldRetryRecommended.value = true
      return
    }
  } finally {
    isLoadingRecommended.value = false
  }
}

// Computed property for combined error message
const errorMessage = computed(() => {
  if (productsStore.error && categoriesStore.error) {
    return 'Veritabanına bağlanırken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.'
  }
  if (productsStore.error) {
    return 'Ürünler yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.'
  }
  if (categoriesStore.error) {
    return 'Kategoriler yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.'
  }
  return null
})

// Handle add to favorites for featured products
const handleAddToFavorites = (productId: string) => {
  // This would typically use a store action
  console.log('Add to favorites:', productId)
}

// Handle add to cart for featured products
const handleAddToCart = (productId: string) => {
  // This would typically use a store action
  console.log('Add to cart:', productId)
}

// Fetch data on page load with error handling
try {
  await Promise.all([
    productsStore.fetchFeaturedProducts().catch(e => {
      console.error('Error fetching featured products:', e);
      return [];
    }),
    categoriesStore.fetchCategories().catch(e => {
      console.error('Error fetching categories:', e);
      return [];
    }),
    fetchWinterFlashSaleProducts().catch(e => {
      console.error('Error fetching winter flash sale products:', e);
      return [];
    }),
    fetchBestsellerProducts().catch(e => {
      console.error('Error fetching bestseller products:', e);
      return [];
    }), 
    fetchRecommendedProducts().catch(e => {
      console.error('Error fetching recommended products:', e);
      return [];
    })
  ]);
} catch (error) {
  console.error('Error fetching data:', error);
}

// Ensure we always have arrays to render, even if empty
productsStore.ensureArraysInitialized();

// Initialize local data arrays if undefined
if (!winterFlashSaleProducts.value) winterFlashSaleProducts.value = [];
if (!bestsellerProducts.value) bestsellerProducts.value = [];
if (!recommendedProducts.value) recommendedProducts.value = [];
</script>

<template>
  <div>
    <!-- Hero Banner -->
    <HeroBanner />
    
    <!-- Winter Flash Sale Section -->
    <WinterFlashSaleSection 
      :external-products="winterFlashSaleProducts"
      :external-loading="isLoadingWinterSale"
      :external-error="winterSaleError"
    />
    
    <!-- Featured Categories -->
    <FeaturedCategories
      :categories="categoriesStore.categories"
      :loading="categoriesStore.isLoading"
      :error="errorMessage"
    />
    
    <!-- Featured Products -->
    <section class="py-12 bg-gray-50">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-8">Öne Çıkan Ürünler</h2>
        
        <div v-if="productsStore.isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="i in 8" :key="i" class="bg-gray-200 animate-pulse rounded-lg h-80"></div>
        </div>
        
        <div v-else-if="errorMessage" class="text-center text-red-500 py-8">
          {{ errorMessage }}
        </div>
        
        <div v-else-if="productsStore.featuredProducts.length === 0" class="text-center text-gray-500 py-8">
          Henüz ürün bulunmamaktadır.
        </div>
        
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProductCard 
            v-for="product in productsStore.featuredProducts" 
            :key="product.id" 
            :product="product"
            @add-to-favorites="handleAddToFavorites"
            @add-to-cart="handleAddToCart"
          />
        </div>
        
        <div class="text-center mt-8">
          <Button 
            to="/products" 
            variant="secondary"
          >
            Tüm Ürünleri Gör
          </Button>
        </div>
      </div>
    </section>
    
    <!-- Features -->
    <section class="py-12 bg-white">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="mdi:truck-delivery" class="w-8 h-8 text-gray-800" />
            </div>
            <h3 class="text-xl font-bold mb-2">Hızlı Teslimat</h3>
            <p class="text-gray-600">Siparişleriniz en kısa sürede adresinize teslim edilir.</p>
          </div>
          
          <div class="text-center">
            <div class="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="mdi:credit-card" class="w-8 h-8 text-gray-800" />
            </div>
            <h3 class="text-xl font-bold mb-2">Güvenli Ödeme</h3>
            <p class="text-gray-600">Tüm ödemeleriniz güvenli bir şekilde gerçekleştirilir.</p>
          </div>
          
          <div class="text-center">
            <div class="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="mdi:headset" class="w-8 h-8 text-gray-800" />
            </div>
            <h3 class="text-xl font-bold mb-2">7/24 Destek</h3>
            <p class="text-gray-600">Sorularınız için müşteri hizmetlerimiz her zaman yanınızda.</p>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Winter Flash Price Section -->
    <WinterFlashPriceSection 
      :external-products="winterFlashSaleProducts"
      :external-loading="isLoadingWinterSale"
      :external-error="winterSaleError"
    />
    
    <!-- Recommended Products Section -->
    <RecommendedProductsSection 
      :external-products="recommendedProducts"
      :external-loading="isLoadingRecommended"
      :external-error="recommendedError"
    />
    
    <!-- Season Bestsellers Section -->
    <SeasonBestSellersSection 
      :products="bestsellerProducts"
      :loading="isLoadingBestsellers"
      :error="bestsellersError"
      title="SEZONUN ÇOK SATANLARI"
      subtitle="Bu sezonun en çok tercih edilen ürünleri"
      view-all-link="/bestsellers"
      view-all-text="Tümünü Gör"
      background-color="bg-amber-50"
    />
  </div>
</template>

