import { defineEventHandler, createError } from 'h3'
import { ProductModel } from '~/server/models/Product'

export default defineEventHandler(async (event) => {
  try {
    const slug = event.context.params?.slug
    
    if (!slug) {
      throw createError({
        statusCode: 400,
        message: 'Product slug is required'
      })
    }
    
    // Find product by slug and populate category
    const product = await ProductModel.findOne({ slug }).populate('category')
    
    if (!product) {
      throw createError({
        statusCode: 404,
        message: 'Product not found'
      })
    }
    
    return product
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
}) 