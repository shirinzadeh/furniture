import { defineEventHandler, createError } from 'h3'
import { ProductModel } from '~/server/models/Product'

export default defineEventHandler(async (event) => {
  try {
    // Admin middleware already verifies admin access
    
    const id = event.context.params?.id
    
    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Product ID is required'
      })
    }
    
    // Find product by ID and populate category
    const product = await ProductModel.findById(id).populate('category')
    
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