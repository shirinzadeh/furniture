<template>
  <div 
    class="fixed top-4 right-4 z-50 flex flex-col gap-3 min-w-96"
    @mouseenter="setToastContainerHovered(true)"
    @mouseleave="setToastContainerHovered(false)"
  >
    <transition-group name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="px-4 py-3 rounded-lg shadow-xl flex items-start justify-between backdrop-blur-sm border relative overflow-hidden"
        :class="[
          toastTypeClasses[toast.type].bg,
          toastTypeClasses[toast.type].text,
          toastTypeClasses[toast.type].border
        ]"
      >
        <div class="flex items-start">
          <div class="mt-0.5">
            <Icon 
              :name="toastIcons[toast.type]" 
              class="w-5 h-5 mr-3 flex-shrink-0" 
              :class="toastTypeClasses[toast.type].icon"
            />
          </div>
          <div>
            <div class="font-medium">{{ toast.title || toastTitles[toast.type] }}</div>
            <div class="text-sm opacity-90">{{ toast.message }}</div>
          </div>
        </div>
        <button 
          @click="removeToast(toast.id)" 
          class="ml-4 text-current opacity-70 hover:opacity-100 transition-opacity"
        >
          <Icon name="heroicons:x-mark" class="w-4 h-4" />
        </button>
        
        <!-- Progress bar (only for auto-dismiss toasts) -->
        <div 
          v-if="toast.autoDismiss !== false"
          class="absolute bottom-0 left-0 h-1 transition-all duration-300 ease-out"
          :class="toastTypeClasses[toast.type].progress"
          :style="{ width: `${getToastProgress(toast)}%` }"
        ></div>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useToast } from '~/composables/useToast'

const { 
  toasts, 
  removeToast, 
  setToastContainerHovered 
} = useToast()

// Toast start times for progress calculation
const toastStartTimes = ref<Record<number, number>>({})

// Keep track of toast start times
for (const toast of toasts.value) {
  if (!toastStartTimes.value[toast.id]) {
    toastStartTimes.value[toast.id] = toast.createdAt
  }
}

// Calculate progress for toast
const getToastProgress = (toast: any) => {
  if (toast.pausedAt) {
    // If paused, show progress at the time of pause
    const elapsed = toast.pausedAt - toast.createdAt
    const progress = 100 - (elapsed / (toast.duration || 5000) * 100)
    return Math.max(0, Math.min(100, progress))
  }
  
  const startTime = toast.createdAt
  const duration = toast.duration || 5000
  const elapsed = Date.now() - startTime
  const progress = 100 - (elapsed / duration * 100)
  return Math.max(0, Math.min(100, progress))
}

// Set up progress bar animation
let animationFrame: number | null = null

const updateProgress = () => {
  animationFrame = requestAnimationFrame(updateProgress)
}

onMounted(() => {
  animationFrame = requestAnimationFrame(updateProgress)
})

onUnmounted(() => {
  if (animationFrame !== null) {
    cancelAnimationFrame(animationFrame)
  }
})

// Toast type classes
const toastTypeClasses = {
  success: {
    bg: 'bg-green-50',
    text: 'text-green-800',
    border: 'border-green-200',
    icon: 'text-green-500',
    progress: 'bg-green-500'
  },
  error: {
    bg: 'bg-red-50',
    text: 'text-red-800',
    border: 'border-red-200',
    icon: 'text-red-500',
    progress: 'bg-red-500'
  },
  warning: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    icon: 'text-yellow-500',
    progress: 'bg-yellow-500'
  },
  info: {
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
    icon: 'text-blue-500',
    progress: 'bg-blue-500'
  }
}

// Toast titles
const toastTitles = {
  success: 'Success',
  error: 'Error',
  warning: 'Warning',
  info: 'Information'
}

// Toast icons
const toastIcons = {
  success: 'heroicons:check-circle',
  error: 'heroicons:exclamation-circle',
  warning: 'heroicons:exclamation-triangle',
  info: 'heroicons:information-circle'
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(30px) scale(0.9);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style> 