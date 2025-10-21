import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ['hotel734.com', 'www.hotel734.com'], // Allow hotel domain images
    dangerouslyAllowSVG: false, // Prevent SVG XSS
    formats: ['image/webp', 'image/avif'], // Modern image formats for better performance
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days cache
  },
  outputFileTracingRoot: __dirname,
  experimental: {
    optimizePackageImports: ['@/lib', '@/components', '@/hooks'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Enable compression for better performance
  compress: true,
  // Generate sitemap and robots.txt
  trailingSlash: false,
  // SEO optimizations
  generateEtags: true,
  poweredByHeader: false, // Remove X-Powered-By header for security
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-src 'self' https://www.google.com https://maps.google.com https://www.openstreetmap.org; script-src 'self' 'unsafe-inline' 'unsafe-eval'; object-src 'none';",
          },
        ],
      },
    ]
  },
  // Redirect HTTP to HTTPS in production
  async redirects() {
    return process.env.NODE_ENV === 'production' ? [
      {
        source: '/:path*',
        has: [
          {
            type: 'header',
            key: 'x-forwarded-proto',
            value: 'http',
          },
        ],
        destination: 'https://hotel734.com/:path*',
        permanent: true,
      },
    ] : []
  },
}

export default nextConfig
