import { defineEventHandler, readBody, createError } from 'h3'
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

    // Read request body
    const { name } = await readBody(event)

    // Validate input
    if (!name || name.trim().length < 2) {
      throw createError({
        statusCode: 400,
        message: 'Name must be at least 2 characters long'
      })
    }

    // Update user profile
    const user = await UserModel.findByIdAndUpdate(
      payload.userId,
      { 
        name: name.trim()
      },
      { 
        new: true,
        runValidators: true 
      }
    )

    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'User not found'
      })
    }

    // Return updated user profile
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