<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useCartStore, useAuthStore, useCategoriesStore } from '~/stores'
import { TIMEOUTS, PAGINATION, PRODUCT } from '~/composables/useConstants'

const searchQuery = ref('')
const isDropdownOpen = ref(false)
const isMobileMenuOpen = ref(false)
const isSearchFocused = ref(false)
const windowWidth = ref(0)

// Search suggestions
const searchSuggestions = ref<Array<{id: string, name: string, slug: string}>>([])
const isLoadingSearch = ref(false)
const showSuggestions = ref(false)

// Initialize stores and API
const cartStore = useCartStore()
const authStore = useAuthStore()
const categoriesStore = useCategoriesStore()
const { fetchRaw } = useApi()

// Use categories from store with computed for reactivity
const categories = computed(() => {
  // Fallback categories if store is empty or loading
  const fallbackCategories = [
    { name: 'Living Room', slug: 'living-room' },
    { name: 'Bedroom', slug: 'bedroom' },
    { name: 'Dining Room', slug: 'dining-room' },
    { name: 'Office', slug: 'office' },
    { name: 'Kids & Youth', slug: 'kids-youth' },
    { name: 'Wardrobe & Entryway', slug: 'wardrobe-entryway' }
  ]
  
  // Return store categories if available, otherwise fallback
  return categoriesStore.categories.length > 0 
    ? categoriesStore.categories.map(cat => ({ name: cat.name, slug: cat.slug }))
    : fallbackCategories
})

// Debounced search for suggestions
let searchTimeout: NodeJS.Timeout | null = null

const searchProducts = async (query: string) => {
  if (!query.trim() || query.length < PRODUCT.MIN_SEARCH_LENGTH) {
    searchSuggestions.value = []
    showSuggestions.value = false
    return
  }

  try {
    isLoadingSearch.value = true
    const response = await fetchRaw<{products: Array<{_id: string, name: string, slug: string}>}>(`/products?search=${encodeURIComponent(query)}&limit=${PAGINATION.SUGGESTIONS_LIMIT}`)
    searchSuggestions.value = response.products.map(p => ({
      id: p._id,
      name: p.name,
      slug: p.slug
    }))
    showSuggestions.value = true
  } catch (error) {
    console.error('Search error:', error)
    searchSuggestions.value = []
    showSuggestions.value = false
  } finally {
    isLoadingSearch.value = false
  }
}

// Watch search query for suggestions
watch(searchQuery, (newQuery) => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  
  searchTimeout = setTimeout(() => {
    if (isSearchFocused.value) {
      searchProducts(newQuery)
    }
  }, TIMEOUTS.SEARCH_DEBOUNCE)
})

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    showSuggestions.value = false
    navigateTo(`/search?q=${encodeURIComponent(searchQuery.value)}`)
  }
}

const handleSuggestionClick = (suggestion: {slug: string, name: string}) => {
  searchQuery.value = suggestion.name
  showSuggestions.value = false
  navigateTo(`/product/${suggestion.slug}`)
}

const onSearchFocus = () => {
  isSearchFocused.value = true
  if (searchQuery.value.length >= PRODUCT.MIN_SEARCH_LENGTH) {
    searchProducts(searchQuery.value)
  }
}

const onSearchBlur = () => {
  // Delay hiding suggestions to allow clicks
  setTimeout(() => {
    isSearchFocused.value = false
    showSuggestions.value = false
  }, TIMEOUTS.SUGGESTION_HIDE_DELAY)
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  if (import.meta.client) {
    if (isMobileMenuOpen.value) {
      document.body.classList.add('overflow-hidden')
    } else {
      document.body.classList.remove('overflow-hidden')
    }
  }
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
  if (import.meta.client) {
    document.body.classList.remove('overflow-hidden')
  }
}

const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth
  if (windowWidth.value >= 1024 && isMobileMenuOpen.value) {
    closeMobileMenu()
  }
}

onMounted(async () => {
  windowWidth.value = window.innerWidth
  window.addEventListener('resize', updateWindowWidth)
  
  // Load categories from store if not already loaded
  if (categoriesStore.categories.length === 0) {
    try {
      await categoriesStore.fetchCategories()
    } catch (error) {
      console.error('Failed to load categories:', error)
      // Fallback categories will be used automatically
    }
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowWidth)
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
})
</script>

