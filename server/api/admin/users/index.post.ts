import { defineEventHandler, readBody, createError } from 'h3'
import { UserModel } from '~/server/models/User'
import bcrypt from 'bcrypt'

export default defineEventHandler(async (event) => {
  try {
    // Admin middleware already verifies admin access
    
    const body = await readBody(event)
    
    // Validate required fields
    if (!body.email || !body.password || !body.role) {
      throw createError({
        statusCode: 400,
        message: 'Email, password, and role are required'
      })
    }
    
    // Check if user with email already exists
    const existingUser = await UserModel.findOne({ email: body.email })
    
    if (existingUser) {
      throw createError({
        statusCode: 409,
        message: 'User with this email already exists'
      })
    }
    
    // Hash the password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(body.password, salt)
    
    // Create new user
    const user = await UserModel.create({
      email: body.email,
      password: hashedPassword,
      name: body.name || null,
      role: body.role === 'admin' ? 'admin' : 'user'
    })
    
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