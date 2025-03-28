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
    
    // Define fields to project
    const projection = {
      name: 1,
      slug: 1,
      description: 1,
      price: 1,
      salePrice: 1,
      images: 1,
      inStock: 1,
      stock: 1,
      featured: 1,
      categoryId: 1
    }
    
    // Find product by slug and populate category with optimizations
    const product = await ProductModel.findOne({ slug }, projection)
      .populate({
        path: 'category',
        select: 'name slug image' // Only select needed fields
      })
      .lean() // Convert to plain JS object for better performance
    
    if (!product) {
      throw createError({
        statusCode: 404,
        message: 'Product not found'
      })
    }
    
    return product
  } catch (error: any) {
    console.error('Product detail fetch error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
}) 