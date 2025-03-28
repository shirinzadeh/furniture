<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import type { PropType } from 'vue'
import type { Product } from '~/types'

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
  }
})

// Pinia store for products
const productsStore = useProductsStore()

// State for winter flash price products
const winterFlashPriceProducts = ref<Product[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)
const retryCount = ref(0)
const maxRetries = 3

// Fetch winter flash price products with retry mechanism
const fetchWinterFlashPriceProducts = async () => {
  // If external products are provided, use them
  if (props.externalProducts && props.externalProducts.length > 0) {
    winterFlashPriceProducts.value = props.externalProducts
    isLoading.value = props.externalLoading
    error.value = props.externalError
    return
  }
  
  isLoading.value = true
  error.value = null
  
  try {
    // Use the dedicated method for fetching sale products
    const response = await productsStore.fetchSaleProducts(8)
    
    if (response) {
      // Use the saleProducts from the store
      winterFlashPriceProducts.value = productsStore.saleProducts
      
      // If no products found but we have retries left, try again
      if (winterFlashPriceProducts.value.length === 0 && retryCount.value < maxRetries) {
        retryCount.value++
        console.log(`No winter flash price products found, retrying (${retryCount.value}/${maxRetries})`)
        // Clear cache before retrying
        productsStore.clearCache()
        setTimeout(() => fetchWinterFlashPriceProducts(), 1000) // Wait 1 second before retrying
        return
      }
    }
  } catch (err) {
    error.value = 'Flaş fiyat ürünleri yüklenirken bir hata oluştu.'
    console.error('Error fetching winter flash price products:', err)
    
    // Retry on error if we have retries left
    if (retryCount.value < maxRetries) {
      retryCount.value++
      console.log(`Error fetching winter flash price products, retrying (${retryCount.value}/${maxRetries})`)
      // Clear cache before retrying
      productsStore.clearCache()
      setTimeout(() => fetchWinterFlashPriceProducts(), 1000) // Wait 1 second before retrying
      return
    }
  } finally {
    isLoading.value = false
  }
}

// Watch for changes in external products
watch(() => props.externalProducts, (newProducts) => {
  if (newProducts && newProducts.length > 0) {
    winterFlashPriceProducts.value = newProducts
    isLoading.value = props.externalLoading
    error.value = props.externalError
  }
}, { deep: true, immediate: true })

// Watch for changes in the store's sale products
watch(() => productsStore.saleProducts, (newProducts) => {
  // Only update if we're not using external products
  if ((!props.externalProducts || props.externalProducts.length === 0) && newProducts.length > 0) {
    winterFlashPriceProducts.value = newProducts
  }
}, { deep: true })

// Fetch data on component mount
onMounted(() => {
  // Only fetch if external products are not provided
  if (!props.externalProducts || props.externalProducts.length === 0) {
    fetchWinterFlashPriceProducts()
  }
})
</script>

<template>
  <div class="winter-flash-price-container relative overflow-hidden">
    <!-- Winter-themed background elements -->
    <div class="absolute inset-0 z-0">
      <div class="bg-pattern"></div>
    </div>
    
    <!-- Flash Price Section with winter theme -->
    <ProductFlashPrice
      title="FLAŞ FİYATLARI"
      subtitle="İçinizi ısıtacak flaş fiyatlar"
      :products="winterFlashPriceProducts"
      :loading="isLoading"
      :error="error"
      :limit="4"
      view-all-link="/flash-prices"
      view-all-text="Fırsatları Yakala"
      background-color="bg-transparent"
    />
  </div>
</template>

<style scoped>
.winter-flash-price-container {
  position: relative;
  background: linear-gradient(to bottom, #f0f4f8, #ffffff);
  padding: 1px 0; /* Prevent margin collapse */
}

.bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.05;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style> 