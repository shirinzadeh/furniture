import { defineStore } from 'pinia'
import type { Product } from '~/types'
import useAuthStore from './auth'

export interface CartItem {
  productId: string
  name: string
  price: number
  salePrice: number | null
  image: string
  quantity: number
  slug: string
  product: Product // Full product object for detailed display
}

// Define the store but don't export it directly
const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[],
    loading: false,
    error: null as string | null,
    initialized: false,
  }),

  getters: {
    cartItems: (state) => state.items,
    itemCount: (state) => state.items.reduce((total, item) => total + item.quantity, 0),
    totalPrice: (state) => 
      state.items.reduce((total, item) => {
        const price = item.salePrice || item.price
        return total + (price * item.quantity)
      }, 0),
    // Alias for totalPrice to match cart page usage
    total: (state) => 
      state.items.reduce((total, item) => {
        const price = item.salePrice || item.price
        return total + (price * item.quantity)
      }, 0),
    hasItems: (state) => state.items.length > 0,
    isEmpty: (state) => state.items.length === 0,
    count: (state) => state.items.length,
  },

  actions: {
    // Initialize cart - sync with database if authenticated, otherwise use localStorage
    async initCart() {
      if (this.initialized) return
      
      const authStore = useAuthStore()
      
      try {
        if (authStore.isAuthenticated) {
          // User is authenticated, load from database
          await this.syncWithDatabase()
        } else {
          // User is not authenticated, load from localStorage
          this.loadFromLocalStorage()
        }
        
        this.initialized = true
      } catch (error) {
        console.error('Failed to initialize cart:', error)
        // Fallback to localStorage
        this.loadFromLocalStorage()
        this.initialized = true
      }
    },

    // Load cart from localStorage (for anonymous users)
    loadFromLocalStorage() {
      if (process.client) {
        const savedCart = localStorage.getItem('cart')
        if (savedCart) {
          try {
            this.items = JSON.parse(savedCart)
          } catch (e) {
            console.error('Failed to parse cart from localStorage', e)
            localStorage.removeItem('cart')
            this.items = []
          }
        }
      }
    },

    // Save cart to localStorage (for anonymous users)
    saveToLocalStorage() {
      if (process.client) {
        localStorage.setItem('cart', JSON.stringify(this.items))
      }
    },

    // Sync cart with database (for authenticated users)
    async syncWithDatabase() {
      const authStore = useAuthStore()
      
      if (!authStore.isAuthenticated) {
        this.loadFromLocalStorage()
        return
      }

      this.loading = true
      
      try {
        const response = await $fetch('/api/cart') as any
        this.items = response.items.map((item: any) => ({
          ...item,
          product: {
            id: item.productId,
            name: item.name,
            slug: item.slug,
            price: item.price,
            salePrice: item.salePrice,
            images: [item.image]
          }
        }))
      } catch (error: any) {
        console.error('Failed to sync cart with database:', error)
        this.error = 'Failed to load cart'
        // Fallback to localStorage
        this.loadFromLocalStorage()
      } finally {
        this.loading = false
      }
    },

    // Add product to cart
    async addToCart(product: Product, quantity: number = 1) {
      const authStore = useAuthStore()
      
      if (authStore.isAuthenticated) {
        // Add to database
        await this.addToDatabase(product, quantity)
      } else {
        // Add to localStorage
        this.addToLocalStorage(product, quantity)
      }
    },

    // Add to database (authenticated users)
    async addToDatabase(product: Product, quantity: number) {
      this.loading = true
      this.error = null
      
      // Get product ID safely
      const productId = product.id || product._id?.toString()
      
      if (!productId) {
        throw new Error('Product ID is required')
      }
      
      try {
        const response = await $fetch('/api/cart/add', {
          method: 'POST',
          body: {
            productId,
            quantity
          }
        }) as any
        
        // Update local state with response
        this.items = response.cart.items.map((item: any) => ({
          ...item,
          product: {
            id: item.productId,
            name: item.name,
            slug: item.slug,
            price: item.price,
            salePrice: item.salePrice,
            images: [item.image]
          }
        }))
      } catch (error: any) {
        this.error = error.data?.message || 'Failed to add item to cart'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Add to localStorage (anonymous users)
    addToLocalStorage(product: Product, quantity: number) {
      // Get product ID safely
      const productId = product.id || product._id?.toString()
      
      if (!productId) {
        throw new Error('Product ID is required')
      }
      
      const existingItem = this.items.find(item => item.productId === productId)
      
      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        const cartItem: CartItem = {
          productId,
          name: product.name,
          price: product.price,
          salePrice: product.salePrice,
          image: product.images[0] || '/images/placeholder.jpg',
          quantity: quantity,
          slug: product.slug,
          product: product
        }
        this.items.push(cartItem)
      }
      
      this.saveToLocalStorage()
    },

    // Alias for addToCart for backward compatibility
    async addItem(product: Product, quantity: number = 1) {
      await this.addToCart(product, quantity)
    },

    // Remove item from cart
    async removeFromCart(productId: string) {
      const authStore = useAuthStore()
      
      if (authStore.isAuthenticated) {
        await this.updateQuantityInDatabase(productId, 0)
      } else {
        this.removeFromLocalStorage(productId)
      }
    },

    // Remove from localStorage
    removeFromLocalStorage(productId: string) {
      this.items = this.items.filter(item => item.productId !== productId)
      this.saveToLocalStorage()
    },

    // Alias for removeFromCart for backward compatibility
    async removeItem(productId: string) {
      await this.removeFromCart(productId)
    },

    // Update item quantity
    async updateQuantity(productId: string, quantity: number) {
      const authStore = useAuthStore()
      
      if (authStore.isAuthenticated) {
        await this.updateQuantityInDatabase(productId, quantity)
      } else {
        this.updateQuantityInLocalStorage(productId, quantity)
      }
    },

    // Update quantity in database
    async updateQuantityInDatabase(productId: string, quantity: number) {
      this.loading = true
      this.error = null
      
      try {
        const response = await $fetch('/api/cart/update', {
          method: 'POST',
          body: {
            productId,
            quantity
          }
        }) as any
        
        // Update local state with response
        this.items = response.cart.items.map((item: any) => ({
          ...item,
          product: {
            id: item.productId,
            name: item.name,
            slug: item.slug,
            price: item.price,
            salePrice: item.salePrice,
            images: [item.image]
          }
        }))
      } catch (error: any) {
        this.error = error.data?.message || 'Failed to update cart'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Update quantity in localStorage
    updateQuantityInLocalStorage(productId: string, quantity: number) {
      if (quantity <= 0) {
        this.removeFromLocalStorage(productId)
        return
      }
      
      const item = this.items.find(item => item.productId === productId)
      if (item) {
        item.quantity = quantity
        this.saveToLocalStorage()
      }
    },

    // Clear entire cart
    async clearCart() {
      const authStore = useAuthStore()
      
      if (authStore.isAuthenticated) {
        await this.clearDatabase()
      } else {
        this.clearLocalStorage()
      }
    },

    // Clear cart in database
    async clearDatabase() {
      this.loading = true
      this.error = null
      
      try {
        await $fetch('/api/cart/clear', {
          method: 'POST'
        })
        
        this.items = []
      } catch (error: any) {
        this.error = error.data?.message || 'Failed to clear cart'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Clear cart in localStorage
    clearLocalStorage() {
      this.items = []
      if (process.client) {
        localStorage.removeItem('cart')
      }
    },

    // Get item count for a specific product
    getItemQuantity(productId: string): number {
      const item = this.items.find(item => item.productId === productId)
      return item ? item.quantity : 0
    },

    // Check if product is in cart
    isInCart(productId: string): boolean {
      return this.items.some(item => item.productId === productId)
    },

    // Migrate localStorage cart to database when user logs in
    async migrateLocalStorageToDatabase() {
      if (!process.client) return
      
      const savedCart = localStorage.getItem('cart')
      if (!savedCart) return
      
      try {
        const localItems = JSON.parse(savedCart)
        if (!Array.isArray(localItems) || localItems.length === 0) return
        
        // Add each item to database
        for (const item of localItems) {
          try {
            // Ensure we have a valid product ID
            const productId = item.productId || item.product?.id || item.product?._id?.toString()
            
            if (!productId) {
              console.error('Skipping item migration - no valid product ID:', item)
              continue
            }
            
            await $fetch('/api/cart/add', {
              method: 'POST',
              body: {
                productId,
                quantity: item.quantity
              }
            })
          } catch (error) {
            console.error('Failed to migrate item to database:', error)
          }
        }
        
        // Clear localStorage after successful migration
        localStorage.removeItem('cart')
        
        // Sync with database to get the merged cart
        await this.syncWithDatabase()
      } catch (error) {
        console.error('Failed to migrate cart to database:', error)
      }
    },

    // Called when user logs in
    async onUserLogin() {
      await this.migrateLocalStorageToDatabase()
      this.initialized = false
      await this.initCart()
    },

    // Called when user logs out
    onUserLogout() {
      this.items = []
      this.initialized = false
      this.initCart()
    }
  },
})

// Export as default
export default useCartStore 