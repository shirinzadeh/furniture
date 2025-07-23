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
    const toast = useToast()
    
    // Quick check for auth cookie
    const authCookie = useCookie('auth_token')
    
    if (!authCookie.value) {
      toast.info(
        'Giriş Gerekli',
        'Bu sayfaya erişmek için giriş yapmalısınız'
      )
      return navigateTo(`/auth/login?redirect=${encodeURIComponent(to.fullPath)}`, { replace: true })
    }
    
    // Initialize auth store and fetch profile
    await authStore.init()
    
    // Check if authenticated
    if (!authStore.isAuthenticated) {
      toast.info(
        'Giriş Gerekli',
        'Bu sayfaya erişmek için giriş yapmalısınız'
      )
      return navigateTo(`/auth/login?redirect=${encodeURIComponent(to.fullPath)}`, { replace: true })
    }
    
  } catch (error) {
    const toast = useToast()
    toast.error(
      'Kimlik Doğrulama Hatası',
      'Giriş yaparken bir hata oluştu'
    )
    
    return navigateTo('/auth/login', { replace: true })
  }
}) 