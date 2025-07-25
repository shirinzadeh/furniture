import { defineEventHandler, readBody, createError } from 'h3'
import { hash } from 'bcrypt'
import { CategoryModel } from '~/server/models/Category'
import { ProductModel } from '~/server/models/Product'
import { BannerModel } from '~/server/models/Banner'
import { UserModel } from '~/server/models/User'

// Sample seed data
const categories = [
  { name: 'Bedroom', slug: 'bedroom', image: '/images/categories/bedroom.webp', featured: true },
  { name: 'Dining Room', slug: 'dining-room', image: '/images/categories/dining-room.jpeg', featured: true },
  { name: 'Office', slug: 'office', image: '/images/categories/office.webp', featured: true },
  { name: 'Kids & Youth', slug: 'kids-youth', image: '/images/categories/kids-youth.jpeg', featured: true },
  { name: 'Wardrobe & Entryway', slug: 'wardrobe-entryway', image: '/images/categories/wardrobe-entryway.jpg', featured: false }
]

const products = [
  // Living Room Products
  {
    name: 'Modern Sofa',
    slug: 'modern-sofa',
    price: 999.99,
    salePrice: 899.99,
    inStock: true,
    stock: 10,
    description: 'A comfortable modern sofa with clean lines and durable fabric upholstery. Perfect for contemporary living spaces.',
    images: [
      '/images/products/modern-sofa.webp',
    ],
    featured: true,
    categorySlug: 'bedroom'
  },
  {
    name: 'Coffee Table',
    slug: 'coffee-table',
    price: 349.99,
    salePrice: null,
    inStock: true,
    stock: 15,
    description: 'Stylish coffee table with storage shelf, perfect centerpiece for your living room.',
    images: [
      '/images/products/coffee-table.jpg',
    ],
    featured: false,
    categorySlug: 'bedroom'
  },
  
  // Bedroom Products
  {
    name: 'Queen Platform Bed',
    slug: 'queen-platform-bed',
    price: 649.99,
    salePrice: 599.99,
    inStock: true,
    stock: 8,
    description: 'A stylish queen platform bed with a tufted headboard and wooden slats. No box spring required.',
    images: [
      '/images/products/queen-platform-bed.jpg',
    ],
    featured: true,
    categorySlug: 'bedroom'
  },
  {
    name: 'Dresser with Mirror',
    slug: 'dresser-with-mirror',
    price: 499.99,
    salePrice: null,
    inStock: true,
    stock: 12,
    description: 'Elegant dresser with attached mirror, featuring six spacious drawers for storage.',
    images: [
      '/images/products/dresser-with-mirror.jpg',
    ],
    featured: false,
    categorySlug: 'bedroom'
  },
  
  // Dining Room Products
  {
    name: 'Dining Table Set',
    slug: 'dining-table-set',
    price: 799.99,
    salePrice: 699.99,
    inStock: true,
    stock: 5,
    description: 'A modern dining table set with 6 chairs, perfect for family gatherings and dinner parties.',
    images: [
      '/images/products/dining-table-set.jpg',
    ],
    featured: true,
    categorySlug: 'dining-room'
  },
  {
    name: 'China Cabinet',
    slug: 'china-cabinet',
    price: 599.99,
    salePrice: 549.99,
    inStock: true,
    stock: 7,
    description: 'Beautiful china cabinet with glass doors to display your finest dinnerware.',
    images: [
      '/images/products/china-cabinet.webp',
    ],
    featured: false,
    categorySlug: 'dining-room'
  },
  
  // Office Products
  {
    name: 'Executive Office Desk',
    slug: 'executive-office-desk',
    price: 499.99,
    salePrice: 449.99,
    inStock: true,
    stock: 10,
    description: 'A spacious executive desk with plenty of storage and a sleek modern design.',
    images: [
      '/images/products/executive-office-desk.jpg',
    ],
    featured: true,
    categorySlug: 'office'
  },
  {
    name: 'Ergonomic Office Chair',
    slug: 'ergonomic-office-chair',
    price: 299.99,
    salePrice: 249.99,
    inStock: true,
    stock: 20,
    description: 'Comfortable ergonomic chair with adjustable height and lumbar support for long work sessions.',
    images: [
      '/images/products/ergonomic-office-chair.webp',
      '/images/products/ergonomic-office-chair-2.webp'
    ],
    featured: false,
    categorySlug: 'office'
  },
  
  // Kids & Youth Products
  {
    name: 'Bunk Bed',
    slug: 'bunk-bed',
    price: 599.99,
    salePrice: 549.99,
    inStock: true,
    stock: 8,
    description: 'Space-saving bunk bed for kids, featuring a built-in ladder and safety rails.',
    images: [
      '/images/products/bunk-bed.webp',
      '/images/products/bunk-bed-2.webp'
    ],
    featured: true,
    categorySlug: 'kids-youth'
  },
  {
    name: 'Study Desk',
    slug: 'kids-study-desk',
    price: 249.99,
    salePrice: null,
    inStock: true,
    stock: 15,
    description: 'Colorful study desk with shelves and drawers, perfect for homework and creative projects.',
    images: [
      '/images/products/kids-study-desk.jpg',
    ],
    featured: false,
    categorySlug: 'kids-youth'
  },
  
  // Wardrobe & Entryway Products
  {
    name: 'Entryway Bench with Storage',
    slug: 'entryway-bench',
    price: 199.99,
    salePrice: 179.99,
    inStock: true,
    stock: 12,
    description: 'Practical entryway bench with shoe storage and coat hooks to keep your entrance organized.',
    images: [
      '/images/products/entryway-bench.webp',
      '/images/products/entryway-bench-2.webp'
    ],
    featured: true,
    categorySlug: 'wardrobe-entryway'
  },
  {
    name: 'Wardrobe Cabinet',
    slug: 'wardrobe-cabinet',
    price: 449.99,
    salePrice: null,
    inStock: true,
    stock: 10,
    description: 'Spacious wardrobe with hanging space and shelves for organized clothing storage.',
    images: [
      '/images/products/wardrobe-cabinet.jpg',
    ],
    featured: false,
    categorySlug: 'wardrobe-entryway'
  },
  
  // Flash Sale Products
  {
    name: 'Accent Chair',
    slug: 'accent-chair',
    price: 349.99,
    salePrice: 249.99,
    inStock: true,
    stock: 10,
    description: 'Stylish accent chair with velvet upholstery, perfect for adding a pop of color to any room.',
    images: [
      '/images/products/accent-chair.webp',
      '/images/products/accent-chair-2.webp'
    ],
    featured: true,
    categorySlug: 'bedroom'
  },
  {
    name: 'Media Console',
    slug: 'media-console',
    price: 399.99,
    salePrice: 299.99,
    inStock: true,
    stock: 8,
    description: 'Modern media console with cable management and storage for all your entertainment needs.',
    images: [
      '/images/products/media-console.jpg',
    ],
    featured: true,
    categorySlug: 'living-room'
  }
]

const banners = [
  {
    title: 'New Collection',
    subtitle: 'Check out our latest furniture collection',
    image: '/images/banners/banner-1.jpg',
    link: '/new-arrivals',  
    active: true,
    order: 2
  },
  {
    title: 'Modern Designs',
    subtitle: 'Create your perfect living space',
    image: '/images/banners/banner-2.jpg',
    link: '/category/living-room',
    active: true,
    order: 3
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
    
    // Seed categories first
    const createdCategories = await CategoryModel.insertMany(categories)
    
    // Create a mapping from category slug to category ID
    const categoryMap = new Map()
    createdCategories.forEach(category => {
      categoryMap.set(category.slug, category._id.toString())
    })
    
    // Transform products to use categoryId instead of categorySlug
    const productsWithCategoryId = products.map(product => {
      const { categorySlug, ...productData } = product
      return {
        ...productData,
        categoryId: categoryMap.get(categorySlug)
      }
    })
    
    // Seed products with proper categoryId
    await ProductModel.insertMany(productsWithCategoryId)
    
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
    console.error('Seeding error:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to seed database'
    })
  }
}) 