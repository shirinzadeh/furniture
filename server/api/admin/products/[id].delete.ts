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
    
    // Find and delete product
    const product = await ProductModel.findByIdAndDelete(id)
    
    if (!product) {
      throw createError({
        statusCode: 404,
        message: 'Product not found'
      })
    }
    
    return {
      success: true,
      message: 'Product deleted successfully',
      id
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
}) 