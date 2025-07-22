import { defineEventHandler, getQuery, createError } from 'h3'
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

    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 20

    // Get user's favorites with pagination
    const favorites = await FavoriteModel.find({ userId: payload.userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    // Get product details for each favorite
    const productIds = favorites.map(fav => fav.productId)
    const products = await ProductModel.find({ 
      _id: { $in: productIds } 
    }).populate('category').lean()

    // Create product map for quick lookup
    const productMap = new Map()
    products.forEach(product => {
      productMap.set(product._id.toString(), product)
    })

    // Combine favorites with product data
    const favoritesWithProducts = favorites
      .map(favorite => {
        const product = productMap.get(favorite.productId)
        return product ? {
          id: favorite._id.toString(),
          productId: favorite.productId,
          addedAt: favorite.createdAt,
          product: {
            ...product,
            id: product._id.toString()
          }
        } : null
      })
      .filter(Boolean) // Remove null entries (products that no longer exist)

    // Get total count for pagination
    const totalCount = await FavoriteModel.countDocuments({ userId: payload.userId })

    return {
      favorites: favoritesWithProducts,
      pagination: {
        page,
        limit,
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1
      }
    }
  } catch (error: any) {
    console.error('Favorites GET error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
}) 