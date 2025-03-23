<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Category } from '~/types'
import { useCategoriesStore } from '~/stores'

// SEO metadata
useHead({
  title: 'Kategoriler | Mebel',
  meta: [
    { name: 'description', content: 'Mebel\'de tüm mobilya kategorilerini keşfedin. Oturma odası, yatak odası, yemek odası ve daha fazlası.' }
  ]
})

// State for categories
const categories = ref<Category[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)
const retryCount = ref(0)
const maxRetries = 3

// Pinia store for categories
const categoriesStore = useCategoriesStore()

// Fetch categories with timeout and retry mechanism
const fetchCategories = async () => {
  isLoading.value = true
  error.value = null
  
  // Set a timeout to prevent infinite loading
  const timeoutId = setTimeout(() => {
    if (isLoading.value) {
      console.log('Categories fetch timeout, using fallback data')
      isLoading.value = false
      
      // If we have categories in the store, use them
      if (categoriesStore.categories.length > 0) {
        categories.value = categoriesStore.categories
      } else if (retryCount.value < maxRetries) {
        // Try again
        retryCount.value++
        console.log(`Retrying categories fetch (${retryCount.value}/${maxRetries})...`)
        fetchCategories()
      } else {
        // Show error after max retries
        error.value = 'Kategoriler yüklenirken zaman aşımı oluştu. Lütfen daha sonra tekrar deneyin.'
      }
    }
  }, 10000) // 10 second timeout
  
  try {
    const response = await categoriesStore.fetchCategories()
    
    // Clear the timeout since we got a response
    clearTimeout(timeoutId)
    
    if (response && response.length > 0) {
      categories.value = response
      retryCount.value = 0 // Reset retry count on success
    } else if (categoriesStore.categories.length > 0) {
      // Use categories from store if available
      categories.value = categoriesStore.categories
    } else {
      // No categories found
      categories.value = []
    }
  } catch (err) {
    // Clear the timeout since we got an error
    clearTimeout(timeoutId)
    
    console.error('Error fetching categories:', err)
    
    // Retry logic
    if (retryCount.value < maxRetries) {
      retryCount.value++
      console.log(`Retrying categories fetch (${retryCount.value}/${maxRetries})...`)
      setTimeout(fetchCategories, 1000) // Wait 1 second before retrying
      return
    }
    
    error.value = 'Kategoriler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.'
  } finally {
    // Only set loading to false if the timeout hasn't already done it
    clearTimeout(timeoutId)
    isLoading.value = false
  }
}

// Fetch data on component mount
onMounted(fetchCategories)
</script>

