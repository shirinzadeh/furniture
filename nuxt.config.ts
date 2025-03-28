// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@nuxt/image',
    '@nuxt/icon',
    '@nuxtjs/tailwindcss',
    'nuxt-swiper',
    '@pinia/nuxt',
    'nuxt-mongoose'
  ],
  mongoose: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/furniture',
    options: {
      connectTimeoutMS: 30000, // Increase timeout to 30 seconds
      socketTimeoutMS: 30000,  // Socket timeout
      serverSelectionTimeoutMS: 30000,
      maxPoolSize: 20,         // Increased connection pool size
      minPoolSize: 5,          // Keep minimum connections ready
      maxIdleTimeMS: 60000     // Close idle connections after 1 minute
    }
  },
  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET,
    apiURL: process.env.API_URL,
    public: {
      apiURL: process.env.API_URL
    }
  }
})