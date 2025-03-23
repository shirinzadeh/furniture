import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'

interface User {
  id: string
  email: string
  name?: string
  role: 'USER' | 'ADMIN'
}

// Create a reactive state for the current user
const currentUser = ref<User | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

// Create a single instance of the auth state
const authState = reactive({
  initialized: false
})

export function useAuth() {
  const router = useRouter()
  
  // Use a more direct approach to get the cookie
  const getAuthCookie = () => {
    if (import.meta.server) return null
    
    try {
      // Log all cookies for debugging
      console.log('All cookies:', document.cookie)
      
      // More robust cookie parsing
      const cookieString = document.cookie
      const cookies = cookieString.split(';').map(cookie => cookie.trim())
      
      // Look for auth_token with exact match
      const authCookie = cookies.find(cookie => 
        cookie.toLowerCase().startsWith('auth_token=')
      )
      
      console.log('Found auth cookie:', authCookie)
      
      if (authCookie) {
        const value = authCookie.split('=')[1]
        return value
      }
      
      return null
    } catch (error) {
      console.error('Error accessing cookies:', error)
      return null
    }
  }
  
  // Computed property to check if user is authenticated
  const isAuthenticated = computed(() => {
    const hasUser = !!currentUser.value
    const hasCookie = !!getAuthCookie()
    console.log('isAuthenticated', hasUser, hasCookie)
    return hasUser && hasCookie
  })
  
  // Computed property to check if user is admin
  const isAdmin = computed(() => currentUser.value?.role === 'ADMIN')
  
  // Fetch current user data
  const fetchUser = async () => {
    // If we already have user data and a token, no need to fetch again
    const authCookie = getAuthCookie()
    
    if (currentUser.value && authCookie && authState.initialized) {
    
      return currentUser.value
    }
    
    // If no token exists, user is not logged in
    if (!authCookie) {
      currentUser.value = null
      authState.initialized = true
      return null
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      const response = await $fetch<{ user: User }>('/api/auth/profile', {
        credentials: 'include' // Important: include credentials for cookies
      })
      
      if (!response || !response.user) {
        console.error('Auth: Invalid response from API', response)
        currentUser.value = null
        authState.initialized = true
        return null
      }
      
      
      currentUser.value = response.user
      authState.initialized = true
      return currentUser.value
    } catch (err: any) {
      console.error('Auth: Error fetching user', err)
      error.value = err.message || 'Failed to fetch user data'
      currentUser.value = null
      authState.initialized = true
      return null
    } finally {
      isLoading.value = false
    }
  }
  
  // Login function
  const login = async (email: string, password: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await $fetch<{ user: User }>('/api/auth/login', {
        method: 'POST',
        body: { email, password },
        credentials: 'include' // Important: include credentials for cookies
      })
      
      if (!response || !response.user) {
        console.error('Auth: Invalid response from login API', response)
        error.value = 'Invalid response from server'
        return null
      }
      
      // Store user data
      currentUser.value = response.user
      authState.initialized = true
      
      console.log('Login successful, user data:', currentUser.value)
      
      return currentUser.value
    } catch (err: any) {
      console.error('Auth: Login error', err)
      error.value = err.data?.message || 'Invalid email or password'
      return null
    } finally {
      isLoading.value = false
    }
  }
  
  // Logout function
  const logout = async () => {
    isLoading.value = true
    
    try {
      await $fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include' // Important: include credentials for cookies
      })
    } catch (err) {
      console.error('Auth: Logout error', err)
    } finally {
      // Clear user data regardless of API success
      currentUser.value = null
      authState.initialized = true
      isLoading.value = false
      
      // Redirect to home page
      window.location.href = '/'
    }
  }
  
  // Initialize by trying to fetch the user
  if (import.meta.client && !authState.initialized) {
    fetchUser()
  }
  
  return {
    user: currentUser,
    isAuthenticated,
    isAdmin,
    isLoading,
    error,
    login,
    logout,
    fetchUser
  }
} 