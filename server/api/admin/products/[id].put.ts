import { defineEventHandler, readBody, createError } from 'h3'
import { ProductModel } from '~/server/models/Product'

export default defineEventHandler(async (event) => {
  try {
    // Admin middleware already verifies admin access
    
    const id = event.context.params?.id
    const body = await readBody(event)
    
    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Product ID is required'
      })
    }
    
    // Find product by ID
    const product = await ProductModel.findById(id)
    
    if (!product) {
      throw createError({
        statusCode: 404,
        message: 'Product not found'
      })
    }
    
    // Check if slug is changed and if new slug already exists
    if (body.slug && body.slug !== product.slug) {
      const existingProductWithSlug = await ProductModel.findOne({ 
        slug: body.slug,
        _id: { $ne: id }
      })
      
      if (existingProductWithSlug) {
        throw createError({
          statusCode: 409,
          message: 'Product with this slug already exists'
        })
      }
    }
    
    // Update product fields
    if (body.name !== undefined) product.name = body.name
    if (body.slug !== undefined) product.slug = body.slug
    if (body.description !== undefined) product.description = body.description
    if (body.price !== undefined) product.price = body.price
    if (body.salePrice !== undefined) product.salePrice = body.salePrice
    if (body.images !== undefined) product.images = body.images
    if (body.inStock !== undefined) product.inStock = body.inStock
    if (body.featured !== undefined) product.featured = body.featured
    if (body.stock !== undefined) product.stock = body.stock
    if (body.categoryId !== undefined) product.categoryId = body.categoryId
    
    // Save updated product
    await product.save()
    
    // Populate the category
    await product.populate('category')
    
    return product
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
}) 