import { defineEventHandler, readBody, createError } from 'h3'
import { BannerModel } from '~/server/models/Banner'

export default defineEventHandler(async (event) => {
  try {
    // Admin middleware already verifies admin access
    
    const id = event.context.params?.id
    const body = await readBody(event)
    
    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Banner ID is required'
      })
    }
    
    // Find banner by ID
    const banner = await BannerModel.findById(id)
    
    if (!banner) {
      throw createError({
        statusCode: 404,
        message: 'Banner not found'
      })
    }
    
    // Update banner fields
    if (body.title !== undefined) banner.title = body.title
    if (body.subtitle !== undefined) banner.subtitle = body.subtitle
    if (body.image !== undefined) banner.image = body.image
    if (body.link !== undefined) banner.link = body.link
    if (body.active !== undefined) banner.active = body.active
    if (body.order !== undefined) banner.order = body.order
    
    // Save updated banner
    await banner.save()
    
    return banner
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
}) 