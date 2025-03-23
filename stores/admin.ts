import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'
import useAuthStore from './auth'

interface AdminState {
  sidebarOpen: boolean
  lastNotification: {
    message: string
    type: 'success' | 'error' | 'info' | 'warning'
    timestamp: number
  } | null
}

// Define the store but don't export it directly
const useAdminStore = defineStore('admin', {
  state: (): AdminState => ({
    sidebarOpen: true,
    lastNotification: null
  }),
  
  actions: {
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
    },
    
    showNotification(notification: { message: string; type: 'success' | 'error' | 'info' | 'warning' }) {
      this.lastNotification = {
        ...notification,
        timestamp: Date.now()
      }
    },
    
    handleSessionExpired() {
      // Clear admin session and redirect to login
      const authStore = useAuthStore()
      authStore.logout()
      
      // Set notification to be displayed on login page
      this.showNotification({
        message: 'Your session has expired. Please log in again.',
        type: 'info'
      })
      
      // Navigate to login page
      navigateTo('/admin/login')
    },
    
    // Admin dashboard stats
    async fetchDashboardStats() {
      try {
        const api = useApi()
        return await api.fetchRaw<{
          productsCount: number
          categoriesCount: number
          usersCount: number
          recentOrders?: any[]
        }>('/api/admin/dashboard/stats')
      } catch (error: any) {
        this.showNotification({
          message: error.message || 'Failed to load dashboard stats',
          type: 'error'
        })
        return null
      }
    }
  }
})

// Export as default
export default useAdminStore 