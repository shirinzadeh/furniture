import { defineEventHandler, getQuery, createError } from 'h3'
import { CategoryModel } from '~/server/models/Category'
import { ProductModel } from '~/server/models/Product'

export default defineEventHandler(async (event) => {
  try {
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
    let categories = await CategoryModel.find({}, projection)
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
      
      // Add _count object to each category
      categories = categories.map(category => ({
        ...category,
        _count: {
          products: countMap.get(category._id.toString()) || 0
        }
      }))
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