import { defineEventHandler, readBody, createError } from 'h3'
import { CartModel } from '~/server/models/Cart'
import { ProductModel } from '~/server/models/Product'
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
    const { productId, quantity = 1 } = body


    if (!productId) {
      throw createError({
        statusCode: 400,
        message: 'Product ID is required'
      })
    }

    if (quantity < 1) {
      throw createError({
        statusCode: 400,
        message: 'Quantity must be at least 1'
      })
    }

    // Get product details
    const product = await ProductModel.findById(productId)
    
    if (!product) {
      throw createError({
        statusCode: 404,
        message: 'Product not found'
      })
    }


    // Find or create user's cart
    let cart = await CartModel.findOne({ userId: payload.userId })
    
    if (!cart) {
      cart = await CartModel.create({
        userId: payload.userId,
        items: []
      })
    }


    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(item => item.productId === productId)

    if (existingItemIndex >= 0) {
      // Update quantity of existing item
      cart.items[existingItemIndex].quantity += quantity
    } else {
      // Add new item to cart
      cart.items.push({
        productId: product.id || product._id.toString(),
        name: product.name,
        price: product.price,
        salePrice: product.salePrice,
        image: product.images[0] || '/images/placeholder.jpg',
        quantity: quantity,
        slug: product.slug
      })
    }

    // Save cart
    await cart.save()
    

    return {
      success: true,
      message: 'Item added to cart',
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
    console.error('Cart add error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
}) 