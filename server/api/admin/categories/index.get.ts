import { defineEventHandler, getQuery, createError } from 'h3'
import { CategoryModel } from '~/server/models/Category'

export default defineEventHandler(async (event) => {
  try {
    // Admin middleware already verifies admin access
    
    const query = getQuery(event)
    
    // Parse query parameters
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 20
    const search = query.search as string || ''
    const sortBy = query.sortBy as string || 'createdAt'
    const sortOrder = query.sortOrder as string === 'asc' ? 1 : -1
    
    // Build filter criteria
    const filter: any = {}
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit
    
    // Build sort object
    const sort: any = {}
    sort[sortBy] = sortOrder
    
    // Count total matching categories (for pagination)
    const total = await CategoryModel.countDocuments(filter)
    
    // Get categories with pagination and sorting
    const categories = await CategoryModel.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      // Always include product count for admin view
      .populate('_count.products')
    
    return {
      categories,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
}) 