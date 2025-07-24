import { defineEventHandler, createError } from 'h3'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join, extname } from 'path'
import { randomBytes } from 'crypto'
import { verifyAdminToken } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Verify admin token
    const payload = await verifyAdminToken(event)
    if (!payload) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }

    // Parse multipart form data
    const form = await readMultipartFormData(event)
    
    if (!form || form.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No file provided'
      })
    }

    // Find the file field
    const fileField = form.find(field => field.name === 'file')
    
    if (!fileField || !fileField.data) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No file provided'
      })
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!fileField.type || !validTypes.includes(fileField.type)) {
      return {
        statusCode: 400,
        message: 'Invalid file type. Allowed types: JPEG, PNG, WebP, GIF'
      }
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (fileField.data.length > maxSize) {
      return {
        statusCode: 400,
        message: 'File size exceeds maximum allowed (5MB)'
      }
    }

    // Generate unique filename
    const fileExtension = extname(fileField.filename || '')
    const uniqueId = randomBytes(5).toString('hex')
    const timestamp = Date.now()
    const filename = `upload_${timestamp}_${uniqueId}${fileExtension}`

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'images', 'uploads')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Save file
    const filePath = join(uploadsDir, filename)
    await writeFile(filePath, fileField.data)

    // Return the URL
    const imageUrl = `/images/uploads/${filename}`

    return {
      statusCode: 200,
      url: imageUrl,
      message: 'File uploaded successfully'
    }

  } catch (error: any) {
    console.error('Upload error:', error)
    
    return {
      statusCode: error.statusCode || 500,
      message: error.statusMessage || error.message || 'Failed to upload file'
    }
  }
}) 