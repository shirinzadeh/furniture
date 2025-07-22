import { defineEventHandler, createError } from 'h3'
import { CategoryModel } from '~/server/models/Category'
import { ProductModel } from '~/server/models/Product'

export default defineEventHandler(async (event) => {
  try {
    const slug = event.context.params?.slug
    
    if (!slug) {
      throw createError({
        statusCode: 400,
        message: 'Category slug is required'
      })
    }
    
    // Find category by slug (without lean to get proper model transformation)
    const category = await CategoryModel.findOne({ slug })
    
    if (!category) {
      throw createError({
        statusCode: 404,
        message: 'Category not found'
      })
    }
    
    // Get product count using the string version of category ID
    const productCount = await ProductModel.countDocuments({ categoryId: category._id.toString() })
    
    // Convert to plain object and add product count
    const categoryData = category.toJSON()
    categoryData._count = {
      products: productCount
    }
    
    return categoryData
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
}) 