<template>
  <div>
    <!-- Hero Banner with Parallax Effect -->
    <div class="relative overflow-hidden bg-gradient-to-r from-gray-50 to-gray-100">
      <div class="absolute inset-0 pattern-bg opacity-10"></div>
      <div class="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div class="max-w-4xl">
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 leading-tight">
            <span class="relative inline-block">
              <span class="relative z-10">Kategoriler</span>
              <span class="absolute bottom-2 left-0 w-full h-3 bg-amber-200 opacity-50 -z-10"></span>
            </span>
          </h1>
          <p class="text-lg md:text-xl text-gray-700 max-w-2xl leading-relaxed">
            Mebel'de tüm mobilya kategorilerini keşfedin. Evinizin her köşesi için özenle seçilmiş, 
            kaliteli ve şık mobilyalar ile yaşam alanlarınızı yeniden tasarlayın.
          </p>
        </div>
      </div>
      
      <!-- Decorative elements -->
      <div class="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-amber-100 opacity-50"></div>
      <div class="absolute top-16 -right-8 w-32 h-32 rounded-full bg-gray-200 opacity-40"></div>
      <div class="absolute -top-8 left-1/2 w-24 h-24 rounded-full bg-gray-300 opacity-30"></div>
    </div>
    
    <div class="container mx-auto px-4 py-12 md:py-16">
      <!-- Breadcrumbs -->
      <div class="mb-8">
        <ul class="flex text-sm text-gray-600">
          <li class="flex items-center">
            <NuxtLink to="/" class="hover:text-gray-900 transition-colors">Ana Sayfa</NuxtLink>
            <span class="mx-2">/</span>
          </li>
          <li class="text-gray-900 font-medium">Kategoriler</li>
        </ul>
      </div>
      
      <!-- Loading State -->
      <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        <div 
          v-for="i in 8" 
          :key="i" 
          class="bg-gray-200 animate-pulse rounded-xl h-72 shadow-sm"
        ></div>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-100 rounded-xl p-8 text-center">
        <div class="flex flex-col items-center">
          <div class="bg-red-100 p-3 rounded-full mb-4">
            <Icon name="mdi:alert-circle-outline" class="text-red-500" size="32" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Bir Hata Oluştu</h3>
          <p class="text-gray-600 mb-6">{{ error }}</p>
          <button 
            @click="fetchCategories" 
            class="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <Icon name="mdi:refresh" size="20" />
            Tekrar Dene
          </button>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-else-if="categories.length === 0" class="bg-gray-50 border border-gray-100 rounded-xl p-12 text-center">
        <div class="flex flex-col items-center">
          <div class="bg-gray-100 p-4 rounded-full mb-4">
            <Icon name="mdi:folder-outline" class="text-gray-500" size="32" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Henüz Kategori Bulunmamaktadır</h3>
          <p class="text-gray-600 max-w-md mx-auto">Çok yakında yeni kategoriler eklenecektir. Lütfen daha sonra tekrar ziyaret edin.</p>
        </div>
      </div>
      
      <!-- Categories Grid -->
      <div v-else>
        <div class="grid-layout">
          <div 
            v-for="(category, index) in categories" 
            :key="category.id" 
            :class="[
              'grid-item',
              index % 5 === 0 ? 'grid-item--width2 grid-item--height2' : '',
              index % 7 === 3 ? 'grid-item--height2' : '',
              index % 3 === 2 ? 'grid-item--width2' : ''
            ]"
          >
            <NuxtLink 
              :to="`/categories/${category.slug}`"
              class="category-card group h-full"
            >
              <div class="relative h-full overflow-hidden rounded-xl">
                <NuxtImg
                  :src="category.image || '/images/placeholder.jpg'"
                  :alt="category.name"
                  class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  format="webp"
                  quality="85"
                  loading="lazy"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/40 to-transparent"></div>
                
                <div class="absolute inset-0 flex flex-col justify-end p-6">
                  <h3 class="text-xl font-bold text-white mb-1 group-hover:translate-y-0 translate-y-2 transition-transform duration-300">
                    {{ category.name }}
                  </h3>
                  <div class="w-10 h-0.5 bg-amber-400 mb-3 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                  <p v-if="category.description" class="text-gray-200 text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {{ category.description }}
                  </p>
                  
                  <div class="flex justify-between items-center mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span class="text-xs text-white bg-gray-800/60 backdrop-blur-sm px-2 py-1 rounded-full">
                      {{ category._count?.products || 0 }} ürün
                    </span>
                    <span class="text-white bg-amber-500/90 backdrop-blur-sm p-1.5 rounded-full inline-flex">
                      <Icon name="mdi:arrow-right" size="16" />
                    </span>
                  </div>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>
        
        <!-- Featured Categories Section (Optional) -->
        <div class="mt-16 pt-12 border-t border-gray-100">
          <div class="flex justify-between items-center mb-8">
            <h2 class="text-2xl font-bold text-gray-900">
              <span class="relative inline-block">
                <span class="relative z-10">Popüler Kategoriler</span>
                <span class="absolute bottom-1 left-0 w-full h-2 bg-amber-200 opacity-40 -z-10"></span>
              </span>
            </h2>
            <NuxtLink to="/categories" class="text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-1 group">
              Tümünü Gör
              <Icon name="mdi:arrow-right" size="18" class="transform group-hover:translate-x-1 transition-transform duration-300" />
            </NuxtLink>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <NuxtLink 
              v-for="category in categories.slice(0, 3)" 
              :key="`featured-${category.id}`" 
              :to="`/categories/${category.slug}`"
              class="featured-category-card group"
            >
              <div class="relative overflow-hidden rounded-xl">
                <div class="flex items-center p-5 bg-white">
                  <div class="w-20 h-20 rounded-lg overflow-hidden mr-5 flex-shrink-0 shadow-sm">
                    <NuxtImg
                      :src="category.image || '/images/placeholder.jpg'"
                      :alt="category.name"
                      class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      format="webp"
                      quality="80"
                      loading="lazy"
                    />
                  </div>
                  <div class="flex-1">
                    <h3 class="font-semibold text-gray-900 text-lg mb-1 group-hover:text-gray-800">{{ category.name }}</h3>
                    <p class="text-sm text-gray-500 mb-2 line-clamp-1" v-if="category.description">
                      {{ category.description }}
                    </p>
                    <div class="flex items-center">
                      <span class="inline-flex items-center text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                        <Icon name="mdi:tag-multiple-outline" size="14" class="mr-1" />
                        {{ category._count?.products || 0 }} ürün
                      </span>
                      <span class="ml-auto text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center">
                        Keşfet
                        <Icon name="mdi:arrow-right" size="16" class="ml-1 transform group-hover:translate-x-1 transition-transform duration-300" />
                      </span>
                    </div>
                  </div>
                </div>
                <div class="absolute inset-0 border-2 border-transparent group-hover:border-amber-200 rounded-xl transition-colors duration-300 pointer-events-none"></div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.category-card {
  @apply bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300;
}

.category-card:hover {
  transform: translateY(-4px);
}

.featured-category-card {
  @apply transition-all duration-300;
}

.featured-category-card:hover {
  transform: translateY(-2px);
}

.pattern-bg {
  background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23000000' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E");
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

/* Grid Layout Styles */
.grid-layout {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  grid-auto-rows: 280px;
  grid-auto-flow: dense;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .grid-layout {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    grid-auto-rows: 300px;
  }
}

.grid-item {
  grid-column: span 1;
  grid-row: span 1;
}

.grid-item--width2 {
  grid-column: span 2;
}

.grid-item--height2 {
  grid-row: span 2;
}

@media (max-width: 767px) {
  .grid-item--width2,
  .grid-item--height2 {
    grid-column: span 1;
    grid-row: span 1;
  }
}

@media (min-width: 1280px) {
  .grid-layout {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    grid-auto-rows: 320px;
  }
}
</style> 