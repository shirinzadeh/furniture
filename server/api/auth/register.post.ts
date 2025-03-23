import { defineEventHandler, readBody, createError } from 'h3'
import { UserModel } from '~/server/models/User'
import { hashPassword, generateToken } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const { email, password, name } = await readBody(event)
    
    // Validate request
    if (!email || !password) {
      throw createError({
        statusCode: 400,
        message: 'Email and password are required'
      })
    }
    
    // Check if user already exists
    const existingUser = await UserModel.findOne({ email })
    
    if (existingUser) {
      throw createError({
        statusCode: 409,
        message: 'User with this email already exists'
      })
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password)
    
    // Create new user (default role is USER)
    const newUser = await UserModel.create({
      email,
      password: hashedPassword,
      name: name || undefined,
      role: 'USER'
    })
    
    // Generate token
    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role
    })
    
    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      },
      token
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
}) 