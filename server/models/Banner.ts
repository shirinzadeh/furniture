import mongoose from 'mongoose'
import type { Banner } from '~/types'

const bannerSchema = new mongoose.Schema<Banner>(
  {
    title: { type: String, required: true },
    subtitle: { type: String, required: false },
    image: { type: String, required: true },
    link: { type: String, required: false },
    active: { type: Boolean, required: true, default: true },
    order: { type: Number, required: true, default: 0 }
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

export const BannerModel = mongoose.model<Banner>('Banner', bannerSchema) 