import { defineEventHandler, createError } from 'h3'
import { BannerModel } from '~/server/models/Banner'

export default defineEventHandler(async (event) => {
  try {
    // Admin middleware already verifies admin access
    
    const id = event.context.params?.id
    
    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Banner ID is required'
      })
    }
    
    // Find and delete banner
    const banner = await BannerModel.findByIdAndDelete(id)
    
    if (!banner) {
      throw createError({
        statusCode: 404,
        message: 'Banner not found'
      })
    }
    
    return {
      success: true,
      message: 'Banner deleted successfully',
      id
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
})