import mongoose from 'mongoose'
import type { Category } from '~/types'

const categorySchema = new mongoose.Schema<Category>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: false },
    image: { type: String, required: false }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        ret.id = ret._id.toString()
        delete ret._id
        delete ret.__v
        return ret
      }
    }
  }
)

// Virtual for product count - using correct syntax
categorySchema.virtual('productCount', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'categoryId',
  count: true
})

export const CategoryModel = mongoose.model<Category>('Category', categorySchema) 