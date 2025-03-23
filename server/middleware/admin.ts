import { defineEventHandler, createError } from 'h3'
import { verifyAdminToken } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  // Only check admin routes
  const url = event.node.req.url || ''
  if (!url.startsWith('/api/admin')) {
    return
  }

  try {
    // Verify admin token
    const user = await verifyAdminToken(event)
    
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }

    // Add user info to event context
    event.context.auth = {
      userId: user.userId,
      email: user.email,
      role: user.role
    }

  } catch (error) {
    console.error('Admin auth error:', error)
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }
}) 