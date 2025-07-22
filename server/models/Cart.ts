import mongoose from 'mongoose'

// CartItem interface for database
export interface CartItemDB {
  productId: string
  name: string
  price: number
  salePrice: number | null
  image: string
  quantity: number
  slug: string
}

// Cart interface for database
export interface CartDB {
  _id?: string | mongoose.Types.ObjectId
  id?: string
  userId: string
  items: CartItemDB[]
  createdAt: Date | string
  updatedAt: Date | string
}

// CartItem schema
const cartItemSchema = new mongoose.Schema<CartItemDB>({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  salePrice: { type: Number, default: null },
  image: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  slug: { type: String, required: true }
}, { _id: false })

// Cart schema
const cartSchema = new mongoose.Schema<CartDB>(
  {
    userId: { 
      type: String, 
      required: true, 
      unique: true,
      ref: 'User'
    },
    items: [cartItemSchema]
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

export const CartModel = mongoose.model<CartDB>('Cart', cartSchema) 