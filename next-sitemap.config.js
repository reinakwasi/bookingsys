/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://hotel734.com',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  // Additional configuration for Hotel 734
  changefreq: 'daily',
  priority: 0.7,
  exclude: [
    '/admin',
    '/admin/*',
    '/api/*',
    '/private/*',
    '/_next/*',
    '/temp/*'
  ],
  // Custom robots.txt configuration
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/private/', '/_next/', '/temp/']
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin', '/api/', '/private/']
      }
    ],
    additionalSitemaps: [
      'https://hotel734.com/sitemap.xml'
    ]
  },
  // Transform function to customize URLs
  transform: async (config, path) => {
    // Custom priority and changefreq for different page types
    const customConfig = {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    }

    // Set custom priorities for different pages
    if (path === '/') {
      customConfig.priority = 1.0
      customConfig.changefreq = 'daily'
    } else if (path.includes('/rooms')) {
      customConfig.priority = 0.9
      customConfig.changefreq = 'weekly'
    } else if (path.includes('/booking')) {
      customConfig.priority = 0.9
      customConfig.changefreq = 'daily'
    } else if (path.includes('/events')) {
      customConfig.priority = 0.8
      customConfig.changefreq = 'weekly'
    } else if (path.includes('/facilities')) {
      customConfig.priority = 0.8
      customConfig.changefreq = 'monthly'
    } else if (path.includes('/tickets')) {
      customConfig.priority = 0.7
      customConfig.changefreq = 'weekly'
    } else if (path.includes('/contact') || path.includes('/about')) {
      customConfig.priority = 0.6
      customConfig.changefreq = 'monthly'
    }

    return customConfig
  }
}
