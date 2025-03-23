import { defineEventHandler, createError } from 'h3'
import { CategoryModel } from '~/server/models/Category'
import { ProductModel } from '~/server/models/Product'
import { BannerModel } from '~/server/models/Banner'
import { UserModel } from '~/server/models/User'

export default defineEventHandler(async () => {
  try {
    // Admin middleware already verifies admin access
    
    // Get database stats
    const [
      categories,
      products,
      banners,
      admins
    ] = await Promise.all([
      CategoryModel.countDocuments(),
      ProductModel.countDocuments(),
      BannerModel.countDocuments(),
      UserModel.countDocuments({ role: 'admin' })
    ])
    
    // Check if database is empty
    const isEmpty = categories === 0 && products === 0 && banners === 0

    return {
      success: true,
      stats: {
        categories,
        products,
        banners,
        admins
      },
      isEmpty
    }
  } catch (error: any) {
    console.error('Error retrieving database status:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to retrieve database status',
      message: error.message
    })
  }
}) 