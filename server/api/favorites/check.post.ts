import { defineEventHandler, readBody, createError } from 'h3'
import { FavoriteModel } from '~/server/models/Favorite'
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
    const { productIds } = body

    if (!productIds || !Array.isArray(productIds)) {
      throw createError({
        statusCode: 400,
        message: 'Product IDs array is required'
      })
    }

    // Find which products are in user's favorites
    const favorites = await FavoriteModel.find({
      userId: payload.userId,
      productId: { $in: productIds }
    }).lean()

    // Create a map of productId -> isFavorite
    const favoriteMap: Record<string, boolean> = {}
    
    // Initialize all products as not favorite
    productIds.forEach(productId => {
      favoriteMap[productId] = false
    })
    
    // Mark favorites as true
    favorites.forEach(favorite => {
      favoriteMap[favorite.productId] = true
    })

    return {
      success: true,
      favorites: favoriteMap
    }
  } catch (error: any) {
    console.error('Favorites check error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
}) 