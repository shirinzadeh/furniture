import mongoose from 'mongoose'

// Favorite interface for database
export interface FavoriteDB {
  _id?: string | mongoose.Types.ObjectId
  id?: string
  userId: string
  productId: string
  createdAt: Date | string
  updatedAt: Date | string
}

// Favorite schema
const favoriteSchema = new mongoose.Schema<FavoriteDB>(
  {
    userId: { 
      type: String, 
      required: true,
      ref: 'User'
    },
    productId: {
      type: String,
      required: true,
      ref: 'Product'
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

// Create compound index for unique user-product combinations and faster queries
favoriteSchema.index({ userId: 1, productId: 1 }, { unique: true })

export const FavoriteModel = mongoose.model<FavoriteDB>('Favorite', favoriteSchema) 