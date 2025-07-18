<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold text-gray-900">Edit Product</h1>
      <div class="flex space-x-3">
        <button 
          @click="confirmDelete" 
          class="px-4 py-2 border border-red-300 text-red-700 rounded-md shadow-sm text-sm font-medium bg-white hover:bg-red-50"
        >
          Delete
        </button>
        <NuxtLink 
          to="/admin/products" 
          class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </NuxtLink>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="bg-white p-6 rounded-lg shadow">
      <div class="animate-pulse space-y-6">
        <div class="h-4 bg-gray-200 rounded w-1/4"></div>
        <div class="h-10 bg-gray-200 rounded"></div>
        <div class="h-4 bg-gray-200 rounded w-1/2"></div>
        <div class="h-10 bg-gray-200 rounded"></div>
        <div class="h-32 bg-gray-200 rounded"></div>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="bg-red-50 p-4 rounded-md">
      <div class="flex">
        <div class="flex-shrink-0">
          <Icon name="mdi:alert-circle" class="h-5 w-5 text-red-400" />
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error loading product</h3>
          <div class="mt-2 text-sm text-red-700">
            <p>{{ error }}</p>
          </div>
          <div class="mt-4">
            <button 
              @click="fetchProduct" 
              class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit form -->
    <form v-else @submit.prevent="updateProduct" class="bg-white shadow rounded-lg p-6">
      <!-- Basic Information -->
      <div class="mb-8">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="col-span-2">
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
            <input 
              id="name" 
              v-model="form.name" 
              type="text" 
              required 
              @input="generateSlug"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
            />
          </div>
          
          <div class="col-span-2">
            <label for="slug" class="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
            <input 
              id="slug" 
              v-model="form.slug" 
              type="text" 
              required 
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
            />
            <p class="mt-1 text-sm text-gray-500">URL-friendly name (automatically generated from product name)</p>
          </div>
          
          <div class="col-span-2">
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              id="description" 
              v-model="form.description" 
              rows="5" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
            ></textarea>
          </div>
          
          <div>
            <label for="category" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              id="category"
              v-model="form.categoryId"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
            >
              <option value="">None</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>
          
          <div>
            <label for="featured" class="block text-sm font-medium text-gray-700 mb-1">Featured</label>
            <div class="flex items-center">
              <input 
                id="featured" 
                v-model="form.featured" 
                type="checkbox" 
                class="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
              />
              <label for="featured" class="ml-2 block text-sm text-gray-900">
                Display this product on the homepage
              </label>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Pricing and Inventory -->
      <div class="mb-8">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Pricing & Inventory</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="price" class="block text-sm font-medium text-gray-700 mb-1">Price *</label>
            <div class="relative rounded-md shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="text-gray-500 sm:text-sm">$</span>
              </div>
              <input 
                id="price" 
                v-model="form.price" 
                type="number" 
                step="0.01" 
                min="0" 
                required 
                class="pl-7 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
              />
            </div>
          </div>
          
          <div>
            <label for="compareAtPrice" class="block text-sm font-medium text-gray-700 mb-1">Compare at Price</label>
            <div class="relative rounded-md shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="text-gray-500 sm:text-sm">$</span>
              </div>
              <input 
                id="compareAtPrice" 
                v-model="form.compareAtPrice" 
                type="number" 
                step="0.01" 
                min="0" 
                class="pl-7 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
              />
            </div>
            <p class="mt-1 text-sm text-gray-500">Original price, displayed as a crossed-out value</p>
          </div>
          
          <div>
            <label for="stock" class="block text-sm font-medium text-gray-700 mb-1">Stock</label>
            <input 
              id="stock" 
              v-model="form.stock" 
              type="number" 
              min="0" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
            />
          </div>
        </div>
      </div>
      
      <!-- Images -->
      <div class="mb-8">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Images</h2>
        <AdminDraggableImageGallery 
          :images="form.images" 
          @update:images="updateImages" 
          @remove="removeImage"
        >
          <template #uploader>
            <div class="text-center p-4">
              <AdminImageUploader v-model="form.images" @update:modelValue="onImagesUpdate" />
            </div>
          </template>
        </AdminDraggableImageGallery>
      </div>
      
      <!-- Submit Button -->
      <div class="flex justify-end">
        <button 
          type="submit" 
          class="px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          :disabled="isSubmitting"
        >
          <span v-if="isSubmitting" class="flex items-center">
            <Icon name="mdi:loading" class="animate-spin -ml-1 mr-2 h-5 w-5" />
            Saving...
          </span>
          <span v-else>Save Changes</span>
        </button>
      </div>
    </form>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <div class="sm:flex sm:items-start">
          <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <Icon name="mdi:alert" class="h-6 w-6 text-red-600" />
          </div>
          <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 class="text-lg leading-6 font-medium text-gray-900">Delete Product</h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500">
                Are you sure you want to delete this product? This action cannot be undone.
              </p>
            </div>
          </div>
        </div>
        <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <button 
            type="button" 
            @click="deleteProduct" 
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting" class="flex items-center">
              <Icon name="mdi:loading" class="animate-spin -ml-1 mr-2 h-4 w-4" />
              Deleting...
            </span>
            <span v-else>Delete</span>
          </button>
          <button 
            type="button" 
            @click="showDeleteModal = false" 
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:w-auto sm:text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from '~/composables/useToast'

definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})

const route = useRoute()
const router = useRouter()
const { showToast } = useToast()

// Get product ID from route
const productId = route.params.id

// State
const categories = ref([])
const loading = ref(true)
const error = ref(null)
const isSubmitting = ref(false)
const showDeleteModal = ref(false)

// Form state
const form = reactive({
  name: '',
  slug: '',
  description: '',
  categoryId: '',
  price: '',
  compareAtPrice: '',
  stock: '0',
  featured: false,
  images: []
})

// Track the previous auto-generated slug to detect if user has manually changed it
const previousAutoSlug = ref('');

// Fetch categories
const fetchCategories = async () => {
  try {
    const { data } = await useFetch('/api/admin/categories')
    if (data.value && data.value.categories) {
      categories.value = data.value.categories
    }
  } catch (err) {
    console.error('Error fetching categories:', err)
    showToast({
      message: 'Failed to load categories',
      type: 'error'
    })
  }
}

// Fetch product
const fetchProduct = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await useFetch(`/api/admin/products/${productId}`)
    
    if (response.error.value) {
      throw new Error(response.error.value.message || 'Failed to load product')
    }
    
    // The API returns the product directly, not wrapped in a 'product' property
    if (response.data.value) {
      const product = response.data.value
      
      // Populate form with product data
      form.name = product.name
      form.slug = product.slug
      // Initialize the previousAutoSlug with the current slug
      // This prevents auto-generation from overwriting an existing slug
      previousAutoSlug.value = product.slug
      form.description = product.description || ''
      form.categoryId = product.categoryId || ''
      form.price = product.price.toString()
      form.compareAtPrice = product.salePrice ? product.salePrice.toString() : ''
      form.stock = product.stock !== undefined ? product.stock.toString() : '0'
      form.featured = product.featured || false
      form.images = product.images || []
    } else {
      throw new Error('Product not found')
    }
  } catch (err) {
    console.error('Error fetching product:', err)
    error.value = err.message || 'Failed to load product'
    showToast({
      message: error.value,
      type: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Generate slug from name
const generateSlug = () => {
  // Only auto-generate slug if it's empty or if it was previously auto-generated
  // This allows users to manually set a custom slug if they want
  const currentSlug = form.slug;
  const autoGeneratedSlug = form.name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  // If slug is empty or matches a previous auto-generation of the name, update it
  if (!currentSlug || currentSlug === previousAutoSlug.value) {
    form.slug = autoGeneratedSlug;
    previousAutoSlug.value = autoGeneratedSlug;
  }
}

// Auto-generate slug when name changes if slug is empty
const autoGenerateSlug = () => {
  if (!form.slug) {
    generateSlug()
  }
}

// Controlled handling of image updates to prevent unwanted reactivity
const onImagesUpdate = (newImages) => {
  form.images = [...newImages]
}

// Update images when reordered
const updateImages = (newImages) => {
  form.images = [...newImages]
}

// Remove image from the list with controlled reactivity
const removeImage = (index) => {
  const newImages = [...form.images]
  newImages.splice(index, 1)
  form.images = newImages
}

// Update product
const updateProduct = async () => {
  isSubmitting.value = true
  
  try {
    const response = await useFetch(`/api/admin/products/${productId}`, {
      method: 'PUT',
      body: {
        name: form.name,
        slug: form.slug,
        description: form.description || null,
        categoryId: form.categoryId || null,
        price: parseFloat(form.price),
        salePrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : null,
        stock: parseInt(form.stock) || 0,
        featured: form.featured,
        images: form.images
      }
    })
    
    if (response.error.value) {
      const errorMessage = response.error.value.data?.message || response.error.value.message || 'Failed to update product'
      throw new Error(errorMessage)
    }
    
    // Show success toast
    showToast({
      title: 'Product Updated',
      message: 'Product has been updated successfully',
      type: 'success'
    })
    
    // Refresh product data
    await fetchProduct()
  } catch (err) {
    console.error('Error updating product:', err)
    showToast({
      title: 'Update Failed',
      message: err.message || 'Failed to update product',
      type: 'error'
    })
  } finally {
    isSubmitting.value = false
  }
}

// Confirm delete
const confirmDelete = () => {
  showDeleteModal.value = true
}

// Delete product
const deleteProduct = async () => {
  isSubmitting.value = true
  
  try {
    const response = await useFetch(`/api/admin/products/${productId}`, {
      method: 'DELETE'
    })
    
    if (response.error.value) {
      throw new Error(response.error.value.message || 'Failed to delete product')
    }
    
    // Show success toast
    showToast({
      message: 'Product deleted successfully',
      type: 'success'
    })
    
    // Redirect to product list
    router.push('/admin/products')
  } catch (err) {
    console.error('Error deleting product:', err)
    showToast({
      message: err.message || 'Failed to delete product',
      type: 'error'
    })
    showDeleteModal.value = false
  } finally {
    isSubmitting.value = false
  }
}

// Load data on mount
onMounted(() => {
  fetchCategories()
  fetchProduct()
})
</script>

<style>
</style> 