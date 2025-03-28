import mongoose from 'mongoose'
import { config } from 'dotenv'
import { ProductModel } from '../models/Product'
import { CategoryModel } from '../models/Category'
import { BannerModel } from '../models/Banner'

// Load environment variables
config()

// Get MongoDB connection string from environment variables
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/furniture'

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('MongoDB connected...')
    return true
  } catch (err) {
    console.error('MongoDB connection error:', err)
    return false
  }
}

// Create indexes
const createIndexes = async () => {
  try {
    console.log('Creating indexes for products collection...')
    
    // Product indexes
    await ProductModel.collection.createIndex({ slug: 1 }, { unique: true })
    await ProductModel.collection.createIndex({ name: 1 })
    await ProductModel.collection.createIndex({ categoryId: 1 })
    await ProductModel.collection.createIndex({ featured: 1 })
    await ProductModel.collection.createIndex({ createdAt: -1 }, { name: "createdAt_-1" })
    await ProductModel.collection.createIndex({ 'salePrice': 1 }, { sparse: true }) // Sparse index for salePrice
    await ProductModel.collection.createIndex({ featured: 1, createdAt: -1 }, { name: "featured_1_createdAt_-1" }) // Named compound index
    
    console.log('Creating indexes for categories collection...')
    
    // Category indexes
    await CategoryModel.collection.createIndex({ slug: 1 }, { unique: true })
    await CategoryModel.collection.createIndex({ name: 1 })
    
    console.log('Creating indexes for banners collection...')
    
    // Banner indexes
    await BannerModel.collection.createIndex({ order: 1 })
    await BannerModel.collection.createIndex({ active: 1 })
    
    console.log('All indexes created successfully!')
    
    return {
      success: true
    }
  } catch (error: any) {
    console.error('Error creating indexes:', error)
    throw new Error(`Index creation failed: ${error.message}`)
  }
}

// Main function
const main = async () => {
  try {
    // Connect to the database
    const connected = await connectDB()
    if (!connected) {
      process.exit(1)
    }
    
    // Create indexes
    await createIndexes()
    
    console.log('==========================================')
    console.log('Database index creation completed successfully!')
    console.log('==========================================')
    
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  } finally {
    // Close the database connection
    await mongoose.disconnect()
    process.exit(0)
  }
}

// Run the main function
main() 