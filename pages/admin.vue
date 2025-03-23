<template>
  <div>
    <ClientOnly>
      <!-- Loading indicator - only render on client side -->
      <div v-if="isAuthenticating" class="min-h-screen flex items-center justify-center bg-gray-100">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
          <p class="mt-3 text-gray-700">Authenticating...</p>
        </div>
      </div>
      
      <!-- Page content when authenticated -->
      <NuxtPage v-else />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { useState, useRouter } from '#imports'

// Use definePageMeta correctly for this page component
definePageMeta({
  middleware: ['admin']
})

// Get global loading state from middleware
const isAuthenticating = useState('admin-auth-loading', () => true)

// Make sure the entire auth check happens only on client-side
if (import.meta.server) {
  isAuthenticating.value = true
}
</script> 