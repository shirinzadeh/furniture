import { ref, nextTick } from 'vue'
import type { Product } from '~/types'

export interface ProductListingOptions {
  itemsPerPage?: number
  enableInfiniteScroll?: boolean
  autoReset?: boolean
}

export const useProductListing = (options: ProductListingOptions = {}) => {
  const {
    itemsPerPage = 12,
    enableInfiniteScroll = true,
    autoReset = true
  } = options

  // State
  const products = ref<Product[]>([])
  const currentPage = ref(1)
  const totalPages = ref(1)
  const totalProducts = ref(0)
  const hasMoreProducts = ref(true)
  const isLoadingMore = ref(false)
  const showLoadingIndicator = ref(false)
  const error = ref<string | null>(null)
  const observerRef = ref<HTMLElement | null>(null)

  // Observer for infinite scroll
  let observer: IntersectionObserver | null = null

  // Reset pagination state
  const resetPagination = () => {
    currentPage.value = 1
    products.value = []
    hasMoreProducts.value = true
    isLoadingMore.value = false
    showLoadingIndicator.value = false
    error.value = null
  }

  // Update pagination data from API response
  const updatePagination = (paginationData: {
    page?: number
    totalPages?: number
    total?: number
    pages?: number
    totalItems?: number
  }) => {
    if (paginationData.totalPages) {
      totalPages.value = paginationData.totalPages
    } else if (paginationData.pages) {
      totalPages.value = paginationData.pages
    }
    
    if (paginationData.total) {
      totalProducts.value = paginationData.total
    } else if (paginationData.totalItems) {
      totalProducts.value = paginationData.totalItems
    }
    
    hasMoreProducts.value = currentPage.value < totalPages.value
  }

  // Add products to the list (for initial fetch or infinite scroll)
  const addProducts = (newProducts: Product[], reset = false) => {
    if (reset || currentPage.value === 1) {
      products.value = newProducts
    } else {
      products.value = [...products.value, ...newProducts]
    }
  }

  // Setup intersection observer for infinite scroll
  const setupInfiniteScroll = (loadMoreCallback: () => Promise<void>) => {
    if (!import.meta.client || !enableInfiniteScroll) return

    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreProducts.value && !isLoadingMore.value) {
          loadMoreCallback()
        }
      },
      { threshold: 0.1 }
    )

    nextTick(() => {
      if (observerRef.value) {
        observer?.observe(observerRef.value)
      }
    })
  }

  // Load more products for infinite scroll
  const loadMore = async (fetchCallback: () => Promise<void>) => {
    if (isLoadingMore.value || !hasMoreProducts.value) return
    
    currentPage.value++
    isLoadingMore.value = true
    
    try {
      await fetchCallback()
    } finally {
      isLoadingMore.value = false
    }
  }

  // Cleanup observer
  const cleanup = () => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }

  return {
    // State
    products,
    currentPage,
    totalPages,
    totalProducts,
    hasMoreProducts,
    isLoadingMore,
    showLoadingIndicator,
    error,
    observerRef,
    itemsPerPage,

    // Methods
    resetPagination,
    updatePagination,
    addProducts,
    setupInfiniteScroll,
    loadMore,
    cleanup
  }
} 