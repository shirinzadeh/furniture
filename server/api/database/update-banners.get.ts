import { defineEventHandler, createError } from 'h3'
import { BannerModel } from '~/server/models/Banner'

export default defineEventHandler(async () => {
  try {
    // Get all banners
    const banners = await BannerModel.find()
    
    // Update paths for existing banners
    if (banners.length > 0) {
      const updates = [
        { id: banners[0].id, update: { image: '/images/banners/banner-1.jpg' } },
        { id: banners[1].id, update: { image: '/images/banners/winter-flash-sale.jpg' } },
        { id: banners[2].id, update: { image: '/images/banners/banner-2.jpg' } }
      ]
      
      // Apply updates
      for (const { id, update } of updates) {
        if (id) {
          await BannerModel.findByIdAndUpdate(id, update)
        }
      }
      
      return {
        success: true,
        message: 'Banner images updated successfully',
        count: updates.length
      }
    }
    
    return {
      success: false,
      message: 'No banners found to update'
    }
  } catch (error: any) {
    console.error('Error updating banner images:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update banner images',
      message: error.message
    })
  }
}) 