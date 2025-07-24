import { ref } from 'vue'

export function useImageUpload() {
  const isUploading = ref(false)
  const uploadProgress = ref(0)
  const uploadError = ref<string | null>(null)

  /**
   * Upload an image file to the server
   * @param file The file to upload
   * @returns The URL of the uploaded image or null if the upload failed
   */
  const uploadImage = async (file: File): Promise<string | null> => {
    if (!file) return null

    isUploading.value = true
    uploadProgress.value = 0
    uploadError.value = null

    try {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      if (!validTypes.includes(file.type)) {
        throw new Error('Invalid file type. Allowed types: JPEG, PNG, WebP, GIF')
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        throw new Error('File size exceeds maximum allowed (5MB)')
      }

      // Create form data
      const formData = new FormData()
      formData.append('file', file)

      // Upload to server
      const response = await $fetch<{ statusCode: number; url?: string; message?: string }>('/api/admin/images/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      if (response.statusCode !== 200 || !response.url) {
        throw new Error(response.message || 'Upload failed')
      }

      uploadProgress.value = 100
      return response.url
    } catch (error: any) {
      console.error('Image upload error:', error)
      uploadError.value = error.message || 'Failed to upload image'
      return null
    } finally {
      isUploading.value = false
    }
  }

  return {
    isUploading,
    uploadProgress,
    uploadError,
    uploadImage
  }
} 