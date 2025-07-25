import { ProductModel } from '../models/Product'
import { CategoryModel } from '../models/Category'
import { BannerModel } from '../models/Banner'
import { UserModel } from '../models/User'
import { hashPassword } from './auth'

// Sample data for categories
const categories = [

  {
    name: 'Bedroom',
    slug: 'bedroom',
    description: 'Furniture for your bedroom',
    image: '/images/categories/bedroom.jpg'
  },
  {
    name: 'Dining Room',
    slug: 'dining-room',
    description: 'Furniture for your dining room',
    image: '/images/categories/dining-room.jpg'
  },
  {
    name: 'Office',
    slug: 'office',
    description: 'Furniture for your home office',
    image: '/images/categories/office.jpg'
  },
  {
    name: 'Outdoor',
    slug: 'outdoor',
    description: 'Furniture for your outdoor space',
    image: '/images/categories/outdoor.jpg'
  }
]

// Function to create some sample products for each category
const createProductsForCategory = (categoryId: string, categorySlug: string) => {
  const products = []
  
  // Living Room products
  if (categorySlug === 'living-room') {
    products.push(
      {
        name: 'Modern Sofa',
        slug: 'modern-sofa',
        description: 'A comfortable modern sofa for your living room.',
        price: 899.99,
        salePrice: 799.99,
        images: ['/images/products/modern-sofa-1.jpg', '/images/products/modern-sofa-2.jpg'],
        inStock: true,
        featured: true,
        categoryId
      },
      {
        name: 'Coffee Table',
        slug: 'coffee-table',
        description: 'Elegant coffee table with storage space.',
        price: 299.99,
        salePrice: null,
        images: ['/images/products/coffee-table-1.jpg'],
        inStock: true,
        featured: false,
        categoryId
      },
      {
        name: 'Floor Lamp',
        slug: 'floor-lamp',
        description: 'Modern floor lamp for ambient lighting.',
        price: 149.99,
        salePrice: 129.99,
        images: ['/images/products/floor-lamp-1.jpg'],
        inStock: true,
        featured: false,
        categoryId
      }
    )
  }
  
  // Bedroom products
  if (categorySlug === 'bedroom') {
    products.push(
      {
        name: 'Queen Bed Frame',
        slug: 'queen-bed-frame',
        description: 'Sturdy queen-sized bed frame with headboard.',
        price: 599.99,
        salePrice: null,
        images: ['/images/products/queen-bed-1.jpg', '/images/products/queen-bed-2.jpg'],
        inStock: true,
        featured: true,
        categoryId
      },
      {
        name: 'Nightstand',
        slug: 'nightstand',
        description: 'Compact nightstand with drawer.',
        price: 149.99,
        salePrice: 129.99,
        images: ['/images/products/nightstand-1.jpg'],
        inStock: true,
        featured: false,
        categoryId
      },
      {
        name: 'Dresser',
        slug: 'dresser',
        description: 'Six-drawer dresser for your bedroom.',
        price: 449.99,
        salePrice: null,
        images: ['/images/products/dresser-1.jpg'],
        inStock: true,
        featured: false,
        categoryId
      }
    )
  }
  
  // Dining Room products
  if (categorySlug === 'dining-room') {
    products.push(
      {
        name: 'Dining Table',
        slug: 'dining-table',
        description: 'Elegant dining table for 6 people.',
        price: 799.99,
        salePrice: 699.99,
        images: ['/images/products/dining-table-1.jpg'],
        inStock: true,
        featured: true,
        categoryId
      },
      {
        name: 'Dining Chair',
        slug: 'dining-chair',
        description: 'Comfortable dining chair with fabric upholstery.',
        price: 129.99,
        salePrice: null,
        images: ['/images/products/dining-chair-1.jpg'],
        inStock: true,
        featured: false,
        categoryId
      },
      {
        name: 'Sideboard',
        slug: 'sideboard',
        description: 'Spacious sideboard for your dining room storage.',
        price: 549.99,
        salePrice: 499.99,
        images: ['/images/products/sideboard-1.jpg'],
        inStock: true,
        featured: false,
        categoryId
      }
    )
  }
  
  // Office products
  if (categorySlug === 'office') {
    products.push(
      {
        name: 'Office Desk',
        slug: 'office-desk',
        description: 'Spacious desk for your home office.',
        price: 349.99,
        salePrice: null,
        images: ['/images/products/office-desk-1.jpg'],
        inStock: true,
        featured: true,
        categoryId
      },
      {
        name: 'Office Chair',
        slug: 'office-chair',
        description: 'Ergonomic office chair for comfort during long work hours.',
        price: 249.99,
        salePrice: 199.99,
        images: ['/images/products/office-chair-1.jpg'],
        inStock: true,
        featured: false,
        categoryId
      },
      {
        name: 'Bookshelf',
        slug: 'bookshelf',
        description: 'Modern bookshelf for your books and decorations.',
        price: 199.99,
        salePrice: null,
        images: ['/images/products/bookshelf-1.jpg'],
        inStock: true,
        featured: false,
        categoryId
      }
    )
  }
  
  // Outdoor products
  if (categorySlug === 'outdoor') {
    products.push(
      {
        name: 'Patio Set',
        slug: 'patio-set',
        description: 'Complete patio set for your outdoor space.',
        price: 1299.99,
        salePrice: 999.99,
        images: ['/images/products/patio-set-1.jpg'],
        inStock: true,
        featured: true,
        categoryId
      },
      {
        name: 'Outdoor Chair',
        slug: 'outdoor-chair',
        description: 'Weather-resistant outdoor chair.',
        price: 149.99,
        salePrice: null,
        images: ['/images/products/outdoor-chair-1.jpg'],
        inStock: true,
        featured: false,
        categoryId
      },
      {
        name: 'Garden Bench',
        slug: 'garden-bench',
        description: 'Elegant garden bench for your outdoor space.',
        price: 249.99,
        salePrice: 229.99,
        images: ['/images/products/garden-bench-1.jpg'],
        inStock: true,
        featured: false,
        categoryId
      }
    )
  }
  
  return products
}

