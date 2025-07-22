import { defineEventHandler, createError } from 'h3'
import { CartModel } from '~/server/models/Cart'
import { verifyUserToken } from '~/server/utils/auth'
import mongoose from 'mongoose'

// Ensure database connection
const ensureDBConnection = async () => {
  if (mongoose.connection.readyState !== 1) {
    const config = useRuntimeConfig()
    await mongoose.connect(config.mongodbUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: true
    })
  }
}

export default defineEventHandler(async (event) => {
  try {
    // Ensure database connection
    await ensureDBConnection()
    
    // Verify user token
    const payload = await verifyUserToken(event)
    
    if (!payload) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized'
      })
    }

    // Find user's cart
    const cart = await CartModel.findOne({ userId: payload.userId })
    
    if (!cart) {
      // Cart doesn't exist, nothing to clear
      return {
        success: true,
        message: 'Cart is already empty',
        cart: {
          items: [],
          itemCount: 0,
          totalPrice: 0
        }
      }
    }

    // Clear all items
    cart.items = []
    await cart.save()

    return {
      success: true,
      message: 'Cart cleared',
      cart: {
        items: [],
        itemCount: 0,
        totalPrice: 0
      }
    }
  } catch (error: any) {
    console.error('Cart clear error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
}) 