import { defineEventHandler, getQuery, createError } from 'h3'
import { UserModel } from '~/server/models/User'

export default defineEventHandler(async (event) => {
  try {
    // Admin middleware already verifies admin access
    
    const query = getQuery(event)
    
    // Parse query parameters
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 20
    const search = query.search as string || ''
    const role = query.role as string
    const sortBy = query.sortBy as string || 'createdAt'
    const sortOrder = query.sortOrder as string === 'asc' ? 1 : -1
    
    // Build filter criteria
    const filter: any = {}
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }
    
    if (role === 'admin' || role === 'user') {
      filter.role = role
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit
    
    // Build sort object
    const sort: any = {}
    sort[sortBy] = sortOrder
    
    // Count total matching users (for pagination)
    const total = await UserModel.countDocuments(filter)
    
    // Get users with pagination and sorting
    // Exclude password field for security
    const users = await UserModel.find(filter, { password: 0 })
      .sort(sort)
      .skip(skip)
      .limit(limit)
    
    return {
      users,
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