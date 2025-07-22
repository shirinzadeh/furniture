// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@nuxt/image',
    '@nuxt/icon',
    '@nuxtjs/tailwindcss',
    'nuxt-swiper',
    '@pinia/nuxt'
  ],
  runtimeConfig: {
    mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/furniture',
    jwtSecret: process.env.JWT_SECRET || 'your-fallback-secret-key',
    apiURL: process.env.API_URL,
    public: {
      apiURL: process.env.API_URL
    }
  },
  nitro: {
    plugins: ['~/server/plugins/mongodb.ts']
  }
})