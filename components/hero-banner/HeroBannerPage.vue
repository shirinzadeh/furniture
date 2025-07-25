<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  highlightedText: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    required: true
  },
  colorScheme: {
    type: String,
    default: 'amber', // Default color scheme
    validator: (value: string) => {
      return ['amber', 'blue', 'green', 'purple', 'rose', 'teal', 'indigo', 'cyan'].includes(value)
    }
  }
})

// Map color scheme to Tailwind classes
const gradientClasses = computed(() => {
  switch (props.colorScheme) {
    case 'blue':
      return 'from-blue-50 to-gray-50'
    case 'green':
      return 'from-green-50 to-gray-50'
    case 'purple':
      return 'from-purple-50 to-gray-50'
    case 'rose':
      return 'from-rose-50 to-gray-50'
    case 'teal':
      return 'from-teal-50 to-gray-50'
    case 'indigo':
      return 'from-indigo-50 to-gray-50'
    case 'cyan':
      return 'from-cyan-50 to-gray-50'
    case 'amber':
    default:
      return 'from-amber-50 to-gray-50'
  }
})

const accentColor = computed(() => {
  switch (props.colorScheme) {
    case 'blue':
      return 'text-blue-800'
    case 'green':
      return 'text-green-800'
    case 'purple':
      return 'text-purple-800'
    case 'rose':
      return 'text-rose-800'
    case 'teal':
      return 'text-teal-800'
    case 'indigo':
      return 'text-indigo-800'
    case 'cyan':
      return 'text-cyan-800'
    case 'amber':
    default:
      return 'text-amber-800'
  }
})

const decorativeColor1 = computed(() => {
  switch (props.colorScheme) {
    case 'blue':
      return 'bg-blue-100'
    case 'green':
      return 'bg-green-100'
    case 'purple':
      return 'bg-purple-100'
    case 'rose':
      return 'bg-rose-100'
    case 'teal':
      return 'bg-teal-100'
    case 'indigo':
      return 'bg-indigo-100'
    case 'cyan':
      return 'bg-cyan-100'
    case 'amber':
    default:
      return 'bg-amber-100'
  }
})

const decorativeColor2 = computed(() => {
  switch (props.colorScheme) {
    case 'blue':
      return 'bg-blue-200'
    case 'green':
      return 'bg-green-200'
    case 'purple':
      return 'bg-purple-200'
    case 'rose':
      return 'bg-rose-200'
    case 'teal':
      return 'bg-teal-200'
    case 'indigo':
      return 'bg-indigo-200'
    case 'cyan':
      return 'bg-cyan-200'
    case 'amber':
    default:
      return 'bg-amber-200'
  }
})
</script>

<template>
  <div class="relative overflow-hidden" :class="['bg-gradient-to-r', gradientClasses]">
    <div class="container mx-auto px-4 py-16 md:py-24">
      <div class="max-w-3xl relative z-10">
        <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-medium text-gray-900 mb-6">
          <template v-if="highlightedText">
            {{ title.replace(highlightedText, '') }} <span :class="accentColor">{{ highlightedText }}</span>
          </template>
          <template v-else>
            {{ title }}
          </template>
        </h1>
        <p class="text-lg md:text-xl text-gray-700 leading-relaxed">
          {{ description }}
        </p>
        <!-- Optional slot for additional content -->
        <slot name="additional-content"></slot>
      </div>
    </div>
    <!-- Decorative elements -->
    <div class="absolute -right-6 -bottom-6 hidden md:block">
      <div class="w-64 h-64 rounded-full opacity-50" :class="decorativeColor1"></div>
    </div>
    <div class="absolute right-20 top-16 hidden lg:block">
      <div class="w-32 h-32 rounded-full opacity-30" :class="decorativeColor2"></div>
    </div>
  </div>
</template>

<style scoped>
/* Typography enhancements */
h1 {
  font-family: 'Playfair Display', Georgia, serif;
}
</style> 