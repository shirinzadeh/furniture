import { defineNuxtRouteMiddleware, navigateTo, useCookie } from '#imports'
import { useAuthStore } from '~/stores'
import { useToast } from '~/composables/useToast'

export default defineNuxtRouteMiddleware(async (to) => {
  // Skip on server side to avoid hydration issues
  if (import.meta.server) {
    return
  }

  try {
    const authStore = useAuthStore()
    const { info } = useToast()
    
    // Quick check for auth cookie
    const authCookie = useCookie('auth_token')
    
    if (!authCookie.value) {
      info('Giriş Gerekli', 'Bu sayfayı görüntülemek için giriş yapmalısınız')
      return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`, { replace: true })
    }
    
    // Initialize auth store and fetch profile
    await authStore.init()
    
    // Check if authenticated
    if (!authStore.isAuthenticated) {
      info('Giriş Gerekli', 'Bu sayfayı görüntülemek için giriş yapmalısınız')
      return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`, { replace: true })
    }
    
    // User is authenticated, continue
  } catch (error) {
    console.error('Auth middleware error:', error)
    // If there's an error, redirect to login
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`, { replace: true })
  }
}) 