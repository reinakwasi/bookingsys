import { NextRequest } from 'next/server'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// In-memory store (use Redis in production for multiple instances)
const store: RateLimitStore = {}

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  message?: string // Custom error message
}

export function rateLimit(config: RateLimitConfig) {
  return async (request: NextRequest) => {
    const ip = getClientIP(request)
    const key = `${ip}:${request.nextUrl.pathname}`
    const now = Date.now()
    
    // Clean up expired entries
    Object.keys(store).forEach(k => {
      if (store[k].resetTime < now) {
        delete store[k]
      }
    })
    
    // Get or create rate limit entry
    if (!store[key]) {
      store[key] = {
        count: 0,
        resetTime: now + config.windowMs
      }
    }
    
    const entry = store[key]
    
    // Reset if window expired
    if (entry.resetTime < now) {
      entry.count = 0
      entry.resetTime = now + config.windowMs
    }
    
    // Increment counter
    entry.count++
    
    // Check if limit exceeded
    if (entry.count > config.maxRequests) {
      return {
        success: false,
        error: config.message || 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((entry.resetTime - now) / 1000)
      }
    }
    
    return {
      success: true,
      remaining: config.maxRequests - entry.count,
      resetTime: entry.resetTime
    }
  }
}

function getClientIP(request: NextRequest): string {
  // Try to get real IP from headers (for proxies/CDNs)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (cfConnectingIP) return cfConnectingIP
  if (realIP) return realIP
  if (forwarded) return forwarded.split(',')[0].trim()
  
  // Fallback to connection IP (may not be available in all environments)
  return 'unknown'
}

// Predefined rate limit configurations
export const rateLimitConfigs = {
  // Strict limits for authentication
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    message: 'Too many login attempts. Please try again in 15 minutes.'
  },
  
  // Moderate limits for API endpoints
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
    message: 'API rate limit exceeded. Please slow down.'
  },
  
  // Lenient limits for general pages
  general: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
    message: 'Too many requests. Please slow down.'
  },
  
  // Strict limits for contact/booking forms
  forms: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5, // 5 submissions per minute
    message: 'Too many form submissions. Please wait before trying again.'
  }
}
