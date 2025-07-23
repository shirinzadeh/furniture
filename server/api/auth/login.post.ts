import { defineEventHandler, readBody, createError } from 'h3'
import { UserModel } from '~/server/models/User'
import { comparePassword, generateToken } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const { email, password } = await readBody(event)
    
    // Validate request
    if (!email || !password) {
      throw createError({
        statusCode: 400,
        message: 'Email ve şifre gereklidir'
      })
    }
    
    // Find user by email
    const user = await UserModel.findOne({ email })
    
    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Geçersiz email veya şifre'
      })
    }
    
    // Verify password
    const isPasswordValid = await comparePassword(password, user.password)
    
    if (!isPasswordValid) {
      throw createError({
        statusCode: 401,
        message: 'Geçersiz email veya şifre'
      })
    }
    
    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })
    
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
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