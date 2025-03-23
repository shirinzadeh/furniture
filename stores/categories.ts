import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'
import type { Category } from '~/types'

interface CategoriesState {
  categories: Category[]
  currentCategory: Category | null
  loading: boolean
  error: string | null
}

export const useCategoriesStore = defineStore('categories', {
  state: (): CategoriesState => ({
    categories: [],
    currentCategory: null,
    loading: false,
    error: null
  }),
  
  getters: {
    getCategoryBySlug: (state) => (slug: string) => {
      return state.categories.find(category => category.slug === slug) || null
    }
  },
  
  actions: {
    // Make sure arrays are initialized to prevent "x is not iterable" errors
    ensureArraysInitialized() {
      if (!Array.isArray(this.categories)) {
        this.categories = []
      }
    },
    
    async fetchCategories(includeProductCount = false) {
      this.loading = true
      this.error = null
      this.ensureArraysInitialized()
      
      try {
        const api = useApi()
        const queryParams = new URLSearchParams()
        
        if (includeProductCount) {
          queryParams.append('includeProductCount', 'true')
        }
        
        const categories = await api.fetchRaw<Category[]>(
          `/api/categories?${queryParams.toString()}`
        )
        
        this.categories = categories || []
        return this.categories
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch categories'
        return []
      } finally {
        this.loading = false
      }
    },
    
    async fetchCategoryBySlug(slug: string) {
      this.loading = true
      this.error = null
      
      try {
        const api = useApi()
        const category = await api.fetchRaw<Category>(`/api/categories/${slug}`)
        
        this.currentCategory = category
        return category
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch category'
        return null
      } finally {
        this.loading = false
      }
    },
    
    // Admin actions
    async createCategory(categoryData: Partial<Category>) {
      this.loading = true
      this.error = null
      
      try {
        const api = useApi()
        const category = await api.fetchRaw<Category>('/api/admin/categories', {
          method: 'POST',
          body: categoryData
        })
        
        // Refresh categories after creation
        await this.fetchCategories()
        
        return category
      } catch (error: any) {
        this.error = error.message || 'Failed to create category'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async updateCategory(id: string, categoryData: Partial<Category>) {
      this.loading = true
      this.error = null
      this.ensureArraysInitialized()
      
      try {
        const api = useApi()
        const category = await api.fetchRaw<Category>(`/api/admin/categories/${id}`, {
          method: 'PUT',
          body: categoryData
        })
        
        // Update local state
        const index = this.categories.findIndex(c => c.id === id)
        if (index !== -1) {
          this.categories[index] = category
        }
        
        return category
      } catch (error: any) {
        this.error = error.message || 'Failed to update category'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async deleteCategory(id: string) {
      this.loading = true
      this.error = null
      this.ensureArraysInitialized()
      
      try {
        const api = useApi()
        const response = await api.fetchRaw<{ success: boolean; message: string; id: string }>(
          `/api/admin/categories/${id}`,
          { method: 'DELETE' }
        )
        
        // Remove from local state if successful
        if (response.success) {
          this.categories = this.categories.filter(c => c.id !== id)
        }
        
        return response.success
      } catch (error: any) {
        this.error = error.message || 'Failed to delete category'
        throw error
      } finally {
        this.loading = false
      }
    }
  }
}) 