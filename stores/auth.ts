import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'
import type { User } from '~/types'

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
}

// Define the store but don't export it directly
const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    loading: false,
    error: null
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    isAdmin: (state) => state.user?.role === 'admin'
  },
  
  actions: {
    async init() {
      // Check for existing token in cookies
      const token = useCookie('auth_token').value
      
      if (token) {
        this.token = token
        await this.fetchProfile()
      }
    },
    
    async login(email: string, password: string) {
      this.loading = true
      this.error = null
      
      try {
        const api = useApi()
        const response = await api.fetchRaw<{ user: User, token: string }>('/api/auth/login', {
          method: 'POST',
          body: { email, password }
        })
        
        this.user = response.user
        this.token = response.token
        
        // Store token in cookie
        const authCookie = useCookie('auth_token', { 
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/' 
        })
        authCookie.value = response.token
        
        // Initialize cart and favorites after successful login
        await this.onLoginSuccess()
        
        return true
      } catch (error: any) {
        this.error = error.message || 'Login failed'
        return false
      } finally {
        this.loading = false
      }
    },
    
    async register(userData: { email: string, password: string, name?: string }) {
      this.loading = true
      this.error = null
      
      try {
        const api = useApi()
        const response = await api.fetchRaw<{ user: User, token: string }>('/api/auth/register', {
          method: 'POST',
          body: userData
        })
        
        this.user = response.user
        this.token = response.token
        
        // Store token in cookie
        const authCookie = useCookie('auth_token', { 
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/' 
        })
        authCookie.value = response.token
        
        // Initialize cart and favorites after successful registration
        await this.onLoginSuccess()
        
        return true
      } catch (error: any) {
        this.error = error.message || 'Registration failed'
        return false
      } finally {
        this.loading = false
      }
    },
    
    async fetchProfile() {
      if (!this.token) return false
      
      this.loading = true
      
      try {
        const api = useApi()
        const user = await api.fetchRaw<User>('/api/auth/profile')
        
        this.user = user
        
        // Initialize cart and favorites if user is authenticated
        if (this.isAuthenticated) {
          await this.onLoginSuccess()
        }
        
        return true
      } catch (error: any) {
        // If unauthorized, logout
        if (error.statusCode === 401) {
          this.logout()
        }
        return false
      } finally {
        this.loading = false
      }
    },
    
    // Called when user successfully logs in or registers
    async onLoginSuccess() {
      try {
        // Dynamically import stores to avoid circular dependencies
        const { useCartStore } = await import('~/stores')
        const useFavoritesStore = (await import('~/stores/favorites')).default
        
        const cartStore = useCartStore()
        const favoritesStore = useFavoritesStore()
        
        // Initialize stores with database data
        await Promise.all([
          cartStore.onUserLogin(),
          favoritesStore.onUserLogin()
        ])
      } catch (error) {
        console.error('Error initializing stores after login:', error)
      }
    },
    
    logout(redirect = true) {
      // Clear user data
      this.user = null
      this.token = null
      this.error = null
      
      // Remove cookie
      const authCookie = useCookie('auth_token')
      authCookie.value = null
      
      // Clear stores
      this.onLogoutSuccess()
      
      // Redirect to login if on authenticated page and redirect is true
      if (redirect) {
        const route = useRoute()
        if (route.meta.requiresAuth) {
          navigateTo('/login')
        }
      }
    },
    
    // Called when user logs out
    onLogoutSuccess() {
      try {
        // Dynamically import stores to avoid circular dependencies
        import('~/stores').then(({ useCartStore }) => {
          const cartStore = useCartStore()
          cartStore.onUserLogout()
        })
        
        import('~/stores/favorites').then((module) => {
          const useFavoritesStore = module.default
          const favoritesStore = useFavoritesStore()
          favoritesStore.onUserLogout()
        })
      } catch (error) {
        console.error('Error clearing stores after logout:', error)
      }
    }
  }
})

// Export as default
export default useAuthStore 