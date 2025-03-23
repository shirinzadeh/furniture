import { defineEventHandler, readBody, createError } from 'h3'
import { CategoryModel } from '~/server/models/Category'

export default defineEventHandler(async (event) => {
  try {
    // Admin middleware already verifies admin access
    
    const id = event.context.params?.id
    const body = await readBody(event)
    
    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Category ID is required'
      })
    }
    
    // Find category by ID
    const category = await CategoryModel.findById(id)
    
    if (!category) {
      throw createError({
        statusCode: 404,
        message: 'Category not found'
      })
    }
    
    // Check if slug is changed and if new slug already exists
    if (body.slug && body.slug !== category.slug) {
      const existingCategoryWithSlug = await CategoryModel.findOne({ 
        slug: body.slug,
        _id: { $ne: id }
      })
      
      if (existingCategoryWithSlug) {
        throw createError({
          statusCode: 409,
          message: 'Category with this slug already exists'
        })
      }
    }
    
    // Update category fields
    if (body.name !== undefined) category.name = body.name
    if (body.slug !== undefined) category.slug = body.slug
    if (body.description !== undefined) category.description = body.description
    if (body.image !== undefined) category.image = body.image
    
    // Save updated category
    await category.save()
    
    return category
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
}) 