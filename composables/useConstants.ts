// Common pagination constants
export const PAGINATION = {
  DEFAULT_ITEMS_PER_PAGE: 12,
  ADMIN_ITEMS_PER_PAGE: 20,
  SUGGESTIONS_LIMIT: 5,
  MAX_RETRIES: 3
} as const

// API timeouts and delays
export const TIMEOUTS = {
  SEARCH_DEBOUNCE: 300,
  API_TIMEOUT: 10000,
  SUGGESTION_HIDE_DELAY: 200,
  RETRY_DELAY: 1000
} as const

// UI Constants
export const UI = {
  LOADING_SKELETON_COUNT: 8,
  TOAST_DURATION: 5000,
  ERROR_TOAST_DURATION: 7000,
  SUCCESS_TOAST_DURATION: 3000
} as const

// Product constants
export const PRODUCT = {
  DEFAULT_SORT: 'newest',
  MIN_SEARCH_LENGTH: 2,
  MAX_DISCOUNT_DISPLAY: 99
} as const

// Layout breakpoints (matching Tailwind)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const

// Common error messages
export const ERROR_MESSAGES = {
  GENERIC: 'Bir hata oluştu. Lütfen tekrar deneyin.',
  NETWORK: 'Bağlantı hatası. İnternet bağlantınızı kontrol edin.',
  TIMEOUT: 'İşlem zaman aşımına uğradı. Lütfen tekrar deneyin.',
  NOT_FOUND: 'Aradığınız içerik bulunamadı.',
  UNAUTHORIZED: 'Bu işlem için yetkiniz bulunmamaktadır.',
  VALIDATION: 'Lütfen tüm alanları doğru şekilde doldurun.'
} as const

// Success messages
export const SUCCESS_MESSAGES = {
  SAVED: 'Başarıyla kaydedildi.',
  UPDATED: 'Başarıyla güncellendi.',
  DELETED: 'Başarıyla silindi.',
  ADDED_TO_CART: 'Ürün sepete eklendi.',
  ADDED_TO_FAVORITES: 'Ürün favorilere eklendi.',
  REMOVED_FROM_FAVORITES: 'Ürün favorilerden çıkarıldı.'
} as const

// Export all constants for easy import
export const CONSTANTS = {
  PAGINATION,
  TIMEOUTS,
  UI,
  PRODUCT,
  BREAKPOINTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
} as const 