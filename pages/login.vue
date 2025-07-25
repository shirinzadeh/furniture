<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <NuxtLink to="/" class="text-2xl sm:text-3xl font-serif font-bold text-amber-900">
          MEBEL
        </NuxtLink>
        <h2 class="mt-6 text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900">
          Hesabınıza Giriş Yapın
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Hesabınız yok mu?
          <NuxtLink to="/register" class="font-medium text-amber-600 hover:text-amber-500">
            Hemen üye olun
          </NuxtLink>
        </p>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <!-- Error display -->
        <div v-if="error" class="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
          <div class="flex">
            <Icon name="mdi:alert-circle" class="h-5 w-5 text-red-400" />
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                Giriş Hatası
              </h3>
              <div class="mt-2 text-sm text-red-700">
                {{ error }}
              </div>
            </div>
          </div>
        </div>

        <form class="space-y-6" @submit.prevent="handleLogin">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email Adresi
            </label>
            <div class="mt-1">
              <input
                id="email"
                v-model="form.email"
                name="email"
                type="email"
                autocomplete="email"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                placeholder="ornek@email.com"
              />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Şifre
            </label>
            <div class="mt-1 relative">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                name="password"
                autocomplete="current-password"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                placeholder="Şifrenizi girin"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <Icon 
                  :name="showPassword ? 'mdi:eye-off' : 'mdi:eye'" 
                  class="h-5 w-5 text-gray-400 hover:text-gray-500"
                />
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                v-model="form.rememberMe"
                name="remember-me"
                type="checkbox"
                class="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
              />
              <label for="remember-me" class="ml-2 block text-sm text-gray-900">
                Beni hatırla
              </label>
            </div>

            <div class="text-sm">
              <NuxtLink to="/forgot-password" class="font-medium text-amber-600 hover:text-amber-500">
                Şifremi unuttum
              </NuxtLink>
            </div>
          </div>

          <div>
            <button
              type="submit"
              :disabled="loading"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
                <Icon name="mdi:loading" class="h-5 w-5 text-amber-200 animate-spin" />
              </span>
              <span v-else class="absolute left-0 inset-y-0 flex items-center pl-3">
                <Icon name="mdi:login" class="h-5 w-5 text-amber-200" />
              </span>
              {{ loading ? 'Giriş yapılıyor...' : 'Giriş Yap' }}
            </button>
          </div>
        </form>

        <!-- Social login options (placeholder) -->
        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">
                veya
              </span>
            </div>
          </div>

          <div class="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 cursor-not-allowed opacity-50"
              disabled
            >
              <Icon name="mdi:google" class="h-5 w-5" />
              <span class="ml-2">Google</span>
            </button>

            <button
              type="button"
              class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 cursor-not-allowed opacity-50"
              disabled
            >
              <Icon name="mdi:facebook" class="h-5 w-5" />
              <span class="ml-2">Facebook</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useAuthStore } from '~/stores'
import { useToast } from '~/composables/useToast'

// Define page meta
definePageMeta({
  layout: false,
  title: 'Giriş Yap'
})

// Initialize stores
const authStore = useAuthStore()
const { success, error: toastError } = useToast()
const route = useRoute()

// Form state
const form = reactive({
  email: '',
  password: '',
  rememberMe: false
})

// Component state
const loading = ref(false)
const error = ref<string | null>(null)
const showPassword = ref(false)

// Handle login
const handleLogin = async () => {
  loading.value = true
  error.value = null

  try {
    const loginSuccess = await authStore.login(form.email, form.password)

    if (loginSuccess) {
      success('Giriş Başarılı', 'Hoş geldiniz!')
      
      // Redirect to intended page or home
      const redirectTo = route.query.redirect?.toString() || '/'
      await navigateTo(redirectTo)
    } else {
      error.value = authStore.error || 'Giriş başarısız oldu'
    }
      } catch (err: any) {
      error.value = err.message || 'Beklenmeyen bir hata oluştu'
      toastError('Giriş Hatası', error.value || 'Beklenmeyen bir hata oluştu')
  } finally {
    loading.value = false
  }
}

// Meta tags
useHead({
  title: 'Giriş Yap - MEBEL',
  meta: [
    { name: 'description', content: 'MEBEL hesabınıza giriş yapın ve özel fırsatlardan yararlanın.' }
  ]
})

// Check if already logged in
onMounted(async () => {
  await authStore.init()
  
  if (authStore.isAuthenticated) {
    const redirectTo = route.query.redirect?.toString() || '/'
    await navigateTo(redirectTo)
  }
})
</script> 