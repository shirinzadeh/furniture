<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">
    <!-- Sidebar - Fixed position -->
    <ClientOnly>
      <div class="bg-gray-800 text-white w-64 flex-shrink-0 hidden md:block fixed h-screen z-10">
        <div class="p-4">
          <h2 class="text-xl font-bold">Admin Dashboard</h2>
        </div>
        <nav class="mt-5 overflow-y-auto" style="max-height: calc(100vh - 200px);">
          <NuxtLink 
            to="/admin" 
            class="mt-1 group flex items-center px-4 py-2 text-sm font-medium"
            :class="[$route.path === '/admin' ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white']"
          >
            <Icon name="mdi:view-dashboard" class="mr-3 h-5 w-5" />
            Dashboard
          </NuxtLink>
          
          <NuxtLink 
            to="/admin/products" 
            class="mt-1 group flex items-center px-4 py-2 text-sm font-medium"
            :class="[$route.path.startsWith('/admin/products') ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white']"
          >
            <Icon name="mdi:package-variant" class="mr-3 h-5 w-5" />
            Products
          </NuxtLink>
          
          <NuxtLink 
            to="/admin/categories" 
            class="mt-1 group flex items-center px-4 py-2 text-sm font-medium"
            :class="[$route.path.startsWith('/admin/categories') ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white']"
          >
            <Icon name="mdi:shape" class="mr-3 h-5 w-5" />
            Categories
          </NuxtLink>
          
          <NuxtLink 
            to="/admin/banners" 
            class="mt-1 group flex items-center px-4 py-2 text-sm font-medium"
            :class="[$route.path.startsWith('/admin/banners') ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white']"
          >
            <Icon name="mdi:image" class="mr-3 h-5 w-5" />
            Banners
          </NuxtLink>
          
          <NuxtLink 
            to="/admin/users" 
            class="mt-1 group flex items-center px-4 py-2 text-sm font-medium"
            :class="[$route.path.startsWith('/admin/users') ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white']"
          >
            <Icon name="mdi:account-group" class="mr-3 h-5 w-5" />
            Users
          </NuxtLink>
        </nav>
        
        <div class="absolute bottom-0 w-64 p-4 border-t border-gray-700">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <Icon name="mdi:account-circle" class="h-8 w-8 text-gray-300" />
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-white">{{ user?.name || user?.email }}</p>
              <button 
                @click="logout" 
                class="text-xs font-medium text-gray-300 hover:text-white"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </ClientOnly>
    
    <!-- Mobile header - Fixed position for mobile -->
    <ClientOnly>
      <div class="md:hidden bg-gray-800 text-white w-full h-16 flex items-center justify-between px-4 fixed top-0 z-20">
        <h2 class="text-xl font-bold">Admin Dashboard</h2>
        <button 
          @click="mobileMenuOpen = !mobileMenuOpen" 
          class="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
        >
          <Icon v-if="!mobileMenuOpen" name="mdi:menu" class="h-6 w-6" />
          <Icon v-else name="mdi:close" class="h-6 w-6" />
        </button>
      </div>
      
      <!-- Mobile menu -->
      <div v-if="mobileMenuOpen" class="md:hidden fixed inset-0 z-40 bg-gray-800 bg-opacity-90 flex flex-col">
        <div class="flex justify-end p-4">
          <button 
            @click="mobileMenuOpen = false" 
            class="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
          >
            <Icon name="mdi:close" class="h-6 w-6" />
          </button>
        </div>
        <nav class="flex-1 px-4 pb-4 overflow-y-auto">
          <NuxtLink 
            to="/admin" 
            class="block px-3 py-2 rounded-md text-base font-medium"
            :class="[$route.path === '/admin' ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white']"
            @click="mobileMenuOpen = false"
          >
            Dashboard
          </NuxtLink>
          
          <NuxtLink 
            to="/admin/products" 
            class="block px-3 py-2 rounded-md text-base font-medium"
            :class="[$route.path.startsWith('/admin/products') ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white']"
            @click="mobileMenuOpen = false"
          >
            Products
          </NuxtLink>
          
          <NuxtLink 
            to="/admin/categories" 
            class="block px-3 py-2 rounded-md text-base font-medium"
            :class="[$route.path.startsWith('/admin/categories') ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white']"
            @click="mobileMenuOpen = false"
          >
            Categories
          </NuxtLink>
          
          <NuxtLink 
            to="/admin/banners" 
            class="block px-3 py-2 rounded-md text-base font-medium"
            :class="[$route.path.startsWith('/admin/banners') ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white']"
            @click="mobileMenuOpen = false"
          >
            Banners
          </NuxtLink>
          
          <NuxtLink 
            to="/admin/users" 
            class="block px-3 py-2 rounded-md text-base font-medium"
            :class="[$route.path.startsWith('/admin/users') ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white']"
            @click="mobileMenuOpen = false"
          >
            Users
          </NuxtLink>
          
          <div class="mt-8 pt-4 border-t border-gray-700">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <Icon name="mdi:account-circle" class="h-8 w-8 text-gray-300" />
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-white">{{ user?.name || user?.email }}</p>
                <button 
                  @click="logout" 
                  class="text-xs font-medium text-gray-300 hover:text-white"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </ClientOnly>
    
    <!-- Main content - Scrollable with padding for sidebar -->
    <div class="flex-1 flex flex-col md:ml-64">
      <main class="flex-1 py-6 px-4 sm:px-6 lg:px-8 min-h-screen overflow-y-auto md:pt-6 pt-20">
        <slot />
      </main>
    </div>
    
    <!-- Toast notifications -->
    <ClientOnly>
      <ToastContainer />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from '~/composables/useToast'
import { useAuth } from '~/composables/useAuth'

const route = useRoute()
const toast = useToast()
const { toasts, removeToast } = toast
const { user, logout: authLogout } = useAuth()
const mobileMenuOpen = ref(false)

// Logout function
const logout = async () => {
  await authLogout()
  
  toast.showToast({
    message: 'Logged out successfully',
    type: 'success'
  })
}

// Get icon based on toast type
const getToastIcon = (type: string) => {
  switch (type) {
    case 'success':
      return 'mdi:check-circle'
    case 'error':
      return 'mdi:alert-circle'
    case 'info':
      return 'mdi:information'
    case 'warning':
      return 'mdi:alert'
    default:
      return 'mdi:information'
  }
}
</script> 