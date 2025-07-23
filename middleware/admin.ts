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
    
    if (!authCookie.value) {
      globalLoading.value = false
      return navigateTo(`/auth/login?redirect=${encodeURIComponent(to.fullPath)}`, { replace: true })
    }
    
    // Initialize auth store and fetch profile
    await authStore.init()
    
    // Check if authenticated
    if (!authStore.isAuthenticated) {
      toast.info(
        'Giriş Gerekli',
        'Yönetici paneline erişmek için giriş yapın'
      )
      globalLoading.value = false
      return navigateTo(`/auth/login?redirect=${encodeURIComponent(to.fullPath)}`, { replace: true })
    }
    
    // Check if admin
    if (!authStore.isAdmin) {
      toast.error(
        'Erişim Engellendi',
        'Yönetici paneline erişim yetkiniz bulunmamaktadır'
      )
      globalLoading.value = false
      return navigateTo('/', { replace: true })
    }
    
    globalLoading.value = false
  } catch (error) {
    globalLoading.value = false
    
    const toast = useToast()
    toast.error(
      'Kimlik Doğrulama Hatası',
      'Giriş yaparken bir hata oluştu'
    )
    
    return navigateTo('/auth/login', { replace: true })
  } finally {
    globalLoading.value = false
  }
}) 