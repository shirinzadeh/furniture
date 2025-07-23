import { defineEventHandler, readBody, createError } from 'h3'
import bcrypt from 'bcryptjs'
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
    const { currentPassword, newPassword } = await readBody(event)

    // Validate input
    if (!currentPassword || !newPassword) {
      throw createError({
        statusCode: 400,
        message: 'Current password and new password are required'
      })
    }

    if (newPassword.length < 6) {
      throw createError({
        statusCode: 400,
        message: 'New password must be at least 6 characters long'
      })
    }

    // Find user
    const user = await UserModel.findById(payload.userId)
    
    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'User not found'
      })
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password)
    
    if (!isValidPassword) {
      throw createError({
        statusCode: 400,
        message: 'Current password is incorrect'
      })
    }

    // Hash new password
    const saltRounds = 12
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds)

    // Update password
    await UserModel.findByIdAndUpdate(
      payload.userId,
      { password: hashedNewPassword },
      { runValidators: true }
    )

    return {
      success: true,
      message: 'Password updated successfully'
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
}) 