import { defineEventHandler, createError } from 'h3'
import { ProductModel } from '~/server/models/Product'
import { CategoryModel } from '~/server/models/Category'
import { BannerModel } from '~/server/models/Banner'

// Cache related variables
let cache: any = null
let cacheTime: number = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes in milliseconds

export default defineEventHandler(async (event) => {
  try {
    const now = Date.now()
    
    // Return cached data if it's still valid
    if (cache && now - cacheTime < CACHE_TTL) {
      return cache
    }
    
    // Define projections for minimal data transfer
    const bannerProjection = { 
      title: 1, subtitle: 1, image: 1, link: 1, order: 1 
    }
    
    const categoryProjection = { 
      name: 1, slug: 1, image: 1 
    }
    
    const productProjection = {
      name: 1, slug: 1, price: 1, salePrice: 1, images: 1, categoryId: 1
    }
    
    // Fetch all required data in parallel
    const [banners, featuredCategories, featuredProducts] = await Promise.all([
      // Active banners sorted by order
      BannerModel.find({ active: true }, bannerProjection)
        .sort({ order: 1 })
        .lean(),
      
      // Featured categories (get all categories for now, could be modified to filter)
      CategoryModel.find({}, categoryProjection)
        .limit(6)
        .sort({ name: 1 })
        .lean(),
      
      // Featured products
      ProductModel.find({ featured: true }, productProjection)
        .limit(8)
        .sort({ createdAt: -1 })
        .lean()
    ])
    
    // Build response object
    const response = {
      banners,
      featuredCategories,
      featuredProducts
    }
    
    // Update cache
    cache = response
    cacheTime = now
    
    return response
  } catch (error: any) {
    console.error('Featured content fetch error:', error)
    // Clear cache on error
    cache = null
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
}) 