import { ref } from 'vue'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration: number
}

// Create a reactive toast state
const toasts = ref<Toast[]>([])
let toastIdCounter = 0

export function useToast() {
  // Add a new toast notification
  const showToast = ({
    message,
    type = 'info',
    duration = 5000
  }: {
    message: string;
    type?: Toast['type'];
    duration?: number;
  }) => {
    const id = ++toastIdCounter
    
    const toast: Toast = {
      id,
      message,
      type,
      duration
    }
    
    toasts.value.push(toast)
    
    // Auto remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
    
    return id
  }
  
  // Remove a toast notification by ID
  const removeToast = (id: number) => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }
  
  // Clear all toast notifications
  const clearToasts = () => {
    toasts.value = []
  }
  
  // Helper methods for common toast types
  const success = (message: string, duration = 5000) => showToast({ message, type: 'success', duration })
  const error = (message: string, duration = 5000) => showToast({ message, type: 'error', duration })
  const info = (message: string, duration = 5000) => showToast({ message, type: 'info', duration })
  const warning = (message: string, duration = 5000) => showToast({ message, type: 'warning', duration })
  
  return {
    toasts,
    showToast,
    removeToast,
    clearToasts,
    success,
    error,
    info,
    warning
  }
}