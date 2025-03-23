import { defineEventHandler, createError } from 'h3'
import { ProductModel } from '~/server/models/Product'
import { CategoryModel } from '~/server/models/Category'
import { UserModel } from '~/server/models/User'

export default defineEventHandler(async (event) => {
  try {
    // Admin middleware already verifies admin access
    
    // Get counts from database
    const [totalProducts, totalCategories, totalUsers, recentProducts] = await Promise.all([
      ProductModel.countDocuments(),
      CategoryModel.countDocuments(),
      UserModel.countDocuments(),
      ProductModel.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('category')
    ])
    
    return {
      statusCode: 200,
      stats: {
        totalProducts,
        totalCategories,
        totalUsers
      },
      recentProducts
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
}) 