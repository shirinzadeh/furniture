<script setup lang="ts">
import type { Category } from '~/types'

const props = defineProps<{
  categories: Category[] | { categories: Category[] }
  loading?: boolean
  error?: string | null
}>()

// Normalize categories to always be an array
const normalizedCategories = computed(() => {
  if (Array.isArray(props.categories)) {
    return props.categories
  } else if (props.categories && 'categories' in props.categories) {
    return props.categories.categories
  }
  return []
})

// Limit to maximum 4 categories
const featuredCategories = computed(() => {
  return normalizedCategories.value.slice(0, 4)
})

// Hover state for animation effects
const hoveredCategory = ref<string | null>(null)

// Set hovered category
const setHovered = (id: string | null) => {
  hoveredCategory.value = id
}
</script>

<template>
  <section class="py-16 bg-gray-50">
    <div class="container mx-auto px-4">
      <div class="flex flex-col items-center mb-12">
        <h2 class="text-3xl md:text-4xl font-bold text-center mb-3">Featured Categories</h2>
        <p class="mt-4 text-gray-600 text-center max-w-2xl">
          Explore our curated selection of premium furniture categories
        </p>
      </div>
      
      <!-- Loading state -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div 
          v-for="i in 4" 
          :key="i" 
          class="bg-gray-200 animate-pulse rounded-xl h-80"
        ></div>
      </div>
      
      <!-- Error state -->
      <div v-else-if="error" class="text-center text-red-500 py-8">
        {{ error }}
      </div>
      
      <!-- Empty state -->
      <div v-else-if="normalizedCategories.length === 0" class="text-center text-gray-500 py-8">
        No categories available at the moment.
      </div>
      
      <!-- Categories grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <NuxtLink 
          v-for="category in featuredCategories" 
          :key="category.id" 
          :to="`/categories/${category.slug}`"
          class="group relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl"
          @mouseenter="setHovered(category.id)"
          @mouseleave="setHovered(null)"
        >
          <div class=" overflow-hidden">
            <NuxtImg
              :src="category.image || '/images/placeholder.jpg'"
              :alt="category.name"
              class="w-full h-full object-cover transition-all duration-500"
              :class="{ 'scale-110': hoveredCategory === category.id }"
              format="webp"
              quality="80"
              loading="lazy"
            />
          </div>
          
          <div 
            class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex flex-col justify-end p-6 transition-all duration-300"
            :class="{ 'from-black/80 via-black/50': hoveredCategory === category.id }"
          >
            <h3 
              class="text-white text-xl md:text-2xl font-bold mb-2 transform transition-transform duration-300"
              :class="{ 'translate-y-0': hoveredCategory === category.id, 'translate-y-2': hoveredCategory !== category.id }"
            >
              {{ category.name }}
            </h3>
            
            <div 
              class="flex items-center justify-between opacity-0 transform translate-y-4 transition-all duration-300"
              :class="{ 'opacity-100 translate-y-0': hoveredCategory === category.id }"
            >
              <span class="text-white text-sm">
                {{ category._count?.products || 0 }} products
              </span>
              <span class="text-white bg-indigo-600 rounded-full p-2 inline-flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </span>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template> 