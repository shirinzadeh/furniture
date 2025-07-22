import { defineEventHandler, readBody, createError } from 'h3'
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

    const body = await readBody(event)
    const { productId, quantity } = body

    if (!productId) {
      throw createError({
        statusCode: 400,
        message: 'Product ID is required'
      })
    }

    if (typeof quantity !== 'number' || quantity < 0) {
      throw createError({
        statusCode: 400,
        message: 'Quantity must be a non-negative number'
      })
    }

    // Find user's cart
    const cart = await CartModel.findOne({ userId: payload.userId })
    
    if (!cart) {
      throw createError({
        statusCode: 404,
        message: 'Cart not found'
      })
    }

    // Find item in cart
    const itemIndex = cart.items.findIndex(item => item.productId === productId)

    if (itemIndex === -1) {
      throw createError({
        statusCode: 404,
        message: 'Item not found in cart'
      })
    }

    if (quantity === 0) {
      // Remove item from cart
      cart.items.splice(itemIndex, 1)
    } else {
      // Update item quantity
      cart.items[itemIndex].quantity = quantity
    }

    // Save cart
    await cart.save()

    return {
      success: true,
      message: quantity === 0 ? 'Item removed from cart' : 'Cart updated',
      cart: {
        items: cart.items,
        itemCount: cart.items.reduce((total, item) => total + item.quantity, 0),
        totalPrice: cart.items.reduce((total, item) => {
          const price = item.salePrice || item.price
          return total + (price * item.quantity)
        }, 0)
      }
    }
  } catch (error: any) {
    console.error('Cart update error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
}) 