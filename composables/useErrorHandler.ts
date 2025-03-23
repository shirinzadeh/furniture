import type { FetchError } from 'ofetch'

export function useErrorHandler() {
  /**
   * Safely extracts error message from various error types
   */
  const getErrorMessage = (error: unknown): string => {
    if (!error) return 'An unknown error occurred'
    
    // Handle string errors
    if (typeof error === 'string') return error
    
    // Handle Error objects
    if (error instanceof Error) return error.message
    
    // Handle FetchError from Nuxt
    const fetchError = error as FetchError
    if (fetchError.response) {
      // Try to get message from response data
      const responseData = fetchError.response._data
      if (responseData && typeof responseData === 'object' && 'message' in responseData) {
        return responseData.message as string
      }
      
      // Fallback to status text
      if (fetchError.response.statusText) {
        return `${fetchError.response.statusText} (${fetchError.response.status})`
      }
    }
    
    // Handle plain objects with message property
    if (typeof error === 'object' && error !== null && 'message' in error) {
      return (error as { message: string }).message
    }
    
    // Last resort: stringify the error
    try {
      return `Error: ${JSON.stringify(error)}`
    } catch {
      return 'An unknown error occurred'
    }
  }
  
  /**
   * Logs error to console with consistent formatting
   */
  const logError = (context: string, error: unknown): void => {
    console.error(`[${context}] ${getErrorMessage(error)}`, error)
  }
  
  return {
    getErrorMessage,
    logError
  }
} 