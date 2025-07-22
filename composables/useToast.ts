import { reactive, readonly } from 'vue'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  actions?: Array<{
    label: string
    action: () => void
    primary?: boolean
  }>
}

interface ToastState {
  toasts: Toast[]
}

const state: ToastState = reactive({
  toasts: []
})

let toastCounter = 0

export const useToast = () => {
  const generateId = () => `toast-${++toastCounter}-${Date.now()}`

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = generateId()
    const newToast: Toast = {
      id,
      duration: 5000, // Default 5 seconds
      ...toast
    }
    
    state.toasts.push(newToast)
    
    // Auto remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }
    
    return id
  }

  const removeToast = (id: string) => {
    const index = state.toasts.findIndex(toast => toast.id === id)
    if (index > -1) {
      state.toasts.splice(index, 1)
    }
  }

  const clearAll = () => {
    state.toasts.splice(0)
  }

  // Specific toast types
  const success = (title: string, message?: string, options?: Partial<Toast>) => {
    return addToast({ type: 'success', title, message, ...options })
  }

  const error = (title: string, message?: string, options?: Partial<Toast>) => {
    return addToast({ type: 'error', title, message, duration: 7000, ...options })
  }

  const warning = (title: string, message?: string, options?: Partial<Toast>) => {
    return addToast({ type: 'warning', title, message, ...options })
  }

  const info = (title: string, message?: string, options?: Partial<Toast>) => {
    return addToast({ type: 'info', title, message, ...options })
  }

  // Cart-specific methods
  const cartAdded = (productName: string, quantity: number = 1) => {
    return success(
      'Ürün sepete eklendi!',
      `${productName} (${quantity} adet) sepetinize eklendi.`,
      {
        duration: 3000,
        actions: [
          {
            label: 'Sepete Git',
            action: () => {
              navigateTo('/cart')
            },
            primary: true
          }
        ]
      }
    )
  }

  const cartUpdated = (productName: string, quantity: number) => {
    return success(
      'Sepet güncellendi',
      `${productName} miktarı ${quantity} olarak güncellendi.`,
      { duration: 2000 }
    )
  }

  const cartRemoved = (productName: string) => {
    return info(
      'Ürün sepetten çıkarıldı',
      `${productName} sepetinizden kaldırıldı.`,
      { duration: 2000 }
    )
  }

  const cartCleared = () => {
    return info(
      'Sepet temizlendi',
      'Tüm ürünler sepetinizden kaldırıldı.',
      { duration: 2000 }
    )
  }

  const cartError = (message: string = 'Bir hata oluştu') => {
    return error(
      'Sepet Hatası',
      message,
      { duration: 5000 }
    )
  }

  return {
    // State
    toasts: readonly(state.toasts),
    
    // Core methods
    addToast,
    removeToast,
    clearAll,
    
    // Type-specific methods
    success,
    error,
    warning,
    info,
    
    // Cart-specific methods
    cartAdded,
    cartUpdated,
    cartRemoved,
    cartCleared,
    cartError
  }
}