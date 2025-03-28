import { defineEventHandler, getQuery, createError } from 'h3'
import { BannerModel } from '~/server/models/Banner'

export default defineEventHandler(async (event) => {
  try {
    // Admin middleware already verifies admin access
    
    const query = getQuery(event)
    
    // Parse query parameters
    const sortBy = query.sortBy as string || 'order'
    const sortOrder = query.sortOrder as string === 'asc' ? 1 : -1
    
    // Build sort object
    const sort: any = {}
    sort[sortBy] = sortOrder
    
    // Get banners with sorting
    const banners = await BannerModel.find().sort(sort)
    
    return {
      banners
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
}) 