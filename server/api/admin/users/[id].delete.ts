import { defineEventHandler, createError } from 'h3'
import { UserModel } from '~/server/models/User'

export default defineEventHandler(async (event) => {
  try {
    // Admin middleware already verifies admin access
    
    const id = event.context.params?.id
    
    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'User ID is required'
      })
    }
    
    // Find user by ID
    const user = await UserModel.findById(id)
    
    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'User not found'
      })
    }
    
    // Prevent deleting self (the admin user making the request)
    // This would typically use the authenticated user's ID from a session or JWT
    // For proper implementation, you'd compare with req.user.id from auth middleware
    
    // Delete the user
    await UserModel.findByIdAndDelete(id)
    
    return {
      success: true,
      message: 'User deleted successfully'
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
}) 