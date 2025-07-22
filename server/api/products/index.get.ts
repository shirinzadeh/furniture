import { defineEventHandler, getQuery, createError } from 'h3'
import { ProductModel } from '~/server/models/Product'
import mongoose from 'mongoose'

// Ensure database connection
const ensureDBConnection = async () => {
  if (mongoose.connection.readyState !== 1) {
    const config = useRuntimeConfig()
    await mongoose.connect(config.mongodbUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false
    })
  }
}

export default defineEventHandler(async (event) => {
  try {
    // Ensure database connection
    await ensureDBConnection()
    
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
    
    // Define index hints based on the sort criteria to improve query performance
    let indexHint: string | null = null
    
    if (recommended) {
      // For recommended products, prioritize featured items
      sortOptions = { featured: -1, createdAt: -1 }
      indexHint = 'featured_1_createdAt_-1'
    } else if (bestseller) {
      sortOptions = { featured: -1, createdAt: -1 }
      indexHint = 'featured_1_createdAt_-1'
    } else if (onSale) {
      sortOptions = { createdAt: -1 }
      indexHint = 'createdAt_-1'
    }
    
    // Define fields to project (include only necessary fields)
    const projection = {
      name: 1,
      slug: 1,
      price: 1,
      salePrice: 1,
      images: 1,
      inStock: 1,
      featured: 1,
      categoryId: 1
    }
    
    // Get products with pagination - using Promise.all for parallel execution
    // Create base query
    let productsQuery = ProductModel.find(filter, projection)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'category',
        select: 'name slug image' // Only select needed fields from category
      })
      .lean(); // Convert to plain JS objects (faster)
    
    // Apply hint only if indexHint is not null
    if (indexHint) {
      productsQuery = productsQuery.hint(indexHint);
    }
    
    const [products, total] = await Promise.all([
      productsQuery,
      ProductModel.countDocuments(filter).lean()
    ])
    
    // Calculate pagination data
    const totalPages = Math.ceil(total / limit)
    
    return {
      products,
      count: total, // Add this field that frontend expects
      pagination: {
        page,
        limit,
        totalItems: total,
        totalPages,
        total // Also include in pagination for compatibility
      }
    }
  } catch (error: any) {
    console.error('Product fetch error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
}) 