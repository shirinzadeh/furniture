import { defineEventHandler, readBody, createError } from 'h3'
import { CategoryModel } from '~/server/models/Category'

export default defineEventHandler(async (event) => {
  try {
    // Admin middleware already verifies admin access
    
    const body = await readBody(event)
    
    // Validate required fields
    if (!body.name || !body.slug) {
      throw createError({
        statusCode: 400,
        message: 'Name and slug are required'
      })
    }
    
    // Check if category with slug already exists
    const existingCategory = await CategoryModel.findOne({ slug: body.slug })
    
    if (existingCategory) {
      throw createError({
        statusCode: 409,
        message: 'Category with this slug already exists'
      })
    }
    
    // Create new category
    const category = await CategoryModel.create({
      name: body.name,
      slug: body.slug,
      description: body.description || null,
      image: body.image || null
    })
    
    return category
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
}) 