<template>
  <button 
    @click="clearCache" 
    class="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2"
    :disabled="isLoading"
  >
    <Icon v-if="isLoading" name="mdi:loading" class="animate-spin" />
    <Icon v-else name="mdi:refresh" />
    {{ isLoading ? 'Clearing...' : 'Clear Cache' }}
  </button>
  
  <!-- Success Toast -->
  <div 
    v-if="showSuccess" 
    class="fixed bottom-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md z-50 flex items-start"
  >
    <div class="mr-2 mt-0.5">
      <Icon name="mdi:check-circle" class="text-green-500" />
    </div>
    <div>
      <p class="font-bold">Cache Cleared</p>
      <p class="text-sm">{{ successMessage }}</p>
    </div>
    <button @click="showSuccess = false" class="ml-4 text-green-500 hover:text-green-700">
      <Icon name="mdi:close" />
    </button>
  </div>
  
  <!-- Error Toast -->
  <div 
    v-if="showError" 
    class="fixed bottom-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md z-50 flex items-start"
  >
    <div class="mr-2 mt-0.5">
      <Icon name="mdi:alert-circle" class="text-red-500" />
    </div>
    <div>
      <p class="font-bold">Error</p>
      <p class="text-sm">{{ errorMessage }}</p>
    </div>
    <button @click="showError = false" class="ml-4 text-red-500 hover:text-red-700">
      <Icon name="mdi:close" />
    </button>
  </div>
</template>

<script setup lang="ts">
const isLoading = ref(false)
const showSuccess = ref(false)
const showError = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const clearCache = async () => {
  isLoading.value = true
  showSuccess.value = false
  showError.value = false
  
  try {
    const { data } = await useFetch('/api/admin/clear-cache', {
      method: 'POST'
    })
    
    if (data.value) {
      successMessage.value = data.value.message || 'Cache cleared successfully'
      showSuccess.value = true
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        showSuccess.value = false
      }, 5000)
    }
  } catch (error: any) {
    console.error('Error clearing cache:', error)
    errorMessage.value = error.message || 'Failed to clear cache'
    showError.value = true
    
    // Hide error message after 5 seconds
    setTimeout(() => {
      showError.value = false
    }, 5000)
  } finally {
    isLoading.value = false
  }
}
</script> 