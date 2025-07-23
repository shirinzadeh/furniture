<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <!-- Account Header -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between">
          <div class="flex items-center space-x-4">
            <div class="h-16 w-16 bg-amber-100 rounded-full flex items-center justify-center">
              <Icon name="mdi:account" size="32" class="text-amber-600" />
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">
                {{ user?.name || 'Hesabım' }}
              </h1>
              <p class="text-gray-600">{{ user?.email }}</p>
            </div>
          </div>
          <button
            @click="handleLogout"
            class="mt-4 md:mt-0 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Icon name="mdi:logout" size="16" class="mr-2" />
            Çıkış Yap
          </button>
        </div>
      </div>

      <!-- Account Navigation -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Sidebar Navigation -->
        <div class="lg:col-span-1">
          <nav class="bg-white rounded-lg shadow-sm p-4">
            <ul class="space-y-2">
              <li>
                <button
                  @click="activeTab = 'profile'"
                  :class="[
                    'w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    activeTab === 'profile' 
                      ? 'bg-amber-100 text-amber-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  ]"
                >
                  <Icon name="mdi:account-edit" size="16" class="mr-2" />
                  Profil Bilgileri
                </button>
              </li>
              <li>
                <button
                  @click="activeTab = 'orders'"
                  :class="[
                    'w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    activeTab === 'orders' 
                      ? 'bg-amber-100 text-amber-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  ]"
                >
                  <Icon name="mdi:package-variant" size="16" class="mr-2" />
                  Siparişlerim
                </button>
              </li>
              <li>
                <button
                  @click="activeTab = 'favorites'"
                  :class="[
                    'w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    activeTab === 'favorites' 
                      ? 'bg-amber-100 text-amber-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  ]"
                >
                  <Icon name="mdi:heart" size="16" class="mr-2" />
                  Favorilerim
                  <span v-if="favoritesCount > 0" class="ml-2 bg-amber-600 text-white text-xs rounded-full px-2 py-1">
                    {{ favoritesCount }}
                  </span>
                </button>
              </li>
              <li>
                <NuxtLink
                  to="/cart"
                  class="w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <Icon name="mdi:cart" size="16" class="mr-2" />
                  Sepetim
                  <span v-if="cartStore.itemCount > 0" class="ml-2 bg-amber-600 text-white text-xs rounded-full px-2 py-1">
                    {{ cartStore.itemCount }}
                  </span>
                </NuxtLink>
              </li>
              <li>
                <button
                  @click="activeTab = 'addresses'"
                  :class="[
                    'w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    activeTab === 'addresses' 
                      ? 'bg-amber-100 text-amber-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  ]"
                >
                  <Icon name="mdi:map-marker" size="16" class="mr-2" />
                  Adreslerim
                </button>
              </li>
              <li>
                <button
                  @click="activeTab = 'security'"
                  :class="[
                    'w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    activeTab === 'security' 
                      ? 'bg-amber-100 text-amber-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  ]"
                >
                  <Icon name="mdi:security" size="16" class="mr-2" />
                  Güvenlik
                </button>
              </li>
            </ul>
          </nav>
        </div>

        <!-- Main Content -->
        <div class="lg:col-span-3">
          <div class="bg-white rounded-lg shadow-sm">
            <!-- Profile Tab -->
            <div v-if="activeTab === 'profile'" class="p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-6">Profil Bilgileri</h2>
              
              <!-- Profile Form -->
              <form @submit.prevent="updateProfile" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label for="name" class="block text-sm font-medium text-gray-700">
                      Ad Soyad
                    </label>
                    <input
                      id="name"
                      v-model="profileForm.name"
                      type="text"
                      class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  
                  <div>
                    <label for="email" class="block text-sm font-medium text-gray-700">
                      Email Adresi
                    </label>
                    <input
                      id="email"
                      v-model="profileForm.email"
                      type="email"
                      disabled
                      class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-500"
                    />
                    <p class="mt-1 text-xs text-gray-500">
                      Email adresi değiştirilemez
                    </p>
                  </div>
                </div>

                <div class="flex justify-end">
                  <button
                    type="submit"
                    :disabled="profileLoading"
                    class="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 transition-colors"
                  >
                    <Icon v-if="profileLoading" name="mdi:loading" size="16" class="mr-2 animate-spin" />
                    {{ profileLoading ? 'Güncelleniyor...' : 'Bilgileri Güncelle' }}
                  </button>
                </div>
              </form>
            </div>

            <!-- Orders Tab -->
            <div v-else-if="activeTab === 'orders'" class="p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-6">Siparişlerim</h2>
              
              <!-- Orders placeholder -->
              <div class="text-center py-12">
                <Icon name="mdi:package-variant-closed" size="64" class="mx-auto text-gray-400 mb-4" />
                <h3 class="text-lg font-medium text-gray-900 mb-2">Henüz sipariş yok</h3>
                <p class="text-gray-600 mb-6">İlk siparişinizi vermek için alışverişe başlayın</p>
                <NuxtLink 
                  to="/products"
                  class="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
                >
                  <Icon name="mdi:shopping" size="16" class="mr-2" />
                  Alışverişe Başla
                </NuxtLink>
              </div>
            </div>

            <!-- Favorites Tab -->
            <div v-else-if="activeTab === 'favorites'" class="p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-6">Favorilerim</h2>
              
              <!-- Loading State -->
              <div v-if="favoritesStore.loading" class="text-center py-12">
                <Icon name="mdi:loading" size="64" class="mx-auto text-gray-400 mb-4 animate-spin" />
                <p class="text-gray-600">Favoriler yükleniyor...</p>
              </div>
              
              <!-- Favorites List -->
              <div v-else-if="favoritesStore.hasFavorites" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="favorite in favoritesStore.favoriteItems" :key="favorite.id" class="bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div class="aspect-w-16 aspect-h-12">
                    <img 
                      :src="favorite.product.images?.[0] || '/images/placeholder.jpg'" 
                      :alt="favorite.product.name"
                      class="w-full h-48 object-cover"
                    />
                  </div>
                  <div class="p-4">
                    <h3 class="font-semibold text-gray-900 mb-2">{{ favorite.product.name }}</h3>
                    <p class="text-sm text-gray-600 mb-2 line-clamp-2">{{ favorite.product.description }}</p>
                    <div class="flex items-center justify-between">
                      <span class="text-lg font-bold text-amber-600">{{ favorite.product.price }}₺</span>
                      <div class="flex space-x-2">
                        <NuxtLink 
                          :to="`/product/${favorite.product.slug}`"
                          class="px-3 py-1 text-sm bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
                        >
                          İncele
                        </NuxtLink>
                        <button
                          @click="removeFavorite(favorite.productId)"
                          class="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition-colors"
                        >
                          <Icon name="mdi:heart-remove" size="16" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Empty State -->
              <div v-else class="text-center py-12">
                <Icon name="mdi:heart-outline" size="64" class="mx-auto text-gray-400 mb-4" />
                <h3 class="text-lg font-medium text-gray-900 mb-2">Henüz favori ürün yok</h3>
                <p class="text-gray-600 mb-6">Beğendiğiniz ürünleri favorilere ekleyin</p>
                <NuxtLink 
                  to="/products"
                  class="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
                >
                  <Icon name="mdi:shopping" size="16" class="mr-2" />
                  Ürünleri İncele
                </NuxtLink>
              </div>
            </div>

            <!-- Addresses Tab -->
            <div v-else-if="activeTab === 'addresses'" class="p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-6">Adreslerim</h2>
              
              <!-- Addresses placeholder -->
              <div class="text-center py-12">
                <Icon name="mdi:map-marker-outline" size="64" class="mx-auto text-gray-400 mb-4" />
                <h3 class="text-lg font-medium text-gray-900 mb-2">Henüz kayıtlı adres yok</h3>
                <p class="text-gray-600 mb-6">Hızlı teslimat için adreslerinizi kaydedin</p>
                <button class="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors">
                  <Icon name="mdi:plus" size="16" class="mr-2" />
                  Adres Ekle
                </button>
              </div>
            </div>

            <!-- Security Tab -->
            <div v-else-if="activeTab === 'security'" class="p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-6">Güvenlik</h2>
              
              <!-- Password Change Form -->
              <form @submit.prevent="changePassword" class="space-y-6">
                <div>
                  <label for="currentPassword" class="block text-sm font-medium text-gray-700">
                    Mevcut Şifre
                  </label>
                  <input
                    id="currentPassword"
                    v-model="passwordForm.currentPassword"
                    type="password"
                    class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                
                <div>
                  <label for="newPassword" class="block text-sm font-medium text-gray-700">
                    Yeni Şifre
                  </label>
                  <input
                    id="newPassword"
                    v-model="passwordForm.newPassword"
                    type="password"
                    class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                
                <div>
                  <label for="confirmNewPassword" class="block text-sm font-medium text-gray-700">
                    Yeni Şifre Tekrar
                  </label>
                  <input
                    id="confirmNewPassword"
                    v-model="passwordForm.confirmNewPassword"
                    type="password"
                    class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div class="flex justify-end">
                  <button
                    type="submit"
                    :disabled="passwordLoading"
                    class="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 transition-colors"
                  >
                    <Icon v-if="passwordLoading" name="mdi:loading" size="16" class="mr-2 animate-spin" />
                    {{ passwordLoading ? 'Güncelleniyor...' : 'Şifreyi Değiştir' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useAuthStore, useCartStore, useFavoritesStore } from '~/stores'
import { useToast } from '~/composables/useToast'

// Define page meta
definePageMeta({
  middleware: 'auth' // Will create this middleware
})

// Initialize stores
const authStore = useAuthStore()
const cartStore = useCartStore()
const favoritesStore = useFavoritesStore()
const { success, error: toastError } = useToast()

// Component state
const activeTab = ref('profile')
const profileLoading = ref(false)
const passwordLoading = ref(false)

// Get favorites count from store
const favoritesCount = computed(() => favoritesStore.favoriteCount)

// User data
const user = computed(() => authStore.user)

// Forms
const profileForm = reactive({
  name: '',
  email: ''
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: ''
})

// Initialize profile form
const initializeProfileForm = () => {
  if (user.value) {
    profileForm.name = user.value.name || ''
    profileForm.email = user.value.email
  }
}

// Handle logout
const handleLogout = async () => {
  await authStore.logout()
  await navigateTo('/login')
}

// Update profile
const updateProfile = async () => {
  profileLoading.value = true
  
  try {
    await $fetch('/api/auth/profile', {
      method: 'PUT',
      body: {
        name: profileForm.name
      }
    })
    
    // Refresh user data from auth store
    await authStore.fetchProfile()
    
    success('Profil Güncellendi', 'Bilgileriniz başarıyla güncellendi')
  } catch (error: any) {
    toastError('Güncelleme Hatası', error.data?.message || 'Profil güncellenirken bir hata oluştu')
  } finally {
    profileLoading.value = false
  }
}

// Change password
const changePassword = async () => {
  if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
    toastError('Şifre Hatası', 'Yeni şifreler eşleşmiyor')
    return
  }

  if (passwordForm.newPassword.length < 6) {
    toastError('Şifre Hatası', 'Yeni şifre en az 6 karakter olmalıdır')
    return
  }

  passwordLoading.value = true
  
  try {
    await $fetch('/api/auth/password', {
      method: 'PUT',
      body: {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      }
    })
    
    success('Şifre Değiştirildi', 'Şifreniz başarıyla güncellendi')
    
    // Clear form
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmNewPassword = ''
  } catch (error: any) {
    toastError('Şifre Hatası', error.data?.message || 'Şifre değiştirilirken bir hata oluştu')
  } finally {
    passwordLoading.value = false
  }
}

// Meta tags
useHead({
  title: 'Hesabım - MEBEL',
  meta: [
    { name: 'description', content: 'MEBEL hesap bilgilerinizi yönetin' }
  ]
})

// Remove favorite
const removeFavorite = async (productId: string) => {
  try {
    await favoritesStore.removeFavorite(productId)
    success('Favorilerden Çıkarıldı', 'Ürün favorilerinizden kaldırıldı')
  } catch (error: any) {
    toastError('Hata', 'Ürün favorilerden kaldırılırken bir hata oluştu')
  }
}

// Initialize data on mount
onMounted(async () => {
  initializeProfileForm()
  await favoritesStore.initFavorites()
})

// Watch for user changes
watch(user, () => {
  initializeProfileForm()
}, { immediate: true })
</script> 