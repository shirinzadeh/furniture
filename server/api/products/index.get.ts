import { defineEventHandler, getQuery, createError } from 'h3'
import { ProductModel } from '~/server/models/Product'
import mongoose from 'mongoose'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    
    // Parse query parameters
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 12
    const featured = query.featured === 'true'
    const recommended = query.recommended === 'true'
    const onSale = query.onSale === 'true'
    const bestseller = query.bestseller === 'true'
    const categoryId = query.categoryId as string
    const excludeId = query.excludeId as string // For excluding current product in recommendations
    const search = query.search as string
    
    // Build filter
    const filter: any = {}
    
    if (featured) {
      filter.featured = true
    }
    
    if (categoryId) {
      filter.categoryId = categoryId
    }
    
    if (search) {
      filter.name = { $regex: search, $options: 'i' }
    }
    
    // Products on sale have a salePrice that is not null
    if (onSale) {
      filter.salePrice = { $ne: null }
    }
    
    // Exclude a specific product (useful for recommendations)
    if (excludeId) {
      // Validate if excludeId is a valid MongoDB ObjectId to prevent errors
      if (mongoose.isValidObjectId(excludeId)) {
        filter._id = { $ne: excludeId }
      }
    }
    
    // Calculate skip for pagination
    const skip = (page - 1) * limit
    
    // Determine sort order based on query type
    let sortOptions: any = { createdAt: -1 } // Default sort
    
    if (recommended) {
      // For recommended products, prioritize featured items
      sortOptions = { featured: -1, createdAt: -1 }
    } else if (bestseller) {
      // For bestseller products, we would normally sort by sales count
      // Since we don't have that data, we'll just use featured and creation date as a proxy
      sortOptions = { featured: -1, createdAt: -1 }
    } else if (onSale) {
      // For sale products, prioritize bigger discounts
      // We can calculate this using an aggregation pipeline in a more complex implementation
      // For now, just sort by creation date
      sortOptions = { createdAt: -1 }
    }
    
    // Get products with pagination
    const [products, total] = await Promise.all([
      ProductModel.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('category'),
      ProductModel.countDocuments(filter)
    ])
    
    // Calculate pagination data
    const totalPages = Math.ceil(total / limit)
    
    return {
      products,
      pagination: {
        page,
        limit,
        totalItems: total,
        totalPages
      }
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
}) 