<template>
  <header class="w-full">
    <!-- Top navigation bar - hidden on mobile -->
    <div class="bg-amber-800 text-white py-2 hidden md:block">
      <div class="container mx-auto flex flex-col md:flex-row justify-between items-center px-4">
        <div class="flex flex-wrap justify-center md:justify-start space-x-3 md:space-x-6 mb-2 md:mb-0">
          <span class="text-sm cursor-not-allowed opacity-70">İÇ MİMARLIK</span>
          <span class="text-sm cursor-not-allowed opacity-70">SHOWROOMLAR</span>
          <span class="text-sm cursor-not-allowed opacity-70">MOBİLYA HİZMETLERİ</span>
        </div>
        <div class="flex flex-wrap justify-center md:justify-end space-x-3 md:space-x-6">
          <span class="text-sm cursor-not-allowed opacity-70 flex items-center">
            <span class="mr-1">KAMPANYALAR</span>
            <Icon name="ph:megaphone-simple" size="18" />
          </span>
          <span class="text-sm cursor-not-allowed opacity-70 flex items-center">
            <span class="mr-1">EN YENİLER</span>
            <Icon name="ph:star" size="18" />
          </span>
          <span class="text-sm cursor-not-allowed opacity-70 flex items-center">
            <span class="mr-1">DESTEK</span>
            <Icon name="ph:question" size="18" />
          </span>
        </div>
      </div>
    </div>

    <!-- Main header -->
    <div class="bg-white py-4 border-b border-gray-100 shadow-sm relative overflow-hidden">
      <!-- Gradient background accent -->
      <div class="absolute inset-0 bg-gradient-to-r from-amber-50/30 via-transparent to-amber-50/30"></div>
      
      <div class="container mx-auto flex justify-between items-center px-4 relative z-10">
        <!-- Left section - Hamburger menu + Search -->
        <div class="flex items-center space-x-4">
          <button 
            class="lg:hidden text-gray-700 hover:text-amber-700 focus:outline-none p-2 rounded-lg hover:bg-amber-50 transition-all duration-200" 
            @click="toggleMobileMenu" 
            aria-label="Toggle menu"
          >
            <Icon v-if="!isMobileMenuOpen" name="ph:list" size="28" />
            <Icon v-else name="ph:x" size="28" />
          </button>
          
          <!-- Desktop Search - hidden on mobile/tablet -->
          <div class="hidden lg:block relative">
            <div class="relative">
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Ürün ara..." 
                class="w-64 xl:w-80 pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50 hover:bg-white transition-all duration-200 text-gray-700"
                @keyup.enter="handleSearch"
                @focus="onSearchFocus"
                @blur="onSearchBlur"
              />
              <button 
                @click="handleSearch" 
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-amber-700 transition-colors duration-200"
              >
                <Icon v-if="!isLoadingSearch" name="ph:magnifying-glass" size="20" />
                <Icon v-else name="ph:spinner" size="20" class="animate-spin" />
              </button>
            </div>
            
            <!-- Search Suggestions Dropdown -->
            <div 
              v-show="showSuggestions && searchSuggestions.length > 0"
              class="absolute top-full left-0 right-0 bg-white shadow-xl rounded-lg border border-gray-100 mt-2 z-50 overflow-hidden"
            >
              <div class="py-2">
                <div 
                  v-for="suggestion in searchSuggestions" 
                  :key="suggestion.id"
                  @click="handleSuggestionClick(suggestion)"
                  class="px-4 py-2 hover:bg-amber-50 cursor-pointer flex items-center space-x-3 transition-colors duration-200"
                >
                  <Icon name="ph:magnifying-glass" size="16" class="text-gray-400" />
                  <span class="text-gray-700 hover:text-amber-700">{{ suggestion.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Center section - Logo -->
        <NuxtLink to="/" class="flex items-center group">
          <div class="flex items-center space-x-2">
            <div class="w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-800 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200">
              <Icon name="ph:chair" size="24" class="text-white" />
            </div>
            <h1 class="text-xl sm:text-2xl md:text-3xl font-serif font-bold bg-gradient-to-r from-amber-800 to-amber-900 bg-clip-text text-transparent group-hover:from-amber-700 group-hover:to-amber-800 transition-all duration-200">
              MEBEL
            </h1>
          </div>
        </NuxtLink>

        <!-- Right section - User actions -->
        <div class="flex items-center space-x-1 md:space-x-3">
          <!-- User account link - shown when authenticated -->
          <NuxtLink 
            v-if="authStore.isAuthenticated" 
            to="/account" 
            class="flex items-center p-2 sm:px-3 sm:py-2 rounded-lg text-gray-700 hover:text-amber-700 hover:bg-amber-50 transition-all duration-200 group"
          >
            <Icon name="ph:user" size="24" class="group-hover:scale-110 transition-transform duration-200" />
            <span class="hidden md:inline ml-2 font-medium">Hesabım</span>
          </NuxtLink>
          
          <!-- Login link - shown when not authenticated -->
          <NuxtLink 
            v-else
            to="/login" 
            class="flex items-center p-2 sm:px-3 sm:py-2 rounded-lg text-gray-700 hover:text-amber-700 hover:bg-amber-50 transition-all duration-200 group"
          >
            <Icon name="ph:user" size="24" class="group-hover:scale-110 transition-transform duration-200" />
            <span class="hidden md:inline ml-2 font-medium">Giriş Yap</span>
          </NuxtLink>
          
          <!-- Favorites link -->
          <NuxtLink 
            to="/favorites" 
            class="flex items-center p-2 sm:px-3 sm:py-2rounded-lg text-gray-700 hover:text-amber-700 hover:bg-amber-50 transition-all duration-200 group relative"
          >
            <Icon name="ph:heart" size="24" class="group-hover:scale-110 transition-transform duration-200" />
            <span class="hidden lg:inline ml-2 font-medium">Favoriler</span>
          </NuxtLink>
          
          <!-- Cart link with enhanced badge -->
          <NuxtLink 
            to="/cart" 
            class="flex items-center p-2 sm:px-3 sm:py-2 rounded-lg text-gray-700 hover:text-amber-700 hover:bg-amber-50 transition-all duration-200 group relative"
          >
            <div class="relative">
              <Icon name="ph:shopping-cart" size="24" class="group-hover:scale-110 transition-transform duration-200" />
              <!-- Enhanced cart badge -->
              <span 
                v-if="cartStore.itemCount > 0" 
                class="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg animate-pulse"
              >
                {{ cartStore.itemCount > 99 ? '99+' : cartStore.itemCount }}
              </span>
            </div>
            <span class="hidden lg:inline ml-2 font-medium">Sepet</span>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Search bar for mobile/tablet - visible only on small and medium screens -->
    <div class="bg-white py-2 px-4 lg:hidden">
      <div class="relative">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Ürün ara..." 
          class="w-full pl-3 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50" 
          @keyup.enter="handleSearch" 
        />
        <button 
          @click="handleSearch" 
          class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-amber-700"
        >
          <Icon name="ph:magnifying-glass" size="20" />
        </button>
      </div>
    </div>

    <!-- Category navigation - desktop -->
    <nav class="bg-white shadow-sm hidden lg:block">
      <div class="container mx-auto px-4">
        <ul class="flex flex-wrap space-x-6 xl:space-x-8">
          <li class="relative group py-4" @mouseenter="isDropdownOpen = true" @mouseleave="isDropdownOpen = false">
            <span class="flex items-center text-gray-700 cursor-not-allowed opacity-70 font-medium">
              <span>Tüm Ürünler</span>
              <Icon name="ph:caret-down" size="16" class="ml-1" />
            </span>

            <!-- Dropdown menu -->
            <div 
              v-show="isDropdownOpen" 
              class="absolute left-0 top-full bg-white shadow-lg rounded-b-md w-64 z-50 py-2 border border-gray-100"
            >
              <NuxtLink 
                v-for="category in categories" 
                :key="category.slug" 
                :to="`/${category.slug}`" 
                class="block px-4 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
              >
                {{ category.name }}
              </NuxtLink>
            </div>
          </li>
     
          <li class="py-4">
            <NuxtLink 
              to="/bedroom" 
              class="text-gray-700 hover:text-amber-700 transition-colors font-medium"
            >
              YATAK ODASI
            </NuxtLink>
          </li>
          <li class="py-4">
            <NuxtLink 
              to="/dining-room" 
              class="text-gray-700 hover:text-amber-700 transition-colors font-medium"
            >
              YEMEK ODASI
            </NuxtLink>
          </li>
          <li class="py-4">
            <NuxtLink 
              to="/wardrobe-entryway" 
              class="text-gray-700 hover:text-amber-700 transition-colors font-medium"
            >
              GARDROP & ANTRE
            </NuxtLink>
          </li>
          <li class="py-4">
            <NuxtLink 
              to="/office" 
              class="text-gray-700 hover:text-amber-700 transition-colors font-medium"
            >
              OFİS
            </NuxtLink>
          </li>
          <li class="py-4">
            <NuxtLink 
              to="/kids-youth" 
              class="text-gray-700 hover:text-amber-700 transition-colors font-medium"
            >
              ÇOCUK & GENÇ
            </NuxtLink>
          </li>
        </ul>
      </div>
    </nav>

    <!-- Mobile menu overlay -->
    <div 
      v-if="isMobileMenuOpen" 
      class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
      @click="closeMobileMenu"
    ></div>

    <!-- Mobile menu sidebar -->
    <div 
      class="fixed top-0 left-0 bottom-0 w-4/5 max-w-sm bg-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden overflow-auto" 
      :class="isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="flex justify-between items-center p-4 border-b border-gray-100">
        <h2 class="text-xl font-serif font-bold text-amber-900">Menü</h2>
        <button 
          @click="closeMobileMenu" 
          class="text-gray-700 hover:text-amber-700 transition-colors focus:outline-none" 
          aria-label="Close menu"
        >
          <Icon name="ph:x" size="24" />
        </button>
      </div>

      <div class="overflow-y-auto h-full pb-20">
        <!-- Mobile user info and cart -->
        <div class="p-4 border-b border-gray-100 space-y-4">
          <!-- Mobile user account/login -->
          <NuxtLink 
            :to="authStore.isAuthenticated ? '/account' : '/login'"
            class="flex items-center space-x-3 text-gray-700 hover:text-amber-700 transition-colors p-2 rounded-lg hover:bg-amber-50"
            @click="closeMobileMenu"
          >
            <div class="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <Icon name="ph:user" size="20" class="text-amber-700" />
            </div>
            <div class="flex flex-col">
              <span class="font-medium">
                {{ authStore.isAuthenticated ? 'Hesabım' : 'Giriş Yap' }}
              </span>
              <span v-if="authStore.user" class="text-sm text-gray-500">
                {{ authStore.user.name }}
              </span>
            </div>
          </NuxtLink>
          
          <!-- Mobile favorites link -->
          <NuxtLink 
            to="/favorites" 
            class="flex items-center space-x-3 text-gray-700 hover:text-amber-700 transition-colors p-2 rounded-lg hover:bg-amber-50"
            @click="closeMobileMenu"
          >
            <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Icon name="ph:heart" size="20" class="text-red-600" />
            </div>
            <span class="font-medium">Favorilerim</span>
          </NuxtLink>
          
          <!-- Mobile cart link -->
          <NuxtLink 
            to="/cart" 
            class="flex items-center justify-between text-gray-700 hover:text-amber-700 transition-colors p-2 rounded-lg hover:bg-amber-50"
            @click="closeMobileMenu"
          >
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center relative">
                <Icon name="ph:shopping-cart" size="20" class="text-amber-700" />
                <span 
                  v-if="cartStore.itemCount > 0" 
                  class="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                >
                  {{ cartStore.itemCount > 99 ? '99+' : cartStore.itemCount }}
                </span>
              </div>
              <div class="flex flex-col">
                <span class="font-medium">Sepetim</span>
                <span v-if="cartStore.itemCount > 0" class="text-sm text-gray-500">
                  {{ cartStore.itemCount }} ürün
                </span>
              </div>
            </div>
          </NuxtLink>
        </div>

        <!-- Mobile navigation -->
        <nav class="p-4">
          <ul class="space-y-4">
            <li>
              <NuxtLink 
                to="/products" 
                class="block py-2 text-gray-700 hover:text-amber-700 transition-colors font-medium" 
                @click="closeMobileMenu"
              >
                Tüm Ürünler
              </NuxtLink>
              <ul class="pl-4 mt-2 space-y-2 border-l border-gray-200">
                <li v-for="category in categories" :key="category.slug">
                  <NuxtLink 
                    :to="`/${category.slug}`" 
                    class="block py-1 text-gray-600 hover:text-amber-700 transition-colors" 
                    @click="closeMobileMenu"
                  >
                    {{ category.name }}
                  </NuxtLink>
                </li>
              </ul>
            </li>
           
            <li>
              <NuxtLink 
                to="/bedroom" 
                class="block py-2 text-gray-700 hover:text-amber-700 transition-colors font-medium" 
                @click="closeMobileMenu"
              >
                YATAK ODASI
              </NuxtLink>
            </li>
            <li>
              <NuxtLink 
                to="/dining-room" 
                class="block py-2 text-gray-700 hover:text-amber-700 transition-colors font-medium" 
                @click="closeMobileMenu"
              >
                YEMEK ODASI
              </NuxtLink>
            </li>
            <li>
              <NuxtLink 
                to="/wardrobe-entryway" 
                class="block py-2 text-gray-700 hover:text-amber-700 transition-colors font-medium" 
                @click="closeMobileMenu"
              >
                GARDROP & ANTRE
              </NuxtLink>
            </li>
            <li>
              <NuxtLink 
                to="/office" 
                class="block py-2 text-gray-700 hover:text-amber-700 transition-colors font-medium" 
                @click="closeMobileMenu"
              >
                OFİS
              </NuxtLink>
            </li>
            <li>
              <NuxtLink 
                to="/kids-youth" 
                class="block py-2 text-gray-700 hover:text-amber-700 transition-colors font-medium" 
                @click="closeMobileMenu"
              >
                ÇOCUK & GENÇ
              </NuxtLink>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* Prevent scrolling when mobile menu is open */
:global(body.overflow-hidden) {
  overflow: hidden;
}
</style>