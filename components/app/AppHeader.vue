<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const searchQuery = ref('')
const isDropdownOpen = ref(false)
const isMobileMenuOpen = ref(false)
const windowWidth = ref(0)

const categories = [
  { name: 'Living Room', slug: 'living-room' },
  { name: 'Bedroom', slug: 'bedroom' },
  { name: 'Dining Room', slug: 'dining-room' },
  { name: 'Office', slug: 'office' },
  { name: 'Kids & Youth', slug: 'kids-youth' },
  { name: 'Wardrobe & Entryway', slug: 'wardrobe-entryway' }
]

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    navigateTo(`/search?q=${encodeURIComponent(searchQuery.value)}`)
  }
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

onMounted(() => {
  windowWidth.value = window.innerWidth
  window.addEventListener('resize', updateWindowWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowWidth)
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
    <div class="bg-white py-4 border-b border-gray-100 shadow-sm">
      <div class="container mx-auto flex justify-center items-center px-4">
        <!-- Hamburger menu button - visible only on mobile -->
        <button 
          class="lg:hidden text-gray-700 hover:text-amber-700 focus:outline-none" 
          @click="toggleMobileMenu" 
          aria-label="Toggle menu"
        >
          <Icon v-if="!isMobileMenuOpen" name="ph:list" size="28" />
          <Icon v-else name="ph:x" size="28" />
        </button>

        <!-- Search bar - hidden on small mobile, visible on tablet and up -->
        <!-- <div class="relative hidden md:block w-64">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Ara..." 
            class="w-full pl-3 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50" 
            @keyup.enter="handleSearch" 
          />
          <button 
            @click="handleSearch" 
            class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-amber-700"
          >
            <Icon name="ph:magnifying-glass" size="20" />
          </button>
        </div> -->

        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center">
          <h1 class="text-2xl md:text-3xl font-serif font-bold text-amber-900">MEBEL</h1>
        </NuxtLink>

        <!-- User actions - simplified for mobile -->
        <!-- <div class="flex items-center space-x-2 md:space-x-6">
          <NuxtLink to="/account" class="text-gray-700 hover:text-amber-700 transition-colors hidden md:flex items-center">
            <Icon name="ph:user" size="24" class="mr-1" />
            <span class="hidden md:inline">Giriş Yap</span>
          </NuxtLink>
          <NuxtLink to="/account" class="text-gray-700 hover:text-amber-700 transition-colors md:hidden">
            <Icon name="ph:user" size="24" />
          </NuxtLink>
          <NuxtLink to="/favorites" class="text-gray-700 hover:text-amber-700 transition-colors">
            <Icon name="ph:heart" size="24" />
          </NuxtLink>
          <NuxtLink to="/cart" class="text-gray-700 hover:text-amber-700 transition-colors">
            <Icon name="ph:shopping-cart" size="24" />
          </NuxtLink>
        </div> -->
      </div>
    </div>

    <!-- Search bar for mobile - visible only on small screens -->
    <div class="bg-white py-2 px-4 md:hidden">
      <div class="relative">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Ara..." 
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
              to="/living-room" 
              class="text-gray-700 hover:text-amber-700 transition-colors font-medium"
            >
              OTURMA ODASI
            </NuxtLink>
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
        <!-- Mobile user info -->
        <div class="p-4 border-b border-gray-100">
          <span 
            class="flex items-center space-x-2 text-gray-700 cursor-not-allowed opacity-70"
          >
            <Icon name="ph:user" size="24" />
            <span class="font-medium">Giriş Yap / Üye Ol</span>
          </span>
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
                to="/living-room" 
                class="block py-2 text-gray-700 hover:text-amber-700 transition-colors font-medium" 
                @click="closeMobileMenu"
              >
                OTURMA ODASI
              </NuxtLink>
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