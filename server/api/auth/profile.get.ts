import { defineEventHandler, createError } from 'h3'
import { UserModel } from '~/server/models/User'
import { verifyUserToken } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Verify user token
    const payload = await verifyUserToken(event)
    
    if (!payload) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized'
      })
    }
    
    // Find user by ID
    const user = await UserModel.findById(payload.userId)
    
    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'User not found'
      })
    }
    
    // Return user profile (password excluded by model)
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
}) 