import { ObjectId } from 'mongodb'

export interface Banner {
  _id?: string | ObjectId
  id?: string
  title: string
  subtitle?: string
  image: string
  link?: string
  active: boolean
  order: number
  createdAt: string | Date
  updatedAt: string | Date
}

export interface Category {
  _id?: string | ObjectId
  id?: string
  name: string
  slug: string
  description?: string
  image?: string
  _count?: {
    products: number
  }
  createdAt: string | Date
  updatedAt: string | Date
}

export interface Product {
  _id?: string | ObjectId
  id?: string
  name: string
  slug: string
  description: string | null
  price: number
  salePrice: number | null
  images: string[]
  inStock: boolean
  featured?: boolean
  stock?: number
  category?: Category
  categoryId: string
  createdAt: string | Date
  updatedAt: string | Date
}

export interface User {
  _id?: string | ObjectId
  id?: string
  email: string
  name?: string
  password: string
  role: 'user' | 'admin'
  createdAt: string | Date
  updatedAt: string | Date
} 