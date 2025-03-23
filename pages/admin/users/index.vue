<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold text-gray-900">Users</h1>
      <button 
        @click="showCreateModal = true" 
        class="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 flex items-center"
      >
        <Icon name="mdi:plus" class="mr-2" />
        Add User
      </button>
    </div>

    <!-- Search and filters -->
    <div class="bg-white p-4 rounded-lg shadow mb-6">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <label for="search" class="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon name="mdi:magnify" class="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="search"
              v-model="filters.search"
              type="text"
              placeholder="Search by name or email..."
              class="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
              @keyup.enter="fetchUsers(1)"
            />
          </div>
        </div>
        <div class="w-full md:w-48">
          <label for="role" class="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select
            id="role"
            v-model="filters.role"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
          >
            <option value="">All Roles</option>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <div class="flex items-end">
          <button
            @click="fetchUsers(1)"
            class="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 flex items-center"
          >
            <Icon name="mdi:filter" class="mr-2" />
            Apply Filters
          </button>
        </div>
      </div>
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
          <h3 class="text-sm font-medium text-red-800">Error loading users</h3>
          <div class="mt-2 text-sm text-red-700">
            <p>{{ error }}</p>
          </div>
          <div class="mt-4">
            <button 
              @click="fetchUsers(currentPage)" 
              class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="users.length === 0" class="bg-white p-12 rounded-lg shadow text-center mb-6">
      <Icon name="mdi:account-group" class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-sm font-medium text-gray-900">No users</h3>
      <p class="mt-1 text-sm text-gray-500">Get started by creating a new user.</p>
      <div class="mt-6">
        <button 
          @click="showCreateModal = true" 
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          <Icon name="mdi:plus" class="-ml-1 mr-2 h-5 w-5" />
          New User
        </button>
      </div>
    </div>

    <!-- Users table -->
    <div v-else class="bg-white shadow rounded-lg mb-6 overflow-hidden">
      <div class="grid  overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in users" :key="user.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    <div class="text-gray-500 font-medium">
                      {{ getUserInitials(user.name || user.email) }}
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ user.name || 'No name' }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">{{ user.email }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="{
                    'bg-green-100 text-green-800': user.role === 'ADMIN',
                    'bg-blue-100 text-blue-800': user.role === 'USER'
                  }"
                >
                  {{ user.role }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">{{ formatDate(user.createdAt) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                  @click="editUser(user)" 
                  class="text-gray-600 hover:text-gray-900 mr-3"
                >
                  <Icon name="mdi:pencil" class="h-5 w-5" />
                </button>
                <button 
                  @click="confirmDelete(user)" 
                  class="text-red-600 hover:text-red-900"
                  :disabled="user.id === currentUserId"
                  :class="{ 'opacity-50 cursor-not-allowed': user.id === currentUserId }"
                >
                  <Icon name="mdi:delete" class="h-5 w-5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center mt-6">
      <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
        <button
          @click="fetchUsers(currentPage - 1)"
          :disabled="currentPage === 1"
          class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
        >
          <span class="sr-only">Previous</span>
          <Icon name="mdi:chevron-left" class="h-5 w-5" />
        </button>
        
        <template v-for="page in paginationRange" :key="page">
          <span
            v-if="page === '...'"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
          >
            ...
          </span>
          <button
            v-else
            @click="fetchUsers(Number(page))"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium"
            :class="page === currentPage ? 'z-10 bg-gray-800 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'"
          >
            {{ page }}
          </button>
        </template>
        
        <button
          @click="fetchUsers(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          :class="{ 'opacity-50 cursor-not-allowed': currentPage === totalPages }"
        >
          <span class="sr-only">Next</span>
          <Icon name="mdi:chevron-right" class="h-5 w-5" />
        </button>
      </nav>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">
            {{ showEditModal ? 'Edit User' : 'Create User' }}
          </h3>
          <button @click="closeModals" class="text-gray-400 hover:text-gray-500">
            <Icon name="mdi:close" class="h-6 w-6" />
          </button>
        </div>
        
        <form @submit.prevent="showEditModal ? updateUser() : createUser()">
          <div class="mb-4">
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input 
              id="name" 
              v-model="form.name" 
              type="text" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
            />
          </div>
          
          <div class="mb-4">
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              id="email" 
              v-model="form.email" 
              type="email" 
              required 
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
            />
          </div>
          
          <div class="mb-4">
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
              {{ showEditModal ? 'Password (leave blank to keep current)' : 'Password' }}
            </label>
            <input 
              id="password" 
              v-model="form.password" 
              type="password" 
              :required="!showEditModal" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
            />
          </div>
          
          <div class="mb-4">
            <label for="role" class="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              id="role"
              v-model="form.role"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
            >
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
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
            <h3 class="text-lg leading-6 font-medium text-gray-900">Delete User</h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500">
                Are you sure you want to delete the user "{{ userToDelete?.name || userToDelete?.email }}"? This action cannot be undone.
              </p>
            </div>
          </div>
        </div>
        <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <button 
            type="button" 
            @click="deleteUser" 
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
import { ref, reactive, onMounted, computed } from 'vue'

definePageMeta({
  layout: 'admin'
})

// Types
interface User {
  id: string
  name?: string
  email: string
  role: 'USER' | 'ADMIN'
  createdAt: string
  updatedAt: string
}

interface Pagination {
  total: number
  page: number
  limit: number
  pages: number
}

// State
const users = ref<User[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const formSubmitting = ref(false)
const userToEdit = ref<User | null>(null)
const userToDelete = ref<User | null>(null)
const currentPage = ref(1)
const totalPages = ref(1)
const limit = ref(10)
const currentUserId = ref<string | null>(null)

// Filters
const filters = reactive({
  search: '',
  role: ''
})

// Form state
const form = reactive({
  name: '',
  email: '',
  password: '',
  role: 'USER' as 'USER' | 'ADMIN'
})

// Get current user
const getCurrentUser = async () => {
  try {
    const response = await $fetch<{
      statusCode: number;
      user?: {
        id: string;
        email: string;
        name?: string;
        role: string;
      };
      message?: string;
    }>('/api/auth/profile')
    
    if (response.user) {
      currentUserId.value = response.user.id
    }
  } catch (err) {
    console.error('Error fetching current user:', err)
  }
}

// Fetch users with filters and pagination
const fetchUsers = async (page: number) => {
  loading.value = true
  error.value = null
  currentPage.value = page
  
  try {
    // Build query params
    const queryParams = new URLSearchParams()
    queryParams.append('page', page.toString())
    queryParams.append('limit', limit.value.toString())
    
    if (filters.search) {
      queryParams.append('search', filters.search)
    }
    
    if (filters.role) {
      queryParams.append('role', filters.role)
    }
    
    const response = await $fetch<{
      statusCode: number;
      users?: User[];
      pagination?: {
        total: number;
        page: number;
        limit: number;
        pages: number;
      };
      message?: string;
    }>(`/api/admin/users?${queryParams.toString()}`)
    
    users.value = response.users || []
    
    // Update pagination
    if (response.pagination) {
      totalPages.value = response.pagination.pages || 1
    }
  } catch (err: any) {
    console.error('Error fetching users:', err)
    error.value = err.message || 'Failed to load users'
  } finally {
    loading.value = false
  }
}

// Reset form
const resetForm = () => {
  form.name = ''
  form.email = ''
  form.password = ''
  form.role = 'USER'
}

// Close all modals
const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  showDeleteModal.value = false
  userToEdit.value = null
  userToDelete.value = null
  resetForm()
}

// Edit user
const editUser = (user: User) => {
  userToEdit.value = user
  form.name = user.name || ''
  form.email = user.email
  form.password = ''
  form.role = user.role
  showEditModal.value = true
}

// Confirm delete
const confirmDelete = (user: User) => {
  // Don't allow deletion of current user
  if (user.id === currentUserId.value) {
    return
  }
  
  userToDelete.value = user
  showDeleteModal.value = true
}

// Create user
const createUser = async () => {
  formSubmitting.value = true
  
  try {
    await $fetch('/api/admin/users', {
      method: 'POST',
      body: {
        name: form.name || null,
        email: form.email,
        password: form.password,
        role: form.role
      }
    })
    
    await fetchUsers(currentPage.value)
    closeModals()
  } catch (err: any) {
    console.error('Error creating user:', err)
    alert(err.data?.message || 'Failed to create user')
  } finally {
    formSubmitting.value = false
  }
}

// Update user
const updateUser = async () => {
  if (!userToEdit.value) return
  
  formSubmitting.value = true
  
  try {
    const updateData: any = {
      name: form.name || null,
      email: form.email,
      role: form.role
    }
    
    // Only include password if it was changed
    if (form.password) {
      updateData.password = form.password
    }
    
    await $fetch(`/api/admin/users/${userToEdit.value.id}`, {
      method: 'PUT',
      body: updateData
    })
    
    await fetchUsers(currentPage.value)
    closeModals()
  } catch (err: any) {
    console.error('Error updating user:', err)
    alert(err.data?.message || 'Failed to update user')
  } finally {
    formSubmitting.value = false
  }
}

// Delete user
const deleteUser = async () => {
  if (!userToDelete.value) return
  
  formSubmitting.value = true
  
  try {
    await $fetch(`/api/admin/users/${userToDelete.value.id}`, {
      method: 'DELETE'
    })
    
    await fetchUsers(currentPage.value)
    closeModals()
  } catch (err: any) {
    console.error('Error deleting user:', err)
    alert(err.data?.message || 'Failed to delete user')
  } finally {
    formSubmitting.value = false
  }
}

// Get user initials for avatar
const getUserInitials = (name: string) => {
  if (!name) return '?'
  
  const parts = name.split(' ')
  if (parts.length === 1) {
    return name.charAt(0).toUpperCase()
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
}

// Calculate pagination range
const paginationRange = computed(() => {
  const range: (number | string)[] = []
  const maxVisiblePages = 5
  
  if (totalPages.value <= maxVisiblePages) {
    // Show all pages if total pages is less than max visible
    for (let i = 1; i <= totalPages.value; i++) {
      range.push(i)
    }
  } else {
    // Always show first page
    range.push(1)
    
    // Calculate start and end of visible range
    let start = Math.max(2, currentPage.value - 1)
    let end = Math.min(totalPages.value - 1, currentPage.value + 1)
    
    // Adjust if at the beginning or end
    if (currentPage.value <= 2) {
      end = Math.min(totalPages.value - 1, maxVisiblePages - 1)
    } else if (currentPage.value >= totalPages.value - 1) {
      start = Math.max(2, totalPages.value - maxVisiblePages + 2)
    }
    
    // Add ellipsis if needed
    if (start > 2) {
      range.push('...')
    }
    
    // Add middle pages
    for (let i = start; i <= end; i++) {
      range.push(i)
    }
    
    // Add ellipsis if needed
    if (end < totalPages.value - 1) {
      range.push('...')
    }
    
    // Always show last page
    range.push(totalPages.value)
  }
  
  return range
})

// Load data on mount
onMounted(() => {
  getCurrentUser()
  fetchUsers(1)
})
</script> 