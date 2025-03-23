<template>
  <div class="bg-white rounded-lg shadow p-6 mb-6">
    <h2 class="text-xl font-bold mb-4">Database Management</h2>
    
    <div v-if="loading" class="flex justify-center p-4">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
    
    <div v-else>
      <!-- Database Status -->
      <div class="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 class="text-lg font-semibold mb-2">Current Database Status</h3>
        <div v-if="dbStatus" class="grid grid-cols-2 gap-4">
          <div class="flex items-center">
            <span class="font-medium mr-2">Categories:</span> 
            <span class="text-lg">{{ dbStatus.stats.categories }}</span>
          </div>
          <div class="flex items-center">
            <span class="font-medium mr-2">Products:</span> 
            <span class="text-lg">{{ dbStatus.stats.products }}</span>
          </div>
          <div class="flex items-center">
            <span class="font-medium mr-2">Banners:</span> 
            <span class="text-lg">{{ dbStatus.stats.banners }}</span>
          </div>
          <div class="flex items-center">
            <span class="font-medium mr-2">Admin Users:</span> 
            <span class="text-lg">{{ dbStatus.stats.admins }}</span>
          </div>
        </div>
      </div>
      
      <!-- Database Seeding -->
      <div class="mb-4">
        <h3 class="text-lg font-semibold mb-2">Seed Database</h3>
        <p class="text-gray-600 mb-4">
          Populate your database with sample furniture data including categories, products, and banners.
        </p>
        
        <div class="mb-3">
          <label class="flex items-center">
            <input type="checkbox" v-model="clearBeforeSeeding" class="mr-2 rounded">
            Clear database before seeding (This will delete all existing data!)
          </label>
        </div>
        
        <div class="mb-3" v-if="!dbStatus?.isEmpty && !clearBeforeSeeding">
          <label class="flex items-center">
            <input type="checkbox" v-model="forceSeed" class="mr-2 rounded">
            Force seeding (Add data even if database is not empty)
          </label>
        </div>
        
        <div class="flex space-x-4">
          <button 
            @click="seedDatabase" 
            class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            :disabled="seeding || (!dbStatus?.isEmpty && !clearBeforeSeeding && !forceSeed)"
          >
            <span v-if="seeding">Seeding...</span>
            <span v-else>Seed Database</span>
          </button>
          
          <button 
            @click="refreshStatus" 
            class="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
          >
            Refresh Status
          </button>
        </div>
      </div>
      
      <!-- Results -->
      <div v-if="seedResult" class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 class="text-lg font-semibold text-green-800 mb-2">Seeding Completed</h3>
        <div class="grid grid-cols-2 gap-2">
          <div class="flex items-center">
            <span class="font-medium mr-2">Categories added:</span> 
            <span>{{ seedResult.categories }}</span>
          </div>
          <div class="flex items-center">
            <span class="font-medium mr-2">Products added:</span> 
            <span>{{ seedResult.products }}</span>
          </div>
          <div class="flex items-center">
            <span class="font-medium mr-2">Banners added:</span> 
            <span>{{ seedResult.banners }}</span>
          </div>
        </div>
        
        <div v-if="seedResult.adminCreated" class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p class="font-medium text-yellow-800">Admin user created:</p>
          <p>Email: admin@example.com</p>
          <p>Password: admin123</p>
          <p class="text-red-600 font-bold mt-2">IMPORTANT: Please change this password immediately!</p>
        </div>
      </div>
      
      <!-- Error Message -->
      <div v-if="error" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
        <h3 class="font-semibold mb-1">Error</h3>
        <p>{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'
import { useToast } from '~/composables/useToast'

const api = useApi()
const toast = useToast()

// State
const loading = ref(false)
const seeding = ref(false)
const clearBeforeSeeding = ref(false)
const forceSeed = ref(false)
const dbStatus = ref<any>(null)
const seedResult = ref<any>(null)
const error = ref<string | null>(null)

// Get the current database status
const refreshStatus = async () => {
  loading.value = true
  error.value = null
  
  try {
    dbStatus.value = await api.fetchRaw('/api/admin/database/seed')
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch database status'
    toast.error(error.value || 'Failed to fetch database status')
  } finally {
    loading.value = false
  }
}

// Seed the database
const seedDatabase = async () => {
  if (!clearBeforeSeeding.value && !dbStatus.value?.isEmpty && !forceSeed.value) {
    toast.warning('Please check "Force seeding" or "Clear database before seeding" to continue')
    return
  }
  
  seeding.value = true
  error.value = null
  
  try {
    seedResult.value = await api.fetchRaw('/api/admin/database/seed', {
      method: 'POST',
      body: {
        clearBefore: clearBeforeSeeding.value,
        force: forceSeed.value
      }
    })
    
    toast.success('Database seeded successfully')
    
    // Refresh the status after seeding
    await refreshStatus()
  } catch (err: any) {
    error.value = err.message || 'Failed to seed database'
    toast.error(error.value || 'Failed to seed database')
  } finally {
    seeding.value = false
  }
}

// Load the database status when component mounts
onMounted(refreshStatus)
</script> 