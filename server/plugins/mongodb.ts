import mongoose from 'mongoose'

let isConnected = false

const connectDB = async () => {
  if (isConnected) {
    return
  }

  try {
    const config = useRuntimeConfig()
    const mongoUri = config.mongodbUri

    if (!mongoUri) {
      console.error('MongoDB URI is not defined')
      return
    }

    console.log('Connecting to MongoDB...')
    
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
      bufferCommands: false // Disable mongoose buffering
    })

    isConnected = true
    console.log('MongoDB connected successfully')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    isConnected = false
    throw error
  }
}

export default async () => {
  await connectDB()
} 