// Sample data for banners
const banners = [
  {
    title: 'Summer Collection',
    subtitle: 'Discover our new summer furniture collection',
    image: '/images/banners/summer-collection.jpg',
    link: '/categories/outdoor',
    active: true,
    order: 0
  },
  {
    title: 'Winter Sale',
    subtitle: 'Up to 40% off on selected items',
    image: '/images/banners/winter-sale.jpg',
    link: '/sale',
    active: true,
    order: 1
  },
  {
    title: 'Office Furniture',
    subtitle: 'Create your perfect workspace',
    image: '/images/banners/office-furniture.jpg',
    link: '/categories/office',
    active: true,
    order: 2
  }
]

// Seed the database with initial data
export const seedDatabase = async () => {
  try {
    // Check if database already has data
    const existingCategories = await CategoryModel.countDocuments()
    const existingProducts = await ProductModel.countDocuments()
    const existingBanners = await BannerModel.countDocuments()
    const existingAdmins = await UserModel.countDocuments({ role: 'ADMIN' })
    
    console.log('Current database state:')
    console.log(`- Categories: ${existingCategories}`)
    console.log(`- Products: ${existingProducts}`)
    console.log(`- Banners: ${existingBanners}`)
    console.log(`- Admin users: ${existingAdmins}`)
    
    // If data already exists, ask for confirmation before continuing
    // (This check will be handled by the API endpoint or command line interface)
    
    // Step 1: Create categories
    console.log('Seeding categories...')
    const createdCategories = await CategoryModel.insertMany(categories)
    console.log(`${createdCategories.length} categories created`)
    
    // Step 2: Create products for each category
    console.log('Seeding products...')
    let allProducts: any[] = []
    
    for (const category of createdCategories) {
      const products = createProductsForCategory(category.id, category.slug)
      allProducts = [...allProducts, ...products]
    }
    
    const createdProducts = await ProductModel.insertMany(allProducts)
    console.log(`${createdProducts.length} products created`)
    
    // Step 3: Create banners
    console.log('Seeding banners...')
    const createdBanners = await BannerModel.insertMany(banners)
    console.log(`${createdBanners.length} banners created`)
    
    // Step 4: Create admin user if none exists
    if (existingAdmins === 0) {
      console.log('Creating admin user...')
      const hashedPassword = await hashPassword('admin123')
      
      await UserModel.create({
        email: 'admin@example.com',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN'
      })
      
      console.log('Admin user created:')
      console.log('- Email: admin@example.com')
      console.log('- Password: admin123')
    }
    
    console.log('Database seeding completed successfully')
    
    return {
      success: true,
      categories: createdCategories.length,
      products: createdProducts.length,
      banners: createdBanners.length,
      adminCreated: existingAdmins === 0
    }
  } catch (error: any) {
    console.error('Error seeding database:', error)
    throw new Error(`Seeding failed: ${error.message}`)
  }
}

// Function to clear all data from the database
export const clearDatabase = async () => {
  try {
    await ProductModel.deleteMany({})
    await CategoryModel.deleteMany({})
    await BannerModel.deleteMany({})
    // Don't delete users by default
    
    console.log('Database cleared successfully')
    
    return {
      success: true
    }
  } catch (error: any) {
    console.error('Error clearing database:', error)
    throw new Error(`Clearing failed: ${error.message}`)
  }
} 