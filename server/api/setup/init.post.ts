import { defineEventHandler, readBody, createError } from 'h3'
import { UserModel } from '~/server/models/User'
import { hashPassword } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Check if any users exist
    const userCount = await UserModel.countDocuments()
    
    // Only allow setup if database is empty (no users)
    if (userCount > 0) {
      return {
        success: false,
        message: 'Setup not allowed - database already contains users'
      }
    }
    
    // Create admin user
    const adminUser = {
      name: 'Admin User',
      email: 'admin@example.com',
      password: await hashPassword('admin123'),
      role: 'admin'
    }
    
    await UserModel.create(adminUser)
    
    return {
      success: true,
      message: 'Admin user created successfully',
      credentials: {
        email: 'admin@example.com',
        password: 'admin123'
      }
    }
  } catch (error: any) {
    console.error('Setup error:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to initialize database'
    })
  }
}) 