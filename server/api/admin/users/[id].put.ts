import { defineEventHandler, readBody, createError } from 'h3'
import { UserModel } from '~/server/models/User'
import bcrypt from 'bcrypt'

export default defineEventHandler(async (event) => {
  try {
    // Admin middleware already verifies admin access
    
    const id = event.context.params?.id
    const body = await readBody(event)
    
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
    
    // Check if email is changed and if new email already exists
    if (body.email && body.email !== user.email) {
      const existingUserWithEmail = await UserModel.findOne({ 
        email: body.email,
        _id: { $ne: id }
      })
      
      if (existingUserWithEmail) {
        throw createError({
          statusCode: 409,
          message: 'User with this email already exists'
        })
      }
      
      user.email = body.email
    }
    
    // Update user fields
    if (body.name !== undefined) user.name = body.name
    if (body.role !== undefined) user.role = body.role
    
    // Handle password update if provided
    if (body.password) {
      // Hash the new password
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(body.password, salt)
      user.password = hashedPassword
    }
    
    // Save updated user
    await user.save()
    
    // Return user data without password
    const userObject = user.toObject() as Record<string, any>
    delete userObject.password
    
    return userObject
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
}) 