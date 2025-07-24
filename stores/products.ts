import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'
import type { Product } from '~/types'

interface ProductsState {
  products: Product[]
  featuredProducts: Product[]
  recommendedProducts: Product[]
  saleProducts: Product[]
  bestsellerProducts: Product[]
  currentProduct: Product | null
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
  // Category-specific caching
  categoryProducts: Record<string, {
    products: Product[]
    totalItems: number
    lastFetched: number
    allLoaded: boolean
  }>
}

// Define the store but don't export it directly
const useProductsStore = defineStore('products', {
  state: (): ProductsState => ({
    products: [],
    featuredProducts: [],
    recommendedProducts: [],
    saleProducts: [],
    bestsellerProducts: [],
    currentProduct: null,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 12,
      totalItems: 0,
      totalPages: 0
    },
    categoryProducts: {}
  }),
  
  getters: {
    getProductBySlug: (state) => (slug: string) => {
      return state.products.find(product => product.slug === slug) || null
    }
  },
  
  actions: {
    // Make sure arrays are initialized to prevent "x is not iterable" errors
    ensureArraysInitialized() {
      if (!Array.isArray(this.products)) {
        this.products = []
      }
      if (!Array.isArray(this.featuredProducts)) {
        this.featuredProducts = []
      }
      if (!Array.isArray(this.recommendedProducts)) {
        this.recommendedProducts = []
      }
      if (!Array.isArray(this.saleProducts)) {
        this.saleProducts = []
      }
      if (!Array.isArray(this.bestsellerProducts)) {
        this.bestsellerProducts = []
      }
    },
    
    // Clear cached data to force a fresh fetch
    clearCache() {
      this.products = []
      this.featuredProducts = []
      this.recommendedProducts = []
      this.saleProducts = []
      this.bestsellerProducts = []
      this.currentProduct = null
      this.error = null
      this.pagination = {
        page: 1,
        limit: 12,
        totalItems: 0,
        totalPages: 0
      }
      this.categoryProducts = {}
    },

    // Category-specific caching methods
    getCachedCategoryProducts(categoryId: string) {
      return this.categoryProducts[categoryId] || null
    },

    hasCachedCategoryProducts(categoryId: string, cacheTimeout = 5 * 60 * 1000) { // 5 minutes
      const cached = this.categoryProducts[categoryId]
      if (!cached) return false
      
      const now = Date.now()
      const isExpired = now - cached.lastFetched > cacheTimeout
      return !isExpired
    },

    setCategoryProducts(categoryId: string, products: Product[], totalItems: number, allLoaded = false) {
      this.categoryProducts[categoryId] = {
        products: [...products],
        totalItems,
        lastFetched: Date.now(),
        allLoaded
      }
    },

    appendCategoryProducts(categoryId: string, newProducts: Product[], totalItems: number, allLoaded = false) {
      const existing = this.categoryProducts[categoryId]
      if (existing) {
        // Avoid duplicates by filtering out products that already exist
        const existingIds = new Set(existing.products.map(p => p.id))
        const uniqueNewProducts = newProducts.filter(p => !existingIds.has(p.id))
        
        this.categoryProducts[categoryId] = {
          products: [...existing.products, ...uniqueNewProducts],
          totalItems,
          lastFetched: Date.now(),
          allLoaded
        }
      } else {
        this.setCategoryProducts(categoryId, newProducts, totalItems, allLoaded)
      }
    },
    
    async fetchProducts(params: { 
      page?: number; 
      limit?: number; 
      categoryId?: string;
      featured?: boolean;
      search?: string;
    } = {}) {
      this.loading = true
      this.error = null
      this.ensureArraysInitialized()
      
      try {
        const api = useApi()
        const queryParams = new URLSearchParams()
        
        if (params.page) queryParams.append('page', params.page.toString())
        if (params.limit) queryParams.append('limit', params.limit.toString())
        if (params.categoryId) queryParams.append('categoryId', params.categoryId)
        if (params.featured) queryParams.append('featured', 'true')
        if (params.search) queryParams.append('search', params.search)
        
        const response = await api.fetchRaw<{
          products: Product[];
          pagination: ProductsState['pagination'];
        }>(`/api/products?${queryParams.toString()}`)
        
        this.products = response.products || []
        this.pagination = response.pagination
        
        return this.products
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch products'
        return []
      } finally {
        this.loading = false
      }
    },
    
    async fetchFeaturedProducts(limit = 6) {
      this.ensureArraysInitialized()
      
      try {
        const api = useApi()
        const response = await api.fetchRaw<{
          products: Product[];
          pagination: ProductsState['pagination'];
        }>(`/api/products?featured=true&limit=${limit}`)
        
        this.featuredProducts = response.products || []
        return this.featuredProducts
      } catch (error: any) {
        console.error('Failed to fetch featured products:', error)
        return []
      }
    },
    
    // Add method to fetch products on sale
    async fetchSaleProducts(limit = 6) {
      this.ensureArraysInitialized()
      
      try {
        const api = useApi()
        const response = await api.fetchRaw<{
          products: Product[];
          pagination: ProductsState['pagination'];
        }>(`/api/products?onSale=true&limit=${limit}`)
        
        this.saleProducts = response.products || []
        return this.saleProducts
      } catch (error: any) {
        console.error('Failed to fetch sale products:', error)
        return []
      }
    },
    
    // Add method to fetch bestseller products
    async fetchBestsellerProducts(limit = 6) {
      this.ensureArraysInitialized()
      
      try {
        const api = useApi()
        const response = await api.fetchRaw<{
          products: Product[];
          pagination: ProductsState['pagination'];
        }>(`/api/products?bestseller=true&limit=${limit}`)
        
        this.bestsellerProducts = response.products || []
        return this.bestsellerProducts
      } catch (error: any) {
        console.error('Failed to fetch bestseller products:', error)
        return []
      }
    },
    
    async fetchRecommendedProducts(productId?: string, limit = 4) {
      this.ensureArraysInitialized()
      
      try {
        const api = useApi()
        const queryParams = new URLSearchParams()
        
        queryParams.append('limit', limit.toString())
        
        // Only include excludeId if it's a valid MongoDB ObjectId
        // MongoDB ObjectIds are 24 character hex strings
        if (productId && /^[0-9a-fA-F]{24}$/.test(productId)) {
          queryParams.append('excludeId', productId)
        }
        
        const response = await api.fetchRaw<{
          products: Product[];
          pagination: ProductsState['pagination'];
        }>(`/api/products?recommended=true&${queryParams.toString()}`)
        
        this.recommendedProducts = response.products || []
        return this.recommendedProducts
      } catch (error: any) {
        console.error('Failed to fetch recommended products:', error)
        return []
      }
    },
    
    async fetchProductBySlug(slug: string) {
      this.loading = true
      this.error = null
      
      try {
        const api = useApi()
        const product = await api.fetchRaw<Product>(`/api/products/${slug}`)
        
        this.currentProduct = product
        return product
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch product'
        return null
      } finally {
        this.loading = false
      }
    },
    
    // Admin actions
    async createProduct(productData: Partial<Product>) {
      this.loading = true
      this.error = null
      
      try {
        const api = useApi()
        const product = await api.fetchRaw<Product>('/api/admin/products', {
          method: 'POST',
          body: productData
        })
        
        return product
      } catch (error: any) {
        this.error = error.message || 'Failed to create product'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async updateProduct(id: string, productData: Partial<Product>) {
      this.loading = true
      this.error = null
      
      try {
        const api = useApi()
        const product = await api.fetchRaw<Product>(`/api/admin/products/${id}`, {
          method: 'PUT',
          body: productData
        })
        
        return product
      } catch (error: any) {
        this.error = error.message || 'Failed to update product'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async deleteProduct(id: string) {
      this.loading = true
      this.error = null
      
      try {
        const api = useApi()
        const response = await api.fetchRaw<{ success: boolean; message: string; id: string }>(
          `/api/admin/products/${id}`,
          { method: 'DELETE' }
        )
        
        return response.success
      } catch (error: any) {
        this.error = error.message || 'Failed to delete product'
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})

// Export as default
export default useProductsStore 