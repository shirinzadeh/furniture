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

// State for winter flash sale products
const winterFlashSaleProducts = ref<Product[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)
const retryCount = ref(0)
const maxRetries = 3

// Fetch winter flash sale products with retry mechanism
const fetchWinterFlashSaleProducts = async () => {
  // If external products are provided, use them
  if (props.externalProducts && props.externalProducts.length > 0) {
    winterFlashSaleProducts.value = props.externalProducts
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
      winterFlashSaleProducts.value = productsStore.saleProducts
      
      // If no products found but we have retries left, try again
      if (winterFlashSaleProducts.value.length === 0 && retryCount.value < maxRetries) {
        retryCount.value++
        console.log(`No winter flash sale products found, retrying (${retryCount.value}/${maxRetries})`)
        // Clear cache before retrying
        productsStore.clearCache()
        setTimeout(() => fetchWinterFlashSaleProducts(), 1000) // Wait 1 second before retrying
        return
      }
    }
  } catch (err) {
    error.value = 'Flaş indirim ürünleri yüklenirken bir hata oluştu.'
    console.error('Error fetching winter flash sale products:', err)
    
    // Retry on error if we have retries left
    if (retryCount.value < maxRetries) {
      retryCount.value++
      console.log(`Error fetching winter flash sale products, retrying (${retryCount.value}/${maxRetries})`)
      // Clear cache before retrying
      productsStore.clearCache()
      setTimeout(() => fetchWinterFlashSaleProducts(), 1000) // Wait 1 second before retrying
      return
    }
  } finally {
    isLoading.value = false
  }
}

// Watch for changes in external products
watch(() => props.externalProducts, (newProducts) => {
  if (newProducts && newProducts.length > 0) {
    winterFlashSaleProducts.value = newProducts
    isLoading.value = props.externalLoading
    error.value = props.externalError
  }
}, { deep: true, immediate: true })

// Watch for changes in the store's sale products
watch(() => productsStore.saleProducts, (newProducts) => {
  // Only update if we're not using external products
  if ((!props.externalProducts || props.externalProducts.length === 0) && newProducts.length > 0) {
    winterFlashSaleProducts.value = newProducts
  }
}, { deep: true })

// Fetch data on component mount
onMounted(() => {
  // Only fetch if external products are not provided
  if (!props.externalProducts || props.externalProducts.length === 0) {
    fetchWinterFlashSaleProducts()
  }
})
</script>

<template>
  <div class="winter-flash-sale-container relative overflow-hidden">
    <!-- Winter-themed background elements -->
    <div class="absolute inset-0 z-0">
      <div class="snowflake" v-for="i in 20" :key="i"></div>
    </div>
    
    <!-- Flash Sale Section with winter theme -->
    <ProductFlashSale
      title="KIŞIN EN FLAŞ FİYATLARI"
      subtitle="Kış sezonu için özel indirimli ürünleri keşfedin"
      :products="winterFlashSaleProducts"
      :loading="isLoading"
      :error="error"
      :limit="4"
      view-all-link="/winter-flash-sales"
      view-all-text="Fırsatları Yakala"
      background-color="bg-gradient-to-b from-blue-200 to-white"
    />
  </div>
</template>

<style scoped>
.winter-flash-sale-container {
  position: relative;
}

/* Snowflake animation */
.snowflake {
  position: absolute;
  width: 10px;
  height: 10px;
  background: white;
  border-radius: 50%;
  filter: drop-shadow(0 0 10px white);
}

.snowflake:nth-child(1) { top: 10%; left: 5%; animation: snowfall 15s linear infinite; }
.snowflake:nth-child(2) { top: 20%; left: 15%; animation: snowfall 12s linear infinite 1s; }
.snowflake:nth-child(3) { top: 5%; left: 25%; animation: snowfall 10s linear infinite 2s; }
.snowflake:nth-child(4) { top: 15%; left: 35%; animation: snowfall 14s linear infinite 0.5s; }
.snowflake:nth-child(5) { top: 25%; left: 45%; animation: snowfall 16s linear infinite 1.5s; }
.snowflake:nth-child(6) { top: 5%; left: 55%; animation: snowfall 13s linear infinite 2.5s; }
.snowflake:nth-child(7) { top: 15%; left: 65%; animation: snowfall 11s linear infinite 0.2s; }
.snowflake:nth-child(8) { top: 25%; left: 75%; animation: snowfall 15s linear infinite 1.2s; }
.snowflake:nth-child(9) { top: 5%; left: 85%; animation: snowfall 12s linear infinite 2.2s; }
.snowflake:nth-child(10) { top: 15%; left: 95%; animation: snowfall 10s linear infinite 0.7s; }
.snowflake:nth-child(11) { top: 30%; left: 10%; animation: snowfall 14s linear infinite 1.7s; }
.snowflake:nth-child(12) { top: 40%; left: 20%; animation: snowfall 16s linear infinite 2.7s; }
.snowflake:nth-child(13) { top: 30%; left: 30%; animation: snowfall 13s linear infinite 0.3s; }
.snowflake:nth-child(14) { top: 40%; left: 40%; animation: snowfall 11s linear infinite 1.3s; }
.snowflake:nth-child(15) { top: 30%; left: 50%; animation: snowfall 15s linear infinite 2.3s; }
.snowflake:nth-child(16) { top: 40%; left: 60%; animation: snowfall 12s linear infinite 0.8s; }
.snowflake:nth-child(17) { top: 30%; left: 70%; animation: snowfall 10s linear infinite 1.8s; }
.snowflake:nth-child(18) { top: 40%; left: 80%; animation: snowfall 14s linear infinite 2.8s; }
.snowflake:nth-child(19) { top: 30%; left: 90%; animation: snowfall 16s linear infinite 0.4s; }
.snowflake:nth-child(20) { top: 40%; left: 100%; animation: snowfall 13s linear infinite 1.4s; }

@keyframes snowfall {
  0% {
    transform: translateY(0) rotate(0deg);
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
  }
}
</style> 