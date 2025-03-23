<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Enter your credentials to access the dashboard
        </p>
      </div>

      <!-- Error alert -->
      <div v-if="error" class="bg-red-50 p-4 rounded-md">
        <div class="flex">
          <div class="flex-shrink-0">
            <Icon name="mdi:alert-circle" class="h-5 w-5 text-red-400" />
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Authentication error</h3>
            <div class="mt-2 text-sm text-red-700">
              <p>{{ error }}</p>
            </div>
          </div>
        </div>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email-address" class="sr-only">Email address</label>
            <input id="email-address" v-model="form.email" name="email" type="email" autocomplete="email" required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-gray-500 focus:border-gray-500 focus:z-10 sm:text-sm" placeholder="Email address" />
          </div>
          <div>
            <label for="password" class="sr-only">Password</label>
            <input id="password" v-model="form.password" name="password" type="password" autocomplete="current-password" required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-gray-500 focus:border-gray-500 focus:z-10 sm:text-sm" placeholder="Password" />
          </div>
        </div>

        <div>
          <button type="submit" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500" :disabled="isLoading">
            <span v-if="isLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <Icon name="mdi:loading" class="h-5 w-5 text-gray-400 animate-spin" />
            </span>
            <span v-else class="absolute left-0 inset-y-0 flex items-center pl-3">
              <Icon name="mdi:lock" class="h-5 w-5 text-gray-400" />
            </span>
            {{ isLoading ? 'Signing in...' : 'Sign in' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useToast } from '~/composables/useToast'
const authStore = useAuthStore()

// Get auth and router
const auth = useAuth()
const router = useRouter()
const route = useRoute()
const toast = useToast()

// Form state
const form = reactive({
  email: '',
  password: ''
})

// Get loading and error state from auth
const isLoading = ref(false)
const error = ref<string | null>(null)

// Handle login form submission
const handleLogin = async () => {
  isLoading.value = true
  error.value = null

  const user = await authStore.login(form.email, form.password)

  if (user) {
    console.log('user', user)
    // Show success toast
    toast.showToast({
      message: 'Logged in successfully',
      type: 'success'
    })

    // Redirect to admin dashboard or the requested page
    const redirectPath = route.query.redirect?.toString() || '/admin'
    console.log('Login successful, redirecting to:', redirectPath)

    navigateTo(redirectPath)
  } else {
    error.value = auth.error.value || 'Authentication failed'
  }
}

// Check if we're already authenticated on mount
onMounted(async () => {
    await authStore.fetchProfile()
    
    if (authStore.isAuthenticated && authStore.isAdmin) {
      console.log('Already logged in as admin, redirecting to dashboard')
      window.location.href = '/admin'
    }
})
</script>