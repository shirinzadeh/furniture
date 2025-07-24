import type { UseFetchOptions } from 'nuxt/app'
import type { FetchError } from 'ofetch'
import type { FetchContext, FetchResponse } from 'ofetch'
import { unref, ref, readonly, watchEffect, onUnmounted, nextTick } from 'vue'
import { useAdminStore } from '~/stores'
import { useToast } from '~/composables/useToast'

export type ApiError = {
  statusCode: number
  message: string
  data?: any
}

export type ApiOptions<T> = Omit<UseFetchOptions<T>, 'headers'> & {
  showError?: boolean
  headers?: Record<string, string>
}

export type LazyOptions<T> = ApiOptions<T> & {
  immediate?: boolean
  trigger?: 'visible' | 'manual' | 'hover'
  threshold?: number
  rootMargin?: string
}

// Global state for API operations
const globalApiState = {
  isLoading: ref(false),
  activeRequests: ref(0),
  lastError: ref<ApiError | null>(null),
  errors: ref<Record<string, ApiError>>({})
}

export function useApiState() {
  return globalApiState
}

export function useApi() {
  const config = useRuntimeConfig()
  
  // Default headers for all requests
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }

  // Get auth token if available
  const getAuthHeaders = (): Record<string, string> => {
    const token = useCookie('auth_token').value
    return token ? { 'Authorization': `Bearer ${token}` } : {}
  }

  // Track request start
  const trackRequestStart = (requestKey: string) => {
    globalApiState.activeRequests.value++
    globalApiState.isLoading.value = true
  }

  // Track request end
  const trackRequestEnd = (requestKey: string) => {
    globalApiState.activeRequests.value = Math.max(0, globalApiState.activeRequests.value - 1)
    globalApiState.isLoading.value = globalApiState.activeRequests.value > 0
  }

  // Error handler function
  const handleError = (error: FetchError, requestKey: string, showError = true): ApiError => {
    const statusCode = error.response?.status || 500
    const message = error.response?._data?.message || error.message || 'An unexpected error occurred'
    const data = error.response?._data

    const apiError: ApiError = {
      statusCode,
      message,
      data
    }

    console.error(`API Error (${statusCode}):`, message, error)

    // Store the error in global state
    globalApiState.lastError.value = apiError
    globalApiState.errors.value = {
      ...globalApiState.errors.value,
      [requestKey]: apiError
    }

    // Handle unauthorized errors (session expired or invalid token)
    if (statusCode === 401 && import.meta.client) {
      // Check if we're in the admin section
      const isAdminRoute = window.location.pathname.startsWith('/admin')
      
      if (isAdminRoute) {
        try {
          // Get the admin store
          const adminStore = useAdminStore()
          
          // Use the dedicated method for handling session expiration
          adminStore.handleSessionExpired()
          
          // Show toast notification
          const toast = useToast()
          toast.info(
            'Oturum Süresi Doldu', 
            'Oturumunuzun süresi doldu. Lütfen tekrar giriş yapın.'
          )
        } catch (e) {
          console.error('Error handling unauthorized access:', e)
        }
        return apiError
      }
    }

    return apiError
  }

  // Clear errors
  const clearErrors = () => {
    globalApiState.lastError.value = null
    globalApiState.errors.value = {}
  }

  // Clear specific error
  const clearError = (requestKey: string) => {
    if (globalApiState.errors.value[requestKey]) {
      const newErrors = { ...globalApiState.errors.value }
      delete newErrors[requestKey]
      globalApiState.errors.value = newErrors

      // Update last error if needed
      if (globalApiState.lastError.value && 
          globalApiState.lastError.value.message === globalApiState.errors.value[requestKey]?.message) {
        globalApiState.lastError.value = Object.values(newErrors)[0] || null
      }
    }
  }

  // Helper to get base URL from config
  const getBaseURL = (): string => {
    const apiBaseUrl = config.public.apiBaseUrl
    const unwrappedValue = unref(apiBaseUrl)
    // Ensure we return a string, even if apiBaseUrl is undefined
    return typeof unwrappedValue === 'string' ? unwrappedValue : '/api'
  }

  // Generate a unique key for the request if not provided
  const getRequestKey = (url: string, options?: any): string => {
    if (options?.key) return options.key
    const params = options?.params ? JSON.stringify(options.params) : ''
    return `${url}${params ? `-${params}` : ''}`
  }

  // Wrapper for useFetch
  const apiFetch = <T>(url: string, options: ApiOptions<T> = {}) => {
    const { showError = true, ...fetchOptions } = options
    const requestKey = getRequestKey(url, options)
    
    // Clear any previous errors for this request
    clearError(requestKey)
    
    // Track request start
    trackRequestStart(requestKey)

    // Merge headers
    const headers: Record<string, string> = {
      ...defaultHeaders,
      ...getAuthHeaders(),
      ...(options.headers || {})
    }

    return useFetch<T>(url, {
      baseURL: getBaseURL(),
      headers,
      ...fetchOptions,
      onRequest({ request, options }: { request: any; options: any }) {
        // Call the original onRequest if provided
        if (typeof fetchOptions.onRequest === 'function') {
          fetchOptions.onRequest({ request, options })
        }
      },
      onRequestError(context: any) {
        handleError(context.error as FetchError, requestKey, showError)
        // Call the original onRequestError if provided
        if (typeof fetchOptions.onRequestError === 'function') {
          fetchOptions.onRequestError(context)
        }
      },
      onResponse({ request, response, options }: { request: any; response: any; options: any }) {
        // Call the original onResponse if provided
        if (typeof fetchOptions.onResponse === 'function') {
          fetchOptions.onResponse({ request, response, options })
        }
      },
      onResponseError(context: any) {
        handleError(context.error as FetchError, requestKey, showError)
        // Call the original onResponseError if provided
        if (typeof fetchOptions.onResponseError === 'function') {
          // Type assertion to match the expected type
          fetchOptions.onResponseError(context as FetchContext & { response: FetchResponse<any> })
        }
      },
      transform(data: any) {
        // Apply custom transform if provided
        if (typeof fetchOptions.transform === 'function') {
          return fetchOptions.transform(data)
        }
        return data
      }
    } as any).catch((error: FetchError) => {
      trackRequestEnd(requestKey)
      throw error
    }).finally(() => {
      trackRequestEnd(requestKey)
    })
  }

  // Wrapper for useAsyncData
  const apiAsyncData = <T>(
    key: string,
    apiFn: () => Promise<T>,
    options: Omit<ApiOptions<T>, 'watch' | 'default'> = {}
  ) => {
    const { showError = true, ...asyncOptions } = options
    const requestKey = key

    // Clear any previous errors for this request
    clearError(requestKey)
    
    // Track request start
    trackRequestStart(requestKey)

    return useAsyncData<T>(
      key, 
      () => apiFn()
        .catch(error => {
          handleError(error as FetchError, requestKey, showError)
          throw error
        })
        .finally(() => {
          trackRequestEnd(requestKey)
        }),
      asyncOptions as any
    )
  }

  // Wrapper for $fetch
  const apiFetchRaw = async <T>(url: string, options: ApiOptions<T> = {}) => {
    const { showError = true, ...fetchOptions } = options
    const requestKey = getRequestKey(url, options)

    // Clear any previous errors for this request
    clearError(requestKey)
    
    // Track request start
    trackRequestStart(requestKey)

    try {
      // Merge headers
      const headers: Record<string, string> = {
        ...defaultHeaders,
        ...getAuthHeaders(),
        ...(options.headers || {})
      }

      // Use a string literal for baseURL to avoid type issues
      const baseURL = getBaseURL()
      
      const response = await $fetch<T>(url, {
        baseURL,
        headers,
        ...fetchOptions
      } as any) // Use type assertion to avoid excessive stack depth
      
      return response
    } catch (error) {
      const apiError = handleError(error as FetchError, requestKey, showError)
      throw apiError
    } finally {
      trackRequestEnd(requestKey)
    }
  }

  // Lazy fetch with intersection observer
  const apiLazyFetch = <T>(url: string, options: LazyOptions<T> = {}) => {
    const { 
      immediate = false, 
      trigger = 'visible',
      threshold = 0.1,
      rootMargin = '50px',
      showError = true,
      ...fetchOptions 
    } = options
    
    const requestKey = getRequestKey(url, options)
    const data = ref<T | null>(null)
    const pending = ref(false)
    const error = ref<ApiError | null>(null)
    const executed = ref(false)
    
    // Create trigger element ref for intersection observer
    const triggerRef = ref<HTMLElement>()
    
    // Execute the fetch
    const execute = async (): Promise<T | null> => {
      if (executed.value || pending.value) return data.value
      
      pending.value = true
      error.value = null
      executed.value = true
      
      try {
        const result = await apiFetchRaw<T>(url, { showError, ...fetchOptions })
        data.value = result
        return result
      } catch (err) {
        error.value = err as ApiError
        throw err
      } finally {
        pending.value = false
      }
    }
    
    // Setup intersection observer for 'visible' trigger
    if (trigger === 'visible' && import.meta.client) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !executed.value) {
              execute()
              observer.disconnect()
            }
          })
        },
        { threshold, rootMargin }
      )
      
      watchEffect(() => {
        if (triggerRef.value) {
          observer.observe(triggerRef.value)
        }
      })
      
      onUnmounted(() => {
        observer.disconnect()
      })
    }
    
    // Execute immediately if requested
    if (immediate) {
      nextTick(() => execute())
    }
    
    return {
      data: readonly(data),
      pending: readonly(pending),
      error: readonly(error),
      executed: readonly(executed),
      execute,
      triggerRef,
      refresh: () => {
        executed.value = false
        return execute()
      }
    }
  }

  // Lazy async data with intersection observer
  const apiLazyAsyncData = <T>(
    key: string,
    apiFn: () => Promise<T>,
    options: LazyOptions<T> = {}
  ) => {
    const { 
      immediate = false, 
      trigger = 'visible',
      threshold = 0.1,
      rootMargin = '50px',
      showError = true,
      ...asyncOptions 
    } = options
    
    const data = ref<T | null>(null)
    const pending = ref(false)
    const error = ref<ApiError | null>(null)
    const executed = ref(false)
    
    // Create trigger element ref for intersection observer
    const triggerRef = ref<HTMLElement>()
    
    // Execute the async data fetch
    const execute = async (): Promise<T | null> => {
      if (executed.value || pending.value) return data.value
      
      pending.value = true
      error.value = null
      executed.value = true
      
      trackRequestStart(key)
      
      try {
        const result = await apiFn()
        data.value = result
        return result
      } catch (err) {
        const apiError = handleError(err as FetchError, key, showError)
        error.value = apiError
        throw apiError
      } finally {
        pending.value = false
        trackRequestEnd(key)
      }
    }
    
    // Setup intersection observer for 'visible' trigger
    if (trigger === 'visible' && import.meta.client) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !executed.value) {
              execute()
              observer.disconnect()
            }
          })
        },
        { threshold, rootMargin }
      )
      
      watchEffect(() => {
        if (triggerRef.value) {
          observer.observe(triggerRef.value)
        }
      })
      
      onUnmounted(() => {
        observer.disconnect()
      })
    }
    
    // Execute immediately if requested
    if (immediate) {
      nextTick(() => execute())
    }
    
    return {
      data: readonly(data),
      pending: readonly(pending),
      error: readonly(error),
      executed: readonly(executed),
      execute,
      triggerRef,
      refresh: () => {
        executed.value = false
        return execute()
      }
    }
  }

  // Prefetch function for better performance
  const apiPrefetch = <T>(url: string, options: ApiOptions<T> = {}) => {
    const requestKey = getRequestKey(url, options)
    
    // Only prefetch if not already cached
    if (import.meta.client) {
      const headers = {
        ...defaultHeaders,
        ...getAuthHeaders(),
        ...(options.headers || {})
      }
      
      // Use link prefetch for better performance
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = `${getBaseURL()}${url}`
      document.head.appendChild(link)
      
      // Clean up after 5 seconds
      setTimeout(() => {
        if (link.parentNode) {
          link.parentNode.removeChild(link)
        }
      }, 5000)
    }
  }

  return {
    fetch: apiFetch,
    asyncData: apiAsyncData,
    fetchRaw: apiFetchRaw,
    lazyFetch: apiLazyFetch,
    lazyAsyncData: apiLazyAsyncData,
    prefetch: apiPrefetch,
    handleError,
    clearErrors,
    clearError,
    state: globalApiState
  }
}