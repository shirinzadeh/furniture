<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold text-gray-900">Create Product</h1>
      <NuxtLink 
        to="/admin/products" 
        class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
      >
        Cancel
      </NuxtLink>
    </div>

    <form @submit.prevent="createProduct" class="bg-white shadow rounded-lg p-6">
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
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
              @input="generateSlug"
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
              <option value="">Select Category</option>
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
            Creating...
          </span>
          <span v-else>Create Product</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '~/composables/useToast'

definePageMeta({
  layout: 'admin'
})

// Router
const router = useRouter()
const toast = useToast()

// Types
interface Category {
  _id: string
  id?: string
  name: string
}

// State
const categories = ref<Category[]>([])
const isSubmitting = ref(false)

// Track the previously auto-generated slug to avoid overwriting manual edits
const previousAutoSlug = ref('')

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
  images: [] as string[]
})

// Fetch categories
const fetchCategories = async () => {
  try {
    // Fetch categories directly from API
    const response = await $fetch('/api/admin/categories')
    
    if (response && response.categories) {
      categories.value = response.categories
      console.log('Fetched categories:', response.categories)
    }
  } catch (err: any) {
    console.error('Error fetching categories:', err)
    toast.error(
      'Kategoriler Yüklenemedi',
      'Kategoriler yüklenemedi'
    )
  }
}

// Generate slug from product name
const generateSlug = () => {
  if (!form.name) return
  
  const newSlug = form.name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
  
  // Only update slug if it's empty or matches the previous auto-generated slug
  if (!form.slug || form.slug === previousAutoSlug.value) {
    form.slug = newSlug
    previousAutoSlug.value = newSlug
  }
}

// Controlled handling of image updates to prevent unwanted reactivity
const onImagesUpdate = (newImages: string[]) => {
  form.images = [...newImages]
}

// Update images when reordered
const updateImages = (newImages: string[]) => {
  form.images = [...newImages]
}

// Remove image from the list with controlled reactivity
const removeImage = (index: number) => {
  const newImages = [...form.images]
  newImages.splice(index, 1)
  form.images = newImages
}

// Create product
const createProduct = async () => {
  isSubmitting.value = true
  
  try {
    const response = await $fetch('/api/admin/products', {
      method: 'POST',
      body: {
        name: form.name,
        slug: form.slug,
        description: form.description || null,
        categoryId: form.categoryId || null,
        price: parseFloat(form.price),
        salePrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : null,
        stock: parseInt(form.stock) || 0,
        featured: form.featured,
        images: form.images,
        inStock: true
      }
    })
    
    // Show success toast
    toast.success(
      'Ürün Oluşturuldu',
      'Ürün başarıyla oluşturuldu'
    )
    
    // Redirect to product list
    router.push('/admin/products')
  } catch (err: any) {
    console.error('Error creating product:', err)
    
    // Show error toast
    toast.error(
      'Ürün Oluşturulamadı',
      err.data?.message || 'Ürün oluşturulamadı'
    )
  } finally {
    isSubmitting.value = false
  }
}

// Load categories on mount
onMounted(() => {
  fetchCategories()
})
</script>

<style>

</style> 