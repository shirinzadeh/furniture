import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'
import type { User } from '~/types'

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    loading: false,
    error: null
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin'
  },
  
  actions: {
    async init() {
      // Check for existing token in cookies
      const token = useCookie('auth_token').value
      console.log('token', token)
      
      if (token) {
        this.token = token
        await this.fetchProfile()
      }
    },
    
    async login(email: string, password: string) {
      console.log('login', email, password)
      this.loading = true
      this.error = null
      
      try {
        const api = useApi()
        const response = await api.fetchRaw<{ user: User, token: string }>('/api/auth/login', {
          method: 'POST',
          body: { email, password }
        })

        console.log('response', response)
        
        this.user = response.user
        this.token = response.token
        
        // Store token in cookie
        const authCookie = useCookie('auth_token', { 
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/' 
        })

        console.log('authCookie', authCookie)
        authCookie.value = response.token
        console.log('authCookie.value', authCookie.value)
        console.log('response.token', response.token)
        
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
    
    logout(redirect = true) {
      this.user = null
      this.token = null
      
      // Remove cookie
      const authCookie = useCookie('auth_token')
      authCookie.value = null
      
      // Redirect to login if on authenticated page and redirect is true
      if (redirect) {
        const route = useRoute()
        if (route.meta.requiresAuth) {
          navigateTo('/login')
        }
      }
    }
  }
}) 