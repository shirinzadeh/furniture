<template>
  <Teleport to="body">
    <div class="toast-container fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
      <TransitionGroup name="toast" tag="div">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'toast-item rounded-lg border p-4 shadow-lg backdrop-blur-sm transition-all duration-300',
            getToastClasses(toast.type)
          ]"
        >
          <div class="flex items-start">
            <!-- Icon -->
            <div class="flex-shrink-0">
              <Icon 
                :name="getToastIcon(toast.type)" 
                size="20" 
                :class="getIconColor(toast.type)"
              />
            </div>
            
            <!-- Content -->
            <div class="ml-3 flex-1">
              <!-- Title -->
              <h4 class="text-sm font-semibold">
                {{ toast.title }}
              </h4>
              
              <!-- Message -->
              <p 
                v-if="toast.message" 
                class="mt-1 text-sm opacity-90"
              >
                {{ toast.message }}
              </p>
              
              <!-- Actions -->
              <div 
                v-if="toast.actions && toast.actions.length > 0" 
                class="mt-3 flex gap-2"
              >
                <button
                  v-for="action in toast.actions"
                  :key="action.label"
                  @click="action.action"
                  :class="[
                    'text-xs px-3 py-1 rounded-md font-medium transition-colors',
                    action.primary 
                      ? 'bg-white/20 hover:bg-white/30 border border-current' 
                      : 'hover:bg-white/10'
                  ]"
                >
                  {{ action.label }}
                </button>
              </div>
            </div>
            
            <!-- Close button -->
            <button
              @click="removeToast(toast.id)"
              class="flex-shrink-0 ml-2 opacity-60 hover:opacity-100 transition-opacity"
            >
              <Icon name="mdi:close" size="16" />
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast } from '~/composables/useToast'

const { toasts, removeToast } = useToast()

// Toast type to icon mapping
const getToastIcon = (type: string) => {
  switch (type) {
    case 'success': return 'mdi:check-circle'
    case 'error': return 'mdi:alert-circle'
    case 'warning': return 'mdi:alert'
    case 'info': return 'mdi:information'
    default: return 'mdi:information'
  }
}

// Toast type to color mapping
const getToastClasses = (type: string) => {
  switch (type) {
    case 'success': 
      return 'bg-green-50 border-green-200 text-green-800'
    case 'error': 
      return 'bg-red-50 border-red-200 text-red-800'
    case 'warning': 
      return 'bg-yellow-50 border-yellow-200 text-yellow-800'
    case 'info': 
      return 'bg-blue-50 border-blue-200 text-blue-800'
    default: 
      return 'bg-gray-50 border-gray-200 text-gray-800'
  }
}

// Get icon color for each type
const getIconColor = (type: string) => {
  switch (type) {
    case 'success': return 'text-green-500'
    case 'error': return 'text-red-500'
    case 'warning': return 'text-yellow-500'
    case 'info': return 'text-blue-500'
    default: return 'text-gray-500'
  }
}
</script>

<style scoped>
.toast-container {
  pointer-events: none;
}

.toast-item {
  pointer-events: auto;
}

/* Toast animations */
.toast-enter-active {
  transition: all 0.3s ease-out;
}

.toast-leave-active {
  transition: all 0.3s ease-in;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style> 