<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Admin Login
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Sign in to access the admin dashboard
        </p>
      </div>
      
      <!-- Error alert -->
      <div v-if="authStore.error" class="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <Icon name="mdi:alert-circle" class="h-5 w-5 text-red-500" />
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">
              {{ authStore.error }}
            </p>
          </div>
          <div class="ml-auto pl-3">
            <div class="-mx-1.5 -my-1.5">
              <button 
                @click="authStore.error = null" 
                class="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none"
              >
                <span class="sr-only">Dismiss</span>
                <Icon name="mdi:close" class="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email-address" class="sr-only">Email address</label>
            <input 
              id="email-address" 
              v-model="email" 
              name="email" 
              type="email" 
              autocomplete="email" 
              required 
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-gray-500 focus:border-gray-500 focus:z-10 sm:text-sm" 
              placeholder="Email address"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Password</label>
            <input 
              id="password" 
              v-model="password" 
              name="password" 
              type="password" 
              autocomplete="current-password" 
              required 
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-gray-500 focus:border-gray-500 focus:z-10 sm:text-sm" 
              placeholder="Password"
            />
          </div>
        </div>

        <div>
          <button 
            type="submit" 
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            :disabled="authStore.loading"
          >
            <span v-if="authStore.loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <Icon name="mdi:loading" class="h-5 w-5 text-gray-400 animate-spin" />
            </span>
            <span v-else class="absolute left-0 inset-y-0 flex items-center pl-3">
              <Icon name="mdi:lock" class="h-5 w-5 text-gray-400" />
            </span>
            {{ authStore.loading ? 'Signing in...' : 'Sign in' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore, useAdminStore } from '~/stores'

definePageMeta({
  layout: false
})

const authStore = useAuthStore()
const adminStore = useAdminStore()
const email = ref('')
const password = ref('')

// Check if already authenticated
// onMounted(async () => {
//   await authStore.init()
  
//   if (authStore.isAuthenticated && authStore.isAdmin) {
//     await navigateTo('/admin')
//   }
// })

const handleLogin = async () => {
  const success = await authStore.login(email.value, password.value)

  console.log('success', success)
  console.log('authStore.isAuthenticated', authStore.isAuthenticated)
  console.log('authStore.isAdmin', authStore.isAdmin)
  
  // if (success && authStore.isAuthenticated && authStore.isAdmin) {
  //   // Force navigation to admin dashboard to prevent reload issues
  //   window.location.href = '/admin'
  // } else if (success && !authStore.isAdmin) {
  //   authStore.error = 'You do not have permission to access the admin area'
  //   authStore.logout(false)
  // }
}
</script> 