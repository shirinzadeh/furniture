import { defineStore } from 'pinia'

export interface CartItem {
  productId: string
  name: string
  price: number
  image: string
  quantity: number
  slug: string
  product?: string // Add product field for backward compatibility
}

// Define the store but don't export it directly
const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[],
    loading: false,
    error: null as string | null,
  }),

  getters: {
    cartItems: (state) => state.items,
    itemCount: (state) => state.items.reduce((total, item) => total + item.quantity, 0),
    totalPrice: (state) => 
      state.items.reduce((total, item) => total + (item.price * item.quantity), 0),
    hasItems: (state) => state.items.length > 0,
    isEmpty: (state) => state.items.length === 0,
    count: (state) => state.items.length,
  },

  actions: {
    addToCart(product: CartItem) {
      const existingItem = this.items.find(item => item.productId === product.productId)
      
      if (existingItem) {
        existingItem.quantity += product.quantity
      } else {
        this.items.push(product)
      }
      
      // Persist to localStorage on client side
      if (process.client) {
        localStorage.setItem('cart', JSON.stringify(this.items))
      }
    },
    
    // Alias for addToCart for backward compatibility
    addItem(product: CartItem) {
      this.addToCart(product)
    },
    
    removeFromCart(productId: string) {
      this.items = this.items.filter(item => item.productId !== productId)
      
      // Update localStorage
      if (process.client) {
        localStorage.setItem('cart', JSON.stringify(this.items))
      }
    },
    
    // Alias for removeFromCart for backward compatibility
    removeItem(productId: string) {
      this.removeFromCart(productId)
    },
    
    updateQuantity(productId: string, quantity: number) {
      const item = this.items.find(item => item.productId === productId)
      if (item) {
        item.quantity = quantity
        
        // Update localStorage
        if (process.client) {
          localStorage.setItem('cart', JSON.stringify(this.items))
        }
      }
    },
    
    clearCart() {
      this.items = []
      
      // Clear from localStorage
      if (process.client) {
        localStorage.removeItem('cart')
      }
    },
    
    // Initialize cart from localStorage
    initCart() {
      if (process.client) {
        const savedCart = localStorage.getItem('cart')
        if (savedCart) {
          try {
            this.items = JSON.parse(savedCart)
          } catch (e) {
            console.error('Failed to parse cart from localStorage', e)
            localStorage.removeItem('cart')
          }
        }
      }
    }
  },
})

// Export as default
export default useCartStore 