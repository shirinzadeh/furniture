import { defineEventHandler, createError } from 'h3'
import { ProductModel } from '~/server/models/Product'
import { CategoryModel } from '~/server/models/Category'
import { UserModel } from '~/server/models/User'

export default defineEventHandler(async (event) => {
  try {
    // Admin middleware already verifies admin access
    
    // Get counts from database
    const [productsCount, categoriesCount, usersCount] = await Promise.all([
      ProductModel.countDocuments(),
      CategoryModel.countDocuments(),
      UserModel.countDocuments()
    ])
    
    // You could add more stats here like recent orders, revenue stats, etc.
    
    return {
      productsCount,
      categoriesCount,
      usersCount,
      lastUpdated: new Date()
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
}) 