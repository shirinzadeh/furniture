import { defineEventHandler, getQuery, createError } from 'h3'
import { CategoryModel } from '~/server/models/Category'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    
    // Parse query parameters
    const includeProductCount = query.includeProductCount === 'true'
    
    // Define fields to project
    const projection = {
      name: 1,
      slug: 1,
      image: 1,
      description: 1
    }
    
    // Get categories with optimizations
    let categoriesQuery = CategoryModel.find({}, projection)
      .sort({ name: 1 })
      .lean() // Convert to plain JS objects for better performance
    
    // Populate product count if requested
    if (includeProductCount) {
      categoriesQuery = categoriesQuery.populate('_count.products')
    }
    
    const categories = await categoriesQuery
    
    return categories
  } catch (error: any) {
    console.error('Categories fetch error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
}) 