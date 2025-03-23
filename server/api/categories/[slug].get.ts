import { defineEventHandler, createError } from 'h3'
import { CategoryModel } from '~/server/models/Category'

export default defineEventHandler(async (event) => {
  try {
    const slug = event.context.params?.slug
    
    if (!slug) {
      throw createError({
        statusCode: 400,
        message: 'Category slug is required'
      })
    }
    
    // Find category by slug
    const category = await CategoryModel.findOne({ slug }).populate('_count.products')
    
    if (!category) {
      throw createError({
        statusCode: 404,
        message: 'Category not found'
      })
    }
    
    return category
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
}) 