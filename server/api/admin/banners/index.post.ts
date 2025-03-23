import { defineEventHandler, readBody, createError } from 'h3'
import { BannerModel } from '~/server/models/Banner'

export default defineEventHandler(async (event) => {
  try {
    // Admin middleware already verifies admin access
    
    const body = await readBody(event)
    
    // Validate required fields
    if (!body.title || !body.image) {
      throw createError({
        statusCode: 400,
        message: 'Title and image are required'
      })
    }
    
    // Create new banner
    const banner = await BannerModel.create({
      title: body.title,
      subtitle: body.subtitle || null,
      image: body.image,
      link: body.link || null,
      active: body.active !== undefined ? body.active : true,
      order: body.order !== undefined ? body.order : 0
    })
    
    return banner
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
}) 