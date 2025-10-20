import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/rooms/',
          '/rooms/*',
          '/events/',
          '/events/*',
          '/facilities/',
          '/gallery/',
          '/contact/',
          '/booking/',
          '/tickets/',
          '/review/',
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/admin/*',
          '/api/*',
          '/test-qr',
          '/my-tickets/*',
          '/_next/',
          '/private/',
          '/*.json',
          '/manifest.json',
          '/browserconfig.xml',
        ],
        crawlDelay: 1,
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/my-tickets/*',
          '/private/',
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/my-tickets/*',
          '/private/',
        ],
        crawlDelay: 2,
      },
    ],
    sitemap: 'https://hotel734.com/sitemap.xml',
    host: 'https://hotel734.com',
  }
}
