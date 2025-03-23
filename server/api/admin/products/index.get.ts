import { defineEventHandler, getQuery, createError } from 'h3'
import { ProductModel } from '~/server/models/Product'

export default defineEventHandler(async (event) => {
  try {
    // Admin middleware already verifies admin access
    
    const query = getQuery(event)
    
    // Parse query parameters
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 20
    const search = query.search as string || ''
    const categoryId = query.categoryId as string
    const featured = query.featured as string
    const inStock = query.inStock as string
    const onSale = query.onSale as string
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
    
    if (categoryId) {
      filter.categoryId = categoryId
    }
    
    if (featured === 'true') {
      filter.featured = true
    } else if (featured === 'false') {
      filter.featured = false
    }
    
    if (inStock === 'true') {
      filter.inStock = true
    } else if (inStock === 'false') {
      filter.inStock = false
    }
    
    if (onSale === 'true') {
      filter.salePrice = { $ne: null }
    } else if (onSale === 'false') {
      filter.salePrice = null
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit
    
    // Build sort object
    const sort: any = {}
    sort[sortBy] = sortOrder
    
    // Count total matching products (for pagination)
    const total = await ProductModel.countDocuments(filter)
    
    // Get products with pagination and sorting
    const products = await ProductModel.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('category')
    
    return {
      products,
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