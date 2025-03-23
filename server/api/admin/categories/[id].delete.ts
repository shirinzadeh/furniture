import { defineEventHandler, createError } from 'h3'
import { CategoryModel } from '~/server/models/Category'
import { ProductModel } from '~/server/models/Product'

export default defineEventHandler(async (event) => {
  try {
    // Admin middleware already verifies admin access
    
    const id = event.context.params?.id
    
    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Category ID is required'
      })
    }
    
    // Check if there are products in this category
    const productsCount = await ProductModel.countDocuments({ categoryId: id })
    
    if (productsCount > 0) {
      throw createError({
        statusCode: 400,
        message: `Cannot delete category because it contains ${productsCount} products. Please reassign or delete these products first.`
      })
    }
    
    // Find and delete category
    const category = await CategoryModel.findByIdAndDelete(id)
    
    if (!category) {
      throw createError({
        statusCode: 404,
        message: 'Category not found'
      })
    }
    
    return {
      success: true,
      message: 'Category deleted successfully',
      id
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
}) 