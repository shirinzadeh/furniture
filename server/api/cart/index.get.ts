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

    // Find or create user's cart
    let cart = await CartModel.findOne({ userId: payload.userId })
    
    if (!cart) {
      // Create empty cart if doesn't exist
      cart = await CartModel.create({
        userId: payload.userId,
        items: []
      })
    }

    return {
      items: cart.items,
      itemCount: cart.items.reduce((total, item) => total + item.quantity, 0),
      totalPrice: cart.items.reduce((total, item) => {
        const price = item.salePrice || item.price
        return total + (price * item.quantity)
      }, 0)
    }
  } catch (error: any) {
    console.error('Cart GET error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
}) 