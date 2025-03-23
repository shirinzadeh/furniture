import { defineEventHandler, getQuery, createError } from 'h3'
import { BannerModel } from '~/server/models/Banner'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    
    // Parse query parameters
    const activeOnly = query.activeOnly !== 'false' // Default to true
    
    // Build filter
    const filter: any = {}
    if (activeOnly) {
      filter.active = true
    }
    
    // Get banners sorted by order
    const banners = await BannerModel.find(filter).sort({ order: 1 })
    
    return banners
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
}) 