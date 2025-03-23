import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'
import type { Banner } from '~/types'

interface BannersState {
  banners: Banner[]
  loading: boolean
  error: string | null
}

// Define the store but don't export it directly
const useBannersStore = defineStore('banners', {
  state: (): BannersState => ({
    banners: [],
    loading: false,
    error: null
  }),
  
  actions: {
    // Make sure arrays are initialized to prevent "x is not iterable" errors
    ensureArraysInitialized() {
      if (!Array.isArray(this.banners)) {
        this.banners = []
      }
    },
    
    async fetchBanners(activeOnly = true) {
      this.loading = true
      this.error = null
      this.ensureArraysInitialized()
      
      try {
        const api = useApi()
        const queryParams = new URLSearchParams()
        
        queryParams.append('activeOnly', activeOnly ? 'true' : 'false')
        
        const banners = await api.fetchRaw<Banner[]>(
          `/api/banners?${queryParams.toString()}`
        )
        
        this.banners = banners || []
        return this.banners
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch banners'
        return []
      } finally {
        this.loading = false
      }
    },
    
    // Admin actions
    async createBanner(bannerData: Partial<Banner>) {
      this.loading = true
      this.error = null
      
      try {
        const api = useApi()
        const banner = await api.fetchRaw<Banner>('/api/admin/banners', {
          method: 'POST',
          body: bannerData
        })
        
        // Refresh banners after creation
        await this.fetchBanners(false)
        
        return banner
      } catch (error: any) {
        this.error = error.message || 'Failed to create banner'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async updateBanner(id: string, bannerData: Partial<Banner>) {
      this.loading = true
      this.error = null
      this.ensureArraysInitialized()
      
      try {
        const api = useApi()
        const banner = await api.fetchRaw<Banner>(`/api/admin/banners/${id}`, {
          method: 'PUT',
          body: bannerData
        })
        
        // Update local state
        const index = this.banners.findIndex(b => b.id === id)
        if (index !== -1) {
          this.banners[index] = banner
        }
        
        return banner
      } catch (error: any) {
        this.error = error.message || 'Failed to update banner'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async deleteBanner(id: string) {
      this.loading = true
      this.error = null
      this.ensureArraysInitialized()
      
      try {
        const api = useApi()
        const response = await api.fetchRaw<{ success: boolean; message: string; id: string }>(
          `/api/admin/banners/${id}`,
          { method: 'DELETE' }
        )
        
        // Remove from local state if successful
        if (response.success) {
          this.banners = this.banners.filter(b => b.id !== id)
        }
        
        return response.success
      } catch (error: any) {
        this.error = error.message || 'Failed to delete banner'
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})

// Export as default
export default useBannersStore 