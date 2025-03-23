import mongoose from 'mongoose'
import { seedDatabase, clearDatabase } from '../utils/seeder'
import { config } from 'dotenv'

// Load environment variables
config()

// Get MongoDB connection string from environment variables
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/furniture'

// Parse command line arguments
const args = process.argv.slice(2)
const shouldClear = args.includes('--clear')
const force = args.includes('--force')

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

// Main function
const main = async () => {
  try {
    // Connect to the database
    const connected = await connectDB()
    if (!connected) {
      process.exit(1)
    }
    
    // Clear the database if requested
    if (shouldClear) {
      console.log('Clearing database...')
      await clearDatabase()
    }
    
    // Seed the database
    console.log('Seeding database...')
    const result = await seedDatabase()
    
    console.log('=========================================')
    console.log('Database seeding completed successfully!')
    console.log('=========================================')
    console.log(`Categories created: ${result.categories}`)
    console.log(`Products created: ${result.products}`)
    console.log(`Banners created: ${result.banners}`)
    
    if (result.adminCreated) {
      console.log('\nAdmin user created:')
      console.log('- Email: admin@example.com')
      console.log('- Password: admin123')
      console.log('\nIMPORTANT: Please change this password after first login!')
    }
    
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  } finally {
    // Close the database connection
    await mongoose.disconnect()
    process.exit(0)
  }
}

// Run the script
main() 