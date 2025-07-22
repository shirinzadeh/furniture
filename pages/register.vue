<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <NuxtLink to="/" class="text-3xl font-serif font-bold text-amber-900">
          MEBEL
        </NuxtLink>
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
          Hesap Oluşturun
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Zaten hesabınız var mı?
          <NuxtLink to="/login" class="font-medium text-amber-600 hover:text-amber-500">
            Giriş yapın
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
                Kayıt Hatası
              </h3>
              <div class="mt-2 text-sm text-red-700">
                {{ error }}
              </div>
            </div>
          </div>
        </div>

        <form class="space-y-6" @submit.prevent="handleRegister">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">
              Ad Soyad
            </label>
            <div class="mt-1">
              <input
                id="name"
                v-model="form.name"
                name="name"
                type="text"
                autocomplete="name"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                placeholder="Adınız ve soyadınız"
              />
            </div>
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email Adresi *
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
              Şifre *
            </label>
            <div class="mt-1 relative">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                name="password"
                autocomplete="new-password"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                placeholder="En az 6 karakter"
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
            <!-- Password strength indicator -->
            <div v-if="form.password" class="mt-2">
              <div class="flex space-x-1">
                <div 
                  v-for="i in 4" 
                  :key="i"
                  :class="[
                    'h-1 flex-1 rounded-full',
                    passwordStrength >= i ? getStrengthColor() : 'bg-gray-200'
                  ]"
                ></div>
              </div>
              <p class="text-xs mt-1" :class="getStrengthTextColor()">
                {{ getStrengthText() }}
              </p>
            </div>
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
              Şifre Tekrarı *
            </label>
            <div class="mt-1 relative">
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                name="confirmPassword"
                autocomplete="new-password"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                placeholder="Şifrenizi tekrar girin"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <Icon 
                  :name="showConfirmPassword ? 'mdi:eye-off' : 'mdi:eye'" 
                  class="h-5 w-5 text-gray-400 hover:text-gray-500"
                />
              </button>
            </div>
            <!-- Password match indicator -->
            <div v-if="form.confirmPassword" class="mt-1">
              <p v-if="passwordsMatch" class="text-xs text-green-600 flex items-center">
                <Icon name="mdi:check-circle" class="h-3 w-3 mr-1" />
                Şifreler eşleşiyor
              </p>
              <p v-else class="text-xs text-red-600 flex items-center">
                <Icon name="mdi:alert-circle" class="h-3 w-3 mr-1" />
                Şifreler eşleşmiyor
              </p>
            </div>
          </div>

          <div class="flex items-center">
            <input
              id="terms"
              v-model="form.acceptTerms"
              name="terms"
              type="checkbox"
              required
              class="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
            />
            <label for="terms" class="ml-2 block text-sm text-gray-900">
              <NuxtLink to="/terms" class="text-amber-600 hover:text-amber-500">
                Kullanım Şartları
              </NuxtLink> ve 
              <NuxtLink to="/privacy" class="text-amber-600 hover:text-amber-500">
                Gizlilik Politikası'nı
              </NuxtLink> kabul ediyorum *
            </label>
          </div>

          <div>
            <button
              type="submit"
              :disabled="loading || !isFormValid"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
                <Icon name="mdi:loading" class="h-5 w-5 text-amber-200 animate-spin" />
              </span>
              <span v-else class="absolute left-0 inset-y-0 flex items-center pl-3">
                <Icon name="mdi:account-plus" class="h-5 w-5 text-amber-200" />
              </span>
              {{ loading ? 'Hesap oluşturuluyor...' : 'Hesap Oluştur' }}
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
import { reactive, ref, computed } from 'vue'
import { useAuthStore } from '~/stores'
import { useToast } from '~/composables/useToast'

// Define page meta
definePageMeta({
  layout: false,
  title: 'Üye Ol'
})

// Initialize stores
const authStore = useAuthStore()
const { success, error: toastError } = useToast()
const route = useRoute()

// Form state
const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
})

// Component state
const loading = ref(false)
const error = ref<string | null>(null)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// Password validation
const passwordStrength = computed(() => {
  const password = form.password
  let strength = 0
  
  if (password.length >= 6) strength++
  if (password.length >= 8) strength++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  
  return strength
})

const passwordsMatch = computed(() => {
  return form.password === form.confirmPassword && form.confirmPassword.length > 0
})

const isFormValid = computed(() => {
  return form.email && 
         form.password && 
         form.confirmPassword && 
         passwordsMatch.value && 
         form.acceptTerms &&
         passwordStrength.value >= 2
})

// Password strength helpers
const getStrengthColor = () => {
  switch (passwordStrength.value) {
    case 1: return 'bg-red-500'
    case 2: return 'bg-yellow-500'
    case 3: return 'bg-blue-500'
    case 4: return 'bg-green-500'
    default: return 'bg-gray-200'
  }
}

const getStrengthTextColor = () => {
  switch (passwordStrength.value) {
    case 1: return 'text-red-600'
    case 2: return 'text-yellow-600'
    case 3: return 'text-blue-600'
    case 4: return 'text-green-600'
    default: return 'text-gray-500'
  }
}

const getStrengthText = () => {
  switch (passwordStrength.value) {
    case 1: return 'Zayıf şifre'
    case 2: return 'Orta şifre'
    case 3: return 'İyi şifre'
    case 4: return 'Güçlü şifre'
    default: return 'En az 6 karakter gerekli'
  }
}

// Handle registration
const handleRegister = async () => {
  if (!isFormValid.value) {
    error.value = 'Lütfen tüm alanları doğru şekilde doldurun'
    return
  }

  loading.value = true
  error.value = null

  try {
    const registerSuccess = await authStore.register({
      email: form.email,
      password: form.password,
      name: form.name || undefined
    })

    if (registerSuccess) {
      success('Kayıt Başarılı', 'Hesabınız oluşturuldu ve giriş yaptınız!')
      
      // Redirect to intended page or home
      const redirectTo = route.query.redirect?.toString() || '/'
      await navigateTo(redirectTo)
    } else {
      error.value = authStore.error || 'Kayıt başarısız oldu'
    }
  } catch (err: any) {
    error.value = err.message || 'Beklenmeyen bir hata oluştu'
    toastError('Kayıt Hatası', error.value || 'Beklenmeyen bir hata oluştu')
  } finally {
    loading.value = false
  }
}

// Meta tags
useHead({
  title: 'Üye Ol - MEBEL',
  meta: [
    { name: 'description', content: 'MEBEL\'e üye olun ve özel fırsatlardan yararlanın.' }
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