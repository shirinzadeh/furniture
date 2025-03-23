<template>
  <div class="image-uploader">
    <!-- Image Upload Tabs -->
    <div class="flex border-b border-gray-200 mb-4">
      <button 
        @click="activeTab = 'url'" 
        :class="[
          'py-2 px-4 text-sm font-medium',
          activeTab === 'url' 
            ? 'border-b-2 border-gray-800 text-gray-800' 
            : 'text-gray-500 hover:text-gray-700'
        ]"
        type="button"
      >
        URL
      </button>
      <button 
        @click="activeTab = 'upload'" 
        :class="[
          'py-2 px-4 text-sm font-medium',
          activeTab === 'upload' 
            ? 'border-b-2 border-gray-800 text-gray-800' 
            : 'text-gray-500 hover:text-gray-700'
        ]"
        type="button"
      >
        Upload
      </button>
    </div>
    
    <!-- URL Input Tab -->
    <div v-if="activeTab === 'url'" class="space-y-3">
      <div>
        <input 
          v-model="imageUrl"
          type="text" 
          placeholder="Enter image URL" 
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
          @keyup.enter.prevent="addImageByUrl"
        />
      </div>
      <div class="flex justify-end">
        <button 
          @click.prevent="addImageByUrl"
          :disabled="!imageUrl"
          class="px-3 py-1 bg-gray-800 text-white rounded-md hover:bg-gray-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
        >
          Add Image
        </button>
      </div>
    </div>
    
    <!-- File Upload Tab -->
    <div v-else-if="activeTab === 'upload'" class="space-y-3">
      <div 
        class="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center"
        :class="{ 'bg-gray-50': isDragging }"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleFileDrop"
      >
        <div class="space-y-2 text-center">
          <Icon name="mdi:image" class="mx-auto h-12 w-12 text-gray-400" />
          <div class="text-sm text-gray-600">
            <label for="file-upload" class="relative cursor-pointer bg-white rounded-md font-medium text-gray-600 hover:text-gray-500">
              <span>Upload an image</span>
              <input 
                id="file-upload" 
                name="file-upload" 
                type="file" 
                class="sr-only" 
                accept="image/jpeg,image/png,image/webp,image/gif"
                @change="handleFileSelect"
              />
            </label>
            <p class="pl-1">or drag and drop</p>
          </div>
          <p class="text-xs text-gray-500">PNG, JPG, WebP, GIF up to 5MB</p>
        </div>
      </div>
      
      <!-- Upload Progress -->
      <div v-if="isUploading" class="mt-2">
        <div class="relative pt-1">
          <div class="flex mb-2 items-center justify-between">
            <div>
              <span class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-gray-800 bg-gray-200">
                Uploading...
              </span>
            </div>
            <div class="text-right">
              <span class="text-xs font-semibold inline-block text-gray-800">
                {{ uploadProgress }}%
              </span>
            </div>
          </div>
          <div class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
            <div 
              :style="{ width: `${uploadProgress}%` }" 
              class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gray-800"
            ></div>
          </div>
        </div>
      </div>
      
      <!-- Upload Error -->
      <div v-if="uploadError" class="mt-2 text-sm text-red-600">
        {{ uploadError }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, toRaw } from 'vue'
import { useImageUpload } from '~/composables/useImageUpload'

// Props
const props = defineProps<{
  modelValue?: string[] // Current images array
}>()

// Emits
const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

// State
const activeTab = ref<'url' | 'upload'>('url')
const imageUrl = ref('')
const isDragging = ref(false)

// Get the image uploader composable
const { isUploading, uploadProgress, uploadError, uploadImage } = useImageUpload()

// Add image by URL
const addImageByUrl = () => {
  if (!imageUrl.value) return
  
  // Make a copy of the existing images and add the new one
  // This ensures we only update the parent when actually adding an image
  const existingImages = toRaw(props.modelValue || [])
  const newImages = [...existingImages, imageUrl.value]
  emit('update:modelValue', newImages)
  
  // Reset input
  imageUrl.value = ''
}

// Handle file selection
const handleFileSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return
  
  await uploadFile(input.files[0])
  
  // Reset input so the same file can be selected again
  input.value = ''
}

// Handle file drop
const handleFileDrop = async (event: DragEvent) => {
  isDragging.value = false
  
  if (!event.dataTransfer?.files || event.dataTransfer.files.length === 0) return
  
  await uploadFile(event.dataTransfer.files[0])
}

// Upload file and add to images
const uploadFile = async (file: File) => {
  const imageUrl = await uploadImage(file)
  
  if (imageUrl) {
    // Make a copy of the existing images and add the new one
    const existingImages = toRaw(props.modelValue || [])
    const newImages = [...existingImages, imageUrl]
    emit('update:modelValue', newImages)
  }
}
</script> 