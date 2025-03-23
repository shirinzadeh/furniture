import mongoose from 'mongoose'
import type { User } from '~/types'

const userSchema = new mongoose.Schema<User>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: false },
    password: { type: String, required: true },
    role: { 
      type: String, 
      required: true, 
      enum: ['user', 'admin'],
      default: 'user'
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
        delete ret.password // Don't expose password in JSON
        return ret
      }
    }
  }
)

export const UserModel = mongoose.model<User>('User', userSchema) 