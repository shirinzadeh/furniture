<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold text-gray-900">Categories</h1>
      <button 
        @click="showCreateModal = true" 
        class="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 flex items-center"
      >
        <Icon name="mdi:plus" class="mr-2" />
        Add Category
      </button>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="bg-white p-6 rounded-lg shadow mb-6">
      <div class="animate-pulse flex space-x-4">
        <div class="flex-1 space-y-4 py-1">
          <div class="h-4 bg-gray-200 rounded w-3/4"></div>
          <div class="space-y-2">
            <div class="h-4 bg-gray-200 rounded"></div>
            <div class="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="bg-red-50 p-4 rounded-md mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <Icon name="mdi:alert-circle" class="h-5 w-5 text-red-400" />
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error loading categories</h3>
          <div class="mt-2 text-sm text-red-700">
            <p>{{ error }}</p>
          </div>
          <div class="mt-4">
            <button 
              @click="fetchCategories" 
              class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="categories.length === 0" class="bg-white p-12 rounded-lg shadow text-center mb-6">
      <Icon name="mdi:folder-open" class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-sm font-medium text-gray-900">No categories</h3>
      <p class="mt-1 text-sm text-gray-500">Get started by creating a new category.</p>
      <div class="mt-6">
        <button 
          @click="showCreateModal = true" 
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          <Icon name="mdi:plus" class="-ml-1 mr-2 h-5 w-5" />
          New Category
        </button>
      </div>
    </div>

    <!-- Categories table -->
    <div v-else class="bg-white shadow rounded-lg mb-6">
      <div class="grid overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Slug
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Products
              </th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="category in categories" :key="category.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center overflow-hidden">
                  <img v-if="category.image" :src="category.image" alt="" class="h-10 w-10 object-cover" />
                  <Icon v-else name="mdi:image-off" class="h-5 w-5 text-gray-400" />
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ category.name }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">{{ category.slug }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500 flex items-center">
                  <span class="mr-1">{{ category._count?.products || 0 }}</span>
                  <span v-if="(category._count?.products ?? 0) > 0" 
                        class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    In use
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                  @click="editCategory(category)" 
                  class="text-gray-600 hover:text-gray-900 mr-3"
                >
                  <Icon name="mdi:pencil" class="h-5 w-5" />
                </button>
                <button 
                  @click="confirmDelete(category)" 
                  class="text-red-600 hover:text-red-900 relative group"
                  :disabled="(category._count?.products ?? 0) > 0"
                  :class="{ 'opacity-50 cursor-not-allowed': (category._count?.products ?? 0) > 0 }"
                >
                  <Icon name="mdi:delete" class="h-5 w-5" />
                  <div v-if="(category._count?.products ?? 0) > 0" 
                       class="absolute bottom-full right-0 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    Cannot delete category with products ({{ category._count?.products }} products)
                  </div>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">
            {{ showEditModal ? 'Edit Category' : 'Create Category' }}
          </h3>
          <button @click="closeModals" class="text-gray-400 hover:text-gray-500">
            <Icon name="mdi:close" class="h-6 w-6" />
          </button>
        </div>
        
        <form @submit.prevent="showEditModal ? updateCategory() : createCategory()">
          <div class="mb-4">
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input 
              id="name" 
              v-model="form.name" 
              type="text" 
              required 
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
            />
          </div>
          
          <div class="mb-4">
            <label for="slug" class="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <div class="flex">
              <input 
                id="slug" 
                v-model="form.slug" 
                type="text" 
                required 
                class="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
              />
              <button 
                type="button"
                @click="generateSlug"
                class="px-3 py-2 bg-gray-200 text-gray-700 rounded-r-md hover:bg-gray-300"
              >
                Generate
              </button>
            </div>
          </div>
          
          <div class="mb-4">
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              id="description" 
              v-model="form.description" 
              rows="3" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
            ></textarea>
          </div>
          
          <div class="mb-4">
            <label for="image" class="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input 
              id="image" 
              v-model="form.image" 
              type="text" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
            />
          </div>
          
          <div class="flex justify-end space-x-3 mt-6">
            <button 
              type="button" 
              @click="closeModals" 
              class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              :disabled="formSubmitting"
            >
              <span v-if="formSubmitting" class="flex items-center">
                <Icon name="mdi:loading" class="animate-spin -ml-1 mr-2 h-4 w-4" />
                Saving...
              </span>
              <span v-else>
                {{ showEditModal ? 'Update' : 'Create' }}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <div class="sm:flex sm:items-start">
          <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <Icon name="mdi:alert" class="h-6 w-6 text-red-600" />
          </div>
          <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 class="text-lg leading-6 font-medium text-gray-900">Delete Category</h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500">
                Are you sure you want to delete the category "{{ categoryToDelete?.name }}"? This action cannot be undone.
              </p>
            </div>
          </div>
        </div>
        <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <button 
            type="button" 
            @click="deleteCategory" 
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
            :disabled="formSubmitting"
          >
            <span v-if="formSubmitting" class="flex items-center">
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

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useToast } from '~/composables/useToast'

definePageMeta({
  layout: 'admin'
})

// Toast
const toast = useToast()

// Types
interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  _count?: {
    products: number
  }
}

interface ApiResponse {
  statusCode: number
  categories?: Category[]
  [key: string]: any
}

// State
const categories = ref<Category[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const formSubmitting = ref(false)
const categoryToEdit = ref<Category | null>(null)
const categoryToDelete = ref<Category | null>(null)

// Form state
const form = reactive({
  name: '',
  slug: '',
  description: '',
  image: ''
})

// Fetch categories
const fetchCategories = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await $fetch<ApiResponse>('/api/admin/categories')
    categories.value = response.categories || []
  } catch (err: any) {
    console.error('Error fetching categories:', err)
    error.value = err.message || 'Failed to load categories'
  } finally {
    loading.value = false
  }
}

// Generate slug from name
const generateSlug = () => {
  if (form.name) {
    form.slug = form.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
}

// Reset form
const resetForm = () => {
  form.name = ''
  form.slug = ''
  form.description = ''
  form.image = ''
}

// Close all modals
const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  showDeleteModal.value = false
  categoryToEdit.value = null
  categoryToDelete.value = null
  resetForm()
}

// Edit category
const editCategory = (category: Category) => {
  categoryToEdit.value = category
  form.name = category.name
  form.slug = category.slug
  form.description = category.description || ''
  form.image = category.image || ''
  showEditModal.value = true
}

// Confirm delete
const confirmDelete = (category: Category) => {
  // Don't allow deletion if category has products
  if (category._count?.products && category._count.products > 0) {
    toast.warning(
      'Kategori Silinemez',
      `Bu kategoriye ${category._count.products} ürün bağlı. Ürünleri silmek veya başka bir kategoriye taşımak gerekiyor.`
    )
    return
  }
  
  categoryToDelete.value = category
  showDeleteModal.value = true
}

// Create category
const createCategory = async () => {
  formSubmitting.value = true
  
  try {
    await $fetch('/api/admin/categories', {
      method: 'POST',
      body: {
        name: form.name,
        slug: form.slug,
        description: form.description || null,
        image: form.image || null
      }
    })
    
    await fetchCategories()
    closeModals()
    toast.success(
      'Kategori Oluşturuldu',
      'Kategori başarıyla oluşturuldu'
    )
  } catch (err: any) {
    console.error('Error creating category:', err)
    toast.error(
      'Kategori Oluşturulamadı',
      err.data?.message || 'Kategori oluşturulamadı'
    )
  } finally {
    formSubmitting.value = false
  }
}

// Update category
const updateCategory = async () => {
  if (!categoryToEdit.value) return
  
  formSubmitting.value = true
  
  try {
    await $fetch(`/api/admin/categories/${categoryToEdit.value.id}`, {
      method: 'PUT',
      body: {
        name: form.name,
        slug: form.slug,
        description: form.description || null,
        image: form.image || null
      }
    })
    
    await fetchCategories()
    closeModals()
    toast.success(
      'Kategori Güncellendi',
      'Kategori başarıyla güncellendi'
    )
  } catch (err: any) {
    console.error('Error updating category:', err)
    toast.error(
      'Kategori Güncellenemedi',
      err.data?.message || 'Kategori güncellenemedi'
    )
  } finally {
    formSubmitting.value = false
  }
}

// Delete category
const deleteCategory = async () => {
  if (!categoryToDelete.value) return
  
  formSubmitting.value = true
  
  try {
    await $fetch(`/api/admin/categories/${categoryToDelete.value.id}`, {
      method: 'DELETE'
    })
    
    await fetchCategories()
    closeModals()
    toast.success(
      'Kategori Silindi',
      'Kategori başarıyla silindi'
    )
  } catch (err: any) {
    console.error('Error deleting category:', err)
    toast.error(
      'Kategori Silinemedi',
      err.data?.message || 'Kategori silinemedi'
    )
  } finally {
    formSubmitting.value = false
  }
}

// Load categories on mount
onMounted(() => {
  fetchCategories()
})
</script> 