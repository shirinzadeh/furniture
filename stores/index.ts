// Re-export all stores for easier imports
import useAuthStoreImpl from './auth'
import useAdminStoreImpl from './admin'
import useProductsStoreImpl from './products'
import useCategoriesStoreImpl from './categories'
import useBannersStoreImpl from './banners'
import useCartStoreImpl from './cart'

// Export with consistent naming for use throughout the app
export const useAuthStore = useAuthStoreImpl
export const useAdminStore = useAdminStoreImpl
export const useProductsStore = useProductsStoreImpl
export const useCategoriesStore = useCategoriesStoreImpl
export const useBannersStore = useBannersStoreImpl
export const useCartStore = useCartStoreImpl 