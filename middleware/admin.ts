import { defineNuxtRouteMiddleware, navigateTo, useCookie, useState } from '#imports'
import { useAuthStore } from '~/stores'
import { useToast } from '~/composables/useToast'

export default defineNuxtRouteMiddleware(async (to) => {
  // Skip on server side to avoid hydration issues
  if (import.meta.server) {
    return
  }
  
  // Create a loading state
  const globalLoading = useState('admin-auth-loading', () => true)
  globalLoading.value = true
  
  try {
    const authStore = useAuthStore()
    const toast = useToast()
    
    // Quick check for auth cookie
    const authCookie = useCookie('auth_token')
    console.log('Admin middleware - Auth cookie:', !!authCookie.value)
    
    if (!authCookie.value) {
      console.log('Admin middleware - No auth cookie, redirecting to login')
      globalLoading.value = false
      return navigateTo(`/auth/login?redirect=${encodeURIComponent(to.fullPath)}`, { replace: true })
    }
    
    // Initialize auth store and fetch profile
    await authStore.init()
    
    // Check if authenticated
    if (!authStore.isAuthenticated) {
      console.log('Admin middleware - Not authenticated, redirecting to login')
      toast.showToast({
        message: 'Please log in to access the admin area',
        type: 'info'
      })
      globalLoading.value = false
      return navigateTo(`/auth/login?redirect=${encodeURIComponent(to.fullPath)}`, { replace: true })
    }
    
    // Check if admin
    if (!authStore.isAdmin) {
      console.log('Admin middleware - Not admin, redirecting to home')
      toast.showToast({
        message: 'You do not have permission to access the admin area',
        type: 'error'
      })
      globalLoading.value = false
      return navigateTo('/', { replace: true })
    }
    
    console.log('Admin middleware - Authentication successful, proceeding to admin area')
    globalLoading.value = false
  } catch (error) {
    console.error('Admin middleware - Error:', error)
    globalLoading.value = false
    
    const toast = useToast()
    toast.showToast({
      message: 'Authentication error',
      type: 'error'
    })
    
    return navigateTo('/auth/login', { replace: true })
  } finally {
    globalLoading.value = false
  }
}) 