import { defineEventHandler, readBody, createError } from 'h3'
import { hash } from 'bcrypt'
import { CategoryModel } from '~/server/models/Category'
import { ProductModel } from '~/server/models/Product'
import { BannerModel } from '~/server/models/Banner'
import { UserModel } from '~/server/models/User'

// Sample seed data
const categories = [
  { name: 'Living Room', slug: 'living-room', image: '/images/categories/living-room.jpg', featured: true },
  { name: 'Bedroom', slug: 'bedroom', image: '/images/categories/bedroom.jpg', featured: true },
  { name: 'Dining Room', slug: 'dining-room', image: '/images/categories/dining-room.jpg', featured: true },
  { name: 'Office', slug: 'office', image: '/images/categories/office.jpg', featured: true },
  { name: 'Outdoor', slug: 'outdoor', image: '/images/categories/outdoor.jpg', featured: false }
]

const products = [
  {
    name: 'Modern Sofa',
    slug: 'modern-sofa',
    price: 999.99,
    discountPrice: 899.99,
    inStock: true,
    description: 'A comfortable modern sofa with clean lines and durable fabric upholstery. Perfect for contemporary living spaces.',
    details: {
      dimensions: '85"W x 36"D x 33"H',
      weight: '120 lbs',
      materials: ['Wood frame', 'High-density foam', 'Polyester fabric'],
      colors: ['Gray', 'Blue', 'Beige']
    },
    features: [
      'Stain resistant fabric',
      'Removable cushion covers',
      'Solid wood legs',
      'No-sag spring system'
    ],
    images: [
      '/images/products/modern-sofa-1.jpg',
      '/images/products/modern-sofa-2.jpg',
      '/images/products/modern-sofa-3.jpg'
    ],
    thumbnail: '/images/products/modern-sofa-thumb.jpg',
    categorySlug: 'living-room',
    recommended: true,
    featured: true
  },
  {
    name: 'Queen Platform Bed',
    slug: 'queen-platform-bed',
    price: 649.99,
    discountPrice: null,
    inStock: true,
    description: 'A stylish queen platform bed with a tufted headboard and wooden slats. No box spring required.',
    details: {
      dimensions: '63"W x 84"D x 46"H',
      weight: '95 lbs',
      materials: ['Engineered wood', 'Linen upholstery', 'Steel frame'],
      colors: ['Gray', 'Beige']
    },
    features: [
      'No box spring needed',
      'Strong wood slat support',
      'Noise-free construction',
      'Easy assembly'
    ],
    images: [
      '/images/products/platform-bed-1.jpg',
      '/images/products/platform-bed-2.jpg'
    ],
    thumbnail: '/images/products/platform-bed-thumb.jpg',
    categorySlug: 'bedroom',
    recommended: true,
    featured: false
  },
  {
    name: 'Executive Office Desk',
    slug: 'executive-office-desk',
    price: 499.99,
    discountPrice: 449.99,
    inStock: true,
    description: 'A spacious executive desk with plenty of storage and a sleek modern design.',
    details: {
      dimensions: '60"W x 30"D x 29"H',
      weight: '110 lbs',
      materials: ['Engineered wood', 'Steel', 'Tempered glass'],
      colors: ['Black', 'Walnut']
    },
    features: [
      'Multiple storage drawers',
      'Cable management system',
      'Sturdy steel frame',
      'Scratch-resistant surface'
    ],
    images: [
      '/images/products/office-desk-1.jpg',
      '/images/products/office-desk-2.jpg'
    ],
    thumbnail: '/images/products/office-desk-thumb.jpg',
    categorySlug: 'office',
    recommended: false,
    featured: true
  },
  {
    name: 'Dining Table Set',
    slug: 'dining-table-set',
    price: 799.99,
    discountPrice: 699.99,
    inStock: true,
    description: 'A modern dining table set with 6 chairs, perfect for family gatherings and dinner parties.',
    details: {
      dimensions: 'Table: 72"L x 42"W x 30"H, Chairs: 18"W x 22"D x 38"H',
      weight: '180 lbs total',
      materials: ['Solid wood', 'Faux leather', 'Metal accents'],
      colors: ['Espresso', 'Oak']
    },
    features: [
      'Extendable table design',
      'Comfortable padded chairs',
      'Scratch-resistant finish',
      'Easy assembly'
    ],
    images: [
      '/images/products/dining-set-1.jpg',
      '/images/products/dining-set-2.jpg'
    ],
    thumbnail: '/images/products/dining-set-thumb.jpg',
    categorySlug: 'dining-room',
    recommended: true,
    featured: true
  },
  {
    name: 'Outdoor Patio Set',
    slug: 'outdoor-patio-set',
    price: 1299.99,
    discountPrice: 999.99,
    inStock: true,
    description: 'A durable and stylish outdoor patio set with a table and 4 chairs, perfect for outdoor dining.',
    details: {
      dimensions: 'Table: 60"L x 36"W x 29"H, Chairs: 22"W x 24"D x 35"H',
      weight: '165 lbs total',
      materials: ['Powder-coated aluminum', 'All-weather wicker', 'Tempered glass'],
      colors: ['Brown', 'Gray']
    },
    features: [
      'Weather-resistant construction',
      'UV protected materials',
      'Rust-proof aluminum frame',
      'Quick-dry cushions'
    ],
    images: [
      '/images/products/patio-set-1.jpg',
      '/images/products/patio-set-2.jpg'
    ],
    thumbnail: '/images/products/patio-set-thumb.jpg',
    categorySlug: 'outdoor',
    recommended: false,
    featured: true
  }
]

const banners = [
  {
    title: 'Summer Sale',
    subtitle: 'Up to 40% off on selected items',
    image: '/images/banners/summer-sale.jpg',
    buttonText: 'Shop Now',
    buttonLink: '/sale',
    active: true,
    priority: 1
  },
  {
    title: 'New Arrivals',
    subtitle: 'Check out our latest furniture collection',
    image: '/images/banners/new-arrivals.jpg',
    buttonText: 'Explore',
    buttonLink: '/new-arrivals',
    active: true,
    priority: 2
  },
  {
    title: 'Home Office',
    subtitle: 'Create your perfect workspace',
    image: '/images/banners/home-office.jpg',
    buttonText: 'Discover',
    buttonLink: '/category/office',
    active: true,
    priority: 3
  }
]

// Admin user data
const adminUser = {
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'admin123',
  role: 'admin'
}

export default defineEventHandler(async (event) => {
  try {
    // Get request body
    const body = await readBody(event) || {}
    const { clearBefore = false, force = false } = body
    
    // Check if the database is empty or has data
    const categoryCount = await CategoryModel.countDocuments()
    const productCount = await ProductModel.countDocuments()
    const bannerCount = await BannerModel.countDocuments()
    const adminCount = await UserModel.countDocuments({ role: 'admin' })
    
    const hasData = categoryCount > 0 || productCount > 0 || bannerCount > 0
    
    // If database has data and force is false and clearBefore is false, return an error
    if (hasData && !force && !clearBefore) {
      return {
        success: false,
        message: 'Database already has data. Use force=true or clearBefore=true to proceed.'
      }
    }
    
    // Clear existing data if requested
    if (clearBefore) {
      await Promise.all([
        CategoryModel.deleteMany({}),
        ProductModel.deleteMany({}),
        BannerModel.deleteMany({})
      ])
      
      // Don't delete admin users by default
    }
    
    // Seed categories
    await CategoryModel.insertMany(categories)
    
    // Seed products
    await ProductModel.insertMany(products)
    
    // Seed banners
    await BannerModel.insertMany(banners)
    
    // Create an admin user if none exists
    let adminCreated = false
    if (adminCount === 0) {
      const hashedPassword = await hash(adminUser.password, 10)
      await UserModel.create({
        ...adminUser,
        password: hashedPassword
      })
      adminCreated = true
    }
    
    return {
      success: true,
      message: 'Database seeded successfully',
      categories: categories.length,
      products: products.length,
      banners: banners.length,
      adminCreated
    }
  } catch (error: any) {
    console.error('Database seeding error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to seed database',
      message: error.message
    })
  }
}) 