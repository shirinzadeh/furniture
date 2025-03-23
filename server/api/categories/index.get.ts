import { defineEventHandler, getQuery, createError } from 'h3'
import { CategoryModel } from '~/server/models/Category'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    
    // Parse query parameters
    const includeProductCount = query.includeProductCount === 'true'
    
    // Get categories
    let categoriesQuery = CategoryModel.find().sort({ name: 1 })
    
    // Populate product count if requested
    if (includeProductCount) {
      categoriesQuery = categoriesQuery.populate('_count.products')
    }
    
    const categories = await categoriesQuery
    
    return categories
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
}) 