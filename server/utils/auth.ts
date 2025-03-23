import { H3Event, createError } from 'h3'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { UserModel } from '../models/User'

// Interface for token payload
interface TokenPayload {
  userId: string
  email: string
  role: string
}

// Generate JWT token
export const generateToken = (payload: TokenPayload, expiresIn = '7d') => {
  const secret = useRuntimeConfig().jwtSecret
  
  if (!secret) {
    throw new Error('JWT secret is not configured')
  }
  
  // @ts-ignore - Suppressing the type error for now to make it work
  return jwt.sign(payload, secret, { expiresIn })
}

// Verify JWT token
export const verifyToken = async (token: string): Promise<TokenPayload | null> => {
  const secret = useRuntimeConfig().jwtSecret
  
  if (!secret) {
    throw new Error('JWT secret is not configured')
  }
  
  try {
    // @ts-ignore - Suppressing the type error for now to make it work
    const decoded = jwt.verify(token, secret) as TokenPayload
    return decoded
  } catch (error) {
    return null
  }
}

// Get token from the request
export const getTokenFromRequest = (event: H3Event): string | null => {
  // First try Authorization header
  const authHeader = getRequestHeader(event, 'Authorization')
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1] || null
  }
  
  // If no Authorization header, try cookies
  const cookies = parseCookies(event)
  const tokenFromCookie = cookies.auth_token
  
  if (tokenFromCookie) {
    return tokenFromCookie
  }
  
  return null
}

// Verify admin token middleware
export const verifyAdminToken = async (event: H3Event) => {
  const token = getTokenFromRequest(event)
  
  if (!token) {
    return null
  }
  
  const payload = await verifyToken(token)
  
  if (!payload || payload.role !== 'admin') {
    return null
  }
  
  return payload
}

// Verify user token (for any authenticated user)
export const verifyUserToken = async (event: H3Event) => {
  const token = getTokenFromRequest(event)
  
  if (!token) {
    return null
  }
  
  return await verifyToken(token)
}

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

// Compare password
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash)
} 