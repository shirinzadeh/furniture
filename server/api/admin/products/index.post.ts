import { defineEventHandler, readBody, createError } from 'h3'
import { ProductModel } from '~/server/models/Product'

export default defineEventHandler(async (event) => {
  try {
    // Admin middleware already verifies admin access
    
    const body = await readBody(event)
    
    // Validate required fields
    if (!body.name || !body.slug || !body.price || !body.categoryId) {
      throw createError({
        statusCode: 400,
        message: 'Name, slug, price, and categoryId are required'
      })
    }
    
    // Check if product with slug already exists
    const existingProduct = await ProductModel.findOne({ slug: body.slug })
    
    if (existingProduct) {
      throw createError({
        statusCode: 409,
        message: 'Product with this slug already exists'
      })
    }
    
    // Create new product
    const product = await ProductModel.create({
      name: body.name,
      slug: body.slug,
      description: body.description || null,
      price: body.price,
      salePrice: body.salePrice || null,
      images: body.images || [],
      inStock: body.inStock !== undefined ? body.inStock : true,
      featured: body.featured || false,
      stock: body.stock || null,
      categoryId: body.categoryId
    })
    
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