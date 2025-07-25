import { defineEventHandler, getQuery, createError } from 'h3'
import { CategoryModel } from '~/server/models/Category'
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
      bufferCommands: true
    })
  }
}

export default defineEventHandler(async (event) => {
  try {
    // Ensure database connection
    await ensureDBConnection()
    
    const query = getQuery(event)
    
    // Parse query parameters
    const includeProductCount = query.includeProductCount !== 'false' // Default to true
    
    // Define fields to project
    const projection = {
      name: 1,
      slug: 1,
      image: 1,
      description: 1
    }
    
    // Get categories with optimizations
    let categories: any[] = await CategoryModel.find({}, projection)
      .sort({ name: 1 })
      .lean() // Convert to plain JS objects for better performance
    
    // Add product count to each category if requested
    if (includeProductCount) {
      // Get product counts for all categories in a single query
      const productCounts = await ProductModel.aggregate([
        {
          $group: {
            _id: '$categoryId',
            count: { $sum: 1 }
          }
        }
      ])
      
      // Create a map for quick lookup
      const countMap = new Map()
      productCounts.forEach(item => {
        if (item._id) {
          countMap.set(item._id.toString(), item.count)
        }
      })
      
      // Add _count object to each category and transform _id to id
      const transformedCategories = categories.map((category): any => ({
        id: category._id.toString(),
        name: category.name,
        slug: category.slug,
        image: category.image,
        description: category.description,
        _count: {
          products: countMap.get(category._id.toString()) || 0
        }
      }))
      categories = transformedCategories
    }
    
    // If product count is not requested, still transform _id to id
    if (!includeProductCount) {
      const transformedCategories = categories.map((category): any => ({
        id: category._id.toString(),
        name: category.name,
        slug: category.slug,
        image: category.image,
        description: category.description
      }))
      categories = transformedCategories
    }

    return categories
  } catch (error: any) {
    console.error('Categories fetch error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
}) 