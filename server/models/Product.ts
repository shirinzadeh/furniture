import mongoose from 'mongoose'
import type { Product } from '~/types'

const productSchema = new mongoose.Schema<Product>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: false, default: null },
    price: { type: Number, required: true },
    salePrice: { type: Number, required: false, default: null },
    images: { type: [String], required: true, default: [] },
    inStock: { type: Boolean, required: true, default: true },
    featured: { type: Boolean, required: false, default: false },
    stock: { type: Number, required: false },
    categoryId: { 
      type: String, 
      required: true, 
      ref: 'Category'
    }
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

// Virtual for category
productSchema.virtual('category', {
  ref: 'Category',
  localField: 'categoryId',
  foreignField: '_id',
  justOne: true
})

export const ProductModel = mongoose.model<Product>('Product', productSchema) 