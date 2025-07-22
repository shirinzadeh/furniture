import { defineStore } from 'pinia'
import type { Product } from '~/types'
import useAuthStore from './auth'

export interface FavoriteItem {
  id: string
  productId: string
  addedAt: string
  product: Product
}

// Define the store but don't export it directly
const useFavoritesStore = defineStore('favorites', {
  state: () => ({
    favorites: [] as FavoriteItem[],
    favoriteMap: {} as Record<string, boolean>,
    loading: false,
    error: null as string | null,
    initialized: false,
  }),

  getters: {
    favoriteItems: (state) => state.favorites,
    favoriteCount: (state) => state.favorites.length,
    hasFavorites: (state) => state.favorites.length > 0,
    isEmpty: (state) => state.favorites.length === 0,
  },

  actions: {
    // Initialize favorites - load from database if authenticated
    async initFavorites() {
      if (this.initialized) return
      
      const authStore = useAuthStore()
      
      if (!authStore.isAuthenticated) {
        this.favorites = []
        this.favoriteMap = {}
        this.initialized = true
        return
      }

      await this.loadFavorites()
      this.initialized = true
    },

    // Load favorites from database
    async loadFavorites() {
      const authStore = useAuthStore()
      
      if (!authStore.isAuthenticated) {
        this.favorites = []
        this.favoriteMap = {}
        return
      }

      this.loading = true
      this.error = null
      
      try {
        const response = await $fetch('/api/favorites') as any
        this.favorites = response.favorites
        
        // Update favorite map for quick lookups
        this.updateFavoriteMap()
      } catch (error: any) {
        console.error('Failed to load favorites:', error)
        this.error = 'Failed to load favorites'
      } finally {
        this.loading = false
      }
    },

    // Update favorite map for quick isFavorite lookups
    updateFavoriteMap() {
      this.favoriteMap = {}
      this.favorites.forEach(favorite => {
        this.favoriteMap[favorite.productId] = true
      })
    },

    // Toggle favorite status of a product
    async toggleFavorite(productId: string) {
      const authStore = useAuthStore()
      
      if (!authStore.isAuthenticated) {
        throw new Error('You must be logged in to add favorites')
      }

      this.loading = true
      this.error = null
      
      try {
        const response = await $fetch('/api/favorites/toggle', {
          method: 'POST',
          body: { productId }
        }) as any
        
        if (response.isFavorite) {
          // Product was added to favorites - reload to get full product data
          await this.loadFavorites()
        } else {
          // Product was removed from favorites
          this.favorites = this.favorites.filter(fav => fav.productId !== productId)
          this.updateFavoriteMap()
        }
        
        return response.isFavorite
      } catch (error: any) {
        this.error = error.data?.message || 'Failed to update favorites'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Check if product is in favorites
    isFavorite(productId: string): boolean {
      return !!this.favoriteMap[productId]
    },

    // Check favorite status for multiple products
    async checkFavorites(productIds: string[]) {
      const authStore = useAuthStore()
      
      if (!authStore.isAuthenticated) {
        return productIds.reduce((map, id) => {
          map[id] = false
          return map
        }, {} as Record<string, boolean>)
      }

      try {
        const response = await $fetch('/api/favorites/check', {
          method: 'POST',
          body: { productIds }
        }) as any
        
        // Update local favorite map
        Object.assign(this.favoriteMap, response.favorites)
        
        return response.favorites
      } catch (error: any) {
        console.error('Failed to check favorites:', error)
        return productIds.reduce((map, id) => {
          map[id] = false
          return map
        }, {} as Record<string, boolean>)
      }
    },

    // Remove favorite by productId
    async removeFavorite(productId: string) {
      const isFavorite = this.isFavorite(productId)
      
      if (isFavorite) {
        await this.toggleFavorite(productId)
      }
    },

    // Clear all favorites (when user logs out)
    clearFavorites() {
      this.favorites = []
      this.favoriteMap = {}
      this.initialized = false
    },

    // Called when user logs in
    async onUserLogin() {
      this.initialized = false
      await this.initFavorites()
    },

    // Called when user logs out
    onUserLogout() {
      this.clearFavorites()
    }
  },
})

// Export as default
export default useFavoritesStore 