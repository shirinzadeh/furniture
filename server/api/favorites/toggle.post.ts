import { defineEventHandler, readBody, createError } from 'h3'
import { FavoriteModel } from '~/server/models/Favorite'
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
    const { productId } = body

    if (!productId) {
      throw createError({
        statusCode: 400,
        message: 'Product ID is required'
      })
    }

    // Verify product exists
    const product = await ProductModel.findById(productId)
    
    if (!product) {
      throw createError({
        statusCode: 404,
        message: 'Product not found'
      })
    }

    // Check if product is already in favorites
    const existingFavorite = await FavoriteModel.findOne({
      userId: payload.userId,
      productId: productId
    })

    if (existingFavorite) {
      // Remove from favorites
      await FavoriteModel.deleteOne({
        userId: payload.userId,
        productId: productId
      })

      return {
        success: true,
        isFavorite: false,
        message: 'Product removed from favorites'
      }
    } else {
      // Add to favorites
      await FavoriteModel.create({
        userId: payload.userId,
        productId: productId
      })

      return {
        success: true,
        isFavorite: true,
        message: 'Product added to favorites'
      }
    }
  } catch (error: any) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return {
        success: true,
        isFavorite: true,
        message: 'Product is already in favorites'
      }
    }

    console.error('Favorites toggle error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
}) 