<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Banners</h1>
      <button 
        @click="openModal()" 
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
      >
        <span class="mr-2">Add Banner</span>
        <Icon name="heroicons:plus" class="w-5 h-5" />
      </button>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center my-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      <p>{{ error }}</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="banners.length === 0" class="text-center py-12 bg-gray-50 rounded-lg">
      <Icon name="heroicons:photo" class="w-16 h-16 mx-auto text-gray-400" />
      <h3 class="mt-2 text-lg font-medium text-gray-900">No banners found</h3>
      <p class="mt-1 text-sm text-gray-500">Get started by creating a new banner.</p>
      <div class="mt-6">
        <button 
          @click="openModal()" 
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Add Banner
        </button>
      </div>
    </div>

    <!-- Banners list -->
    <div v-else class="bg-white shadow rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Image
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Title
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Order
            </th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="banner in banners" :key="banner.id">
            <td class="px-6 py-4 whitespace-nowrap">
              <img :src="banner.image" alt="Banner" class="h-16 w-32 object-cover rounded" />
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ banner.title }}</div>
              <div v-if="banner.subtitle" class="text-sm text-gray-500">{{ banner.subtitle }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span 
                :class="[
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                  banner.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                ]"
              >
                {{ banner.active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ banner.order }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button 
                @click="openModal(banner)" 
                class="text-blue-600 hover:text-blue-900 mr-3"
              >
                Edit
              </button>
              <button 
                @click="confirmDelete(banner)" 
                class="text-red-600 hover:text-red-900"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Banner Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="px-6 py-4 border-b">
          <h3 class="text-lg font-medium">{{ editingBanner ? 'Edit Banner' : 'Add New Banner' }}</h3>
        </div>
        <div class="p-6">
          <form @submit.prevent="saveBanner">
            <!-- Title -->
            <div class="mb-4">
              <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                id="title"
                v-model="bannerForm.title"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <!-- Subtitle -->
            <div class="mb-4">
              <label for="subtitle" class="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
              <input
                id="subtitle"
                v-model="bannerForm.subtitle"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <!-- Image URL -->
            <div class="mb-4">
              <label for="image" class="block text-sm font-medium text-gray-700 mb-1">Image URL *</label>
              <input
                id="image"
                v-model="bannerForm.image"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <div v-if="bannerForm.image" class="mt-2">
                <img :src="bannerForm.image" alt="Banner preview" class="h-32 object-cover rounded" />
              </div>
            </div>

            <!-- Link -->
            <div class="mb-4">
              <label for="link" class="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
              <input
                id="link"
                v-model="bannerForm.link"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <!-- Order -->
            <div class="mb-4">
              <label for="order" class="block text-sm font-medium text-gray-700 mb-1">Order</label>
              <input
                id="order"
                v-model.number="bannerForm.order"
                type="number"
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <!-- Active Status -->
            <div class="mb-6">
              <div class="flex items-center">
                <input
                  id="active"
                  v-model="bannerForm.active"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label for="active" class="ml-2 block text-sm text-gray-700">Active</label>
              </div>
            </div>

            <div class="flex justify-end space-x-3">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="saving"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {{ saving ? 'Saving...' : 'Save Banner' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="p-6">
          <h3 class="text-lg font-medium mb-2">Confirm Delete</h3>
          <p class="text-gray-500 mb-4">Are you sure you want to delete this banner? This action cannot be undone.</p>
          <div class="flex justify-end space-x-3">
            <button
              @click="showDeleteModal = false"
              class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              @click="deleteBanner"
              :disabled="deleting"
              class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              {{ deleting ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
// Define page meta
definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth']
})
// Define banner type
interface Banner {
  id: string
  title: string
  subtitle?: string
  image: string
  link?: string
  active: boolean
  order: number
}

// State
const banners = ref<Banner[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const showModal = ref(false)
const showDeleteModal = ref(false)
const editingBanner = ref<Banner | null>(null)
const bannerToDelete = ref<Banner | null>(null)
const saving = ref(false)
const deleting = ref(false)
const { showToast } = useToast()

// Form state
const bannerForm = reactive({
  title: '',
  subtitle: '',
  image: '',
  link: '',
  active: true,
  order: 0
})

// Fetch banners
const fetchBanners = async () => {
  loading.value = true
  error.value = null
  
  try {
    const { data, error: fetchError } = await useAsyncData('admin-banners', () => 
      $fetch('/api/admin/banners')
    )
    
    if (fetchError.value) {
      throw new Error(fetchError.value.message || 'Failed to fetch banners')
    }
    
    if (data.value) {
      banners.value = data.value.banners || []
    } else {
      error.value = 'No data returned from API'
    }
  } catch (err: any) {
    console.error('Error fetching banners:', err)
    error.value = err.message || 'An error occurred while fetching banners'
  } finally {
    loading.value = false
  }
}

// Open modal for create/edit
const openModal = (banner?: Banner) => {
  if (banner) {
    editingBanner.value = banner
    bannerForm.title = banner.title
    bannerForm.subtitle = banner.subtitle || ''
    bannerForm.image = banner.image
    bannerForm.link = banner.link || ''
    bannerForm.active = banner.active
    bannerForm.order = banner.order
  } else {
    editingBanner.value = null
    bannerForm.title = ''
    bannerForm.subtitle = ''
    bannerForm.image = ''
    bannerForm.link = ''
    bannerForm.active = true
    bannerForm.order = banners.value.length
  }
  
  showModal.value = true
}

// Close modal
const closeModal = () => {
  showModal.value = false
}

// Save banner (create or update)
const saveBanner = async () => {
  saving.value = true
  
  try {
    const url = editingBanner.value 
      ? `/api/admin/banners/${editingBanner.value.id}` 
      : '/api/admin/banners'
    
    const method = editingBanner.value ? 'PUT' : 'POST'
    
    const result = await $fetch(url, {
      method,
      body: bannerForm
    })
    
    showToast({
      message: editingBanner.value ? 'Banner updated successfully' : 'Banner created successfully',
      type: 'success'
    })
    closeModal()
    fetchBanners()
  } catch (err: any) {
    console.error('Error saving banner:', err)
    showToast({
      message: err.message || 'Failed to save banner',
      type: 'error'
    })
  } finally {
    saving.value = false
  }
}

// Confirm delete
const confirmDelete = (banner: Banner) => {
  bannerToDelete.value = banner
  showDeleteModal.value = true
}

// Delete banner
const deleteBanner = async () => {
  if (!bannerToDelete.value) return
  
  deleting.value = true
  
  try {
    await $fetch(`/api/admin/banners/${bannerToDelete.value.id}`, {
      method: 'DELETE'
    })
    
    showToast({
      message: 'Banner deleted successfully',
      type: 'success'
    })
    showDeleteModal.value = false
    fetchBanners()
  } catch (err: any) {
    console.error('Error deleting banner:', err)
    showToast({
      message: err.message || 'Failed to delete banner',
      type: 'error'
    })
  } finally {
    deleting.value = false
  }
}

// Fetch banners on mount
onMounted(() => {
  fetchBanners()
})
</script> 