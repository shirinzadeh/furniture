import { defineEventHandler, getQuery, createError } from 'h3'
import { CategoryModel } from '~/server/models/Category'
import { ProductModel } from '~/server/models/Product'

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
    let categories = await CategoryModel.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()
    
    // Get product counts for all categories in a single query for better performance
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