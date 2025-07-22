<script setup lang="ts">
import { useCartStore } from '~/stores'
import { useToast } from '~/composables/useToast'

const cartStore = useCartStore()
const { cartUpdated, cartRemoved, cartCleared } = useToast()

// Update quantity
function updateQuantity(productId: string, quantity: number) {
  if (quantity < 1) return
  
  const item = cartStore.items.find(item => item.productId === productId)
  if (item) {
    cartStore.updateQuantity(productId, quantity)
    cartUpdated(item.name, quantity)
  }
}

// Remove item
function removeItem(productId: string) {
  const item = cartStore.items.find(item => item.productId === productId)
  if (item) {
    cartStore.removeItem(productId)
    cartRemoved(item.name)
  }
}

// Clear cart
function clearCart() {
  cartStore.clearCart()
  cartCleared()
}

// Format price
function formatPrice(price: number) {
  return price.toLocaleString('tr-TR')
}

// Update meta tags
useHead({
  title: 'Alışveriş Sepeti',
  meta: [
    { name: 'description', content: 'Alışveriş sepetinizi görüntüleyin ve yönetin' }
  ]
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Alışveriş Sepeti</h1>
    
    <div v-if="cartStore.isEmpty" class="text-center py-12 bg-gray-50 rounded-lg">
      <Icon name="mdi:cart-outline" size="64" class="mx-auto text-gray-400 mb-4" />
      <h2 class="text-2xl font-bold mb-2">Sepetiniz Boş</h2>
      <p class="text-gray-600 mb-6">Sepetinizde henüz ürün bulunmamaktadır.</p>
      <NuxtLink 
        to="/products" 
        class="inline-block bg-gray-800 text-white px-6 py-3 rounded-md font-medium hover:bg-gray-700 transition-colors"
      >
        Alışverişe Başla
      </NuxtLink>
    </div>
    
    <div v-else class="flex flex-col lg:flex-row gap-8">
      <!-- Cart items -->
      <div class="w-full lg:w-2/3">
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="p-4 border-b flex justify-between items-center">
            <h2 class="text-lg font-bold">Ürünler ({{ cartStore.count }})</h2>
            <button 
              @click="clearCart"
              class="text-red-500 hover:text-red-700 text-sm font-medium"
            >
              Sepeti Temizle
            </button>
          </div>
          
          <ul class="divide-y divide-gray-200">
            <li v-for="item in cartStore.items" :key="item.productId" class="p-4">
              <div class="flex flex-col sm:flex-row gap-4">
                <!-- Product image -->
                <div class="w-full sm:w-24 h-24 flex-shrink-0">
                  <NuxtImg
                    :src="item.image"
                    :alt="item.name"
                    class="w-full h-full object-cover rounded-md"
                    format="webp"
                    quality="80"
                  />
                </div>
                
                <!-- Product details -->
                <div class="flex-grow">
                  <div class="flex flex-col sm:flex-row justify-between">
                    <div>
                      <h3 class="font-medium">
                        <NuxtLink :to="`/product/${item.slug}`" class="hover:text-gray-600">
                          {{ item.name }}
                        </NuxtLink>
                      </h3>
                      <p v-if="item.product?.category" class="text-sm text-gray-500">
                        Kategori: {{ item.product?.category?.name }}
                      </p>
                    </div>
                    
                    <div class="mt-2 sm:mt-0 text-right">
                      <div v-if="item.salePrice" class="font-bold text-red-500">
                        {{ formatPrice(item.salePrice) }} TL
                      </div>
                      <div v-else class="font-bold">
                        {{ formatPrice(item.price) }} TL
                      </div>
                      
                      <!-- Show total price for multiple items -->
                      <div v-if="item.quantity > 1" class="text-sm text-gray-500">
                        {{ item.quantity }} × {{ formatPrice(item.salePrice || item.price) }} TL
                      </div>
                    </div>
                  </div>
                  
                  <div class="flex justify-between items-center mt-4">
                    <!-- Quantity selector -->
                    <div class="flex items-center">
                      <button 
                        @click="updateQuantity(item.productId, item.quantity - 1)"
                        class="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l-md hover:bg-gray-50"
                        :disabled="item.quantity <= 1"
                      >
                        <Icon name="mdi:minus" size="16" />
                      </button>
                      <input 
                        :value="item.quantity"
                        @input="updateQuantity(item.productId, parseInt(($event.target as HTMLInputElement).value) || 1)"
                        type="number" 
                        min="1"
                        class="w-12 h-8 border-y border-gray-300 text-center focus:outline-none focus:ring-2 focus:ring-gray-200"
                      />
                      <button 
                        @click="updateQuantity(item.productId, item.quantity + 1)"
                        class="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r-md hover:bg-gray-50"
                      >
                        <Icon name="mdi:plus" size="16" />
                      </button>
                    </div>
                    
                    <!-- Remove button -->
                    <button 
                      @click="removeItem(item.productId)"
                      class="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Icon name="mdi:delete" size="20" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
      
      <!-- Order summary -->
      <div class="w-full lg:w-1/3">
        <div class="bg-white rounded-lg shadow-md p-6 sticky top-4">
          <h2 class="text-lg font-bold mb-4">Sipariş Özeti</h2>
          
          <div class="space-y-3 mb-6">
            <div class="flex justify-between">
              <span class="text-gray-600">Ara Toplam</span>
              <span>{{ formatPrice(cartStore.total) }} TL</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Kargo</span>
              <span class="text-green-600 font-medium">Ücretsiz</span>
            </div>
            <div class="border-t pt-3 flex justify-between font-bold text-lg">
              <span>Toplam</span>
              <span>{{ formatPrice(cartStore.total) }} TL</span>
            </div>
          </div>
          
          <NuxtLink 
            to="/checkout" 
            class="w-full bg-gray-800 text-white py-3 rounded-md font-medium hover:bg-gray-700 transition-colors flex items-center justify-center mb-4"
          >
            <Icon name="mdi:credit-card" size="20" class="mr-2" />
            Ödeme Adımına Geç
          </NuxtLink>
          
          <div class="space-y-3">
            <div class="flex items-center text-sm text-gray-600">
              <Icon name="mdi:credit-card" size="18" class="mr-3 text-gray-500" />
              <span>Peşin Fiyatına 9 Taksit</span>
            </div>
            <div class="flex items-center text-sm text-gray-600">
              <Icon name="mdi:truck-delivery" size="18" class="mr-3 text-gray-500" />
              <span>Hızlı Teslimat</span>
            </div>
            <div class="flex items-center text-sm text-gray-600">
              <Icon name="mdi:shield-check" size="18" class="mr-3 text-gray-500" />
              <span>Güvenli Ödeme</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 