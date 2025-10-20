// SEO monitoring and validation utilities for Hotel 734

export interface SEOCheckResult {
  passed: boolean
  message: string
  score: number
  recommendations?: string[]
}

export interface PageSEOAnalysis {
  url: string
  title: SEOCheckResult
  description: SEOCheckResult
  headings: SEOCheckResult
  images: SEOCheckResult
  links: SEOCheckResult
  structuredData: SEOCheckResult
  performance: SEOCheckResult
  accessibility: SEOCheckResult
  overallScore: number
}

// SEO validation functions
export class SEOMonitor {
  private static instance: SEOMonitor
  
  static getInstance(): SEOMonitor {
    if (!SEOMonitor.instance) {
      SEOMonitor.instance = new SEOMonitor()
    }
    return SEOMonitor.instance
  }

  // Check title tag optimization
  checkTitle(): SEOCheckResult {
    const title = document.title
    const length = title.length
    
    if (!title) {
      return {
        passed: false,
        message: 'Missing title tag',
        score: 0,
        recommendations: ['Add a descriptive title tag']
      }
    }

    if (length < 30) {
      return {
        passed: false,
        message: 'Title too short',
        score: 30,
        recommendations: ['Title should be 30-60 characters long']
      }
    }

    if (length > 60) {
      return {
        passed: false,
        message: 'Title too long',
        score: 70,
        recommendations: ['Title should be under 60 characters']
      }
    }

    return {
      passed: true,
      message: 'Title length is optimal',
      score: 100
    }
  }

  // Check meta description
  checkDescription(): SEOCheckResult {
    const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content')
    
    if (!metaDesc) {
      return {
        passed: false,
        message: 'Missing meta description',
        score: 0,
        recommendations: ['Add a meta description tag']
      }
    }

    const length = metaDesc.length
    
    if (length < 120) {
      return {
        passed: false,
        message: 'Meta description too short',
        score: 40,
        recommendations: ['Meta description should be 120-160 characters']
      }
    }

    if (length > 160) {
      return {
        passed: false,
        message: 'Meta description too long',
        score: 70,
        recommendations: ['Meta description should be under 160 characters']
      }
    }

    return {
      passed: true,
      message: 'Meta description length is optimal',
      score: 100
    }
  }

  // Check heading structure
  checkHeadings(): SEOCheckResult {
    const h1s = document.querySelectorAll('h1')
    const h2s = document.querySelectorAll('h2')
    const h3s = document.querySelectorAll('h3')
    
    const recommendations: string[] = []
    let score = 100
    
    if (h1s.length === 0) {
      recommendations.push('Add an H1 tag to the page')
      score -= 40
    } else if (h1s.length > 1) {
      recommendations.push('Use only one H1 tag per page')
      score -= 20
    }

    if (h2s.length === 0) {
      recommendations.push('Add H2 tags to structure your content')
      score -= 20
    }

    const passed = recommendations.length === 0
    
    return {
      passed,
      message: passed ? 'Heading structure is good' : 'Heading structure needs improvement',
      score: Math.max(0, score),
      recommendations: recommendations.length > 0 ? recommendations : undefined
    }
  }

  // Check images optimization
  checkImages(): SEOCheckResult {
    const images = document.querySelectorAll('img')
    const imagesWithoutAlt = Array.from(images).filter(img => !img.alt)
    const recommendations: string[] = []
    let score = 100

    if (imagesWithoutAlt.length > 0) {
      recommendations.push(`${imagesWithoutAlt.length} images missing alt text`)
      score -= (imagesWithoutAlt.length / images.length) * 50
    }

    // Check for lazy loading
    const imagesWithoutLazy = Array.from(images).filter(img => 
      !img.loading || img.loading !== 'lazy'
    )
    
    if (imagesWithoutLazy.length > 0) {
      recommendations.push('Consider adding lazy loading to images')
      score -= 10
    }

    const passed = recommendations.length === 0
    
    return {
      passed,
      message: passed ? 'Images are well optimized' : 'Images need optimization',
      score: Math.max(0, score),
      recommendations: recommendations.length > 0 ? recommendations : undefined
    }
  }

  // Check internal links
  checkLinks(): SEOCheckResult {
    const links = document.querySelectorAll('a[href]')
    const internalLinks = Array.from(links).filter(link => {
      const href = link.getAttribute('href')
      return href && (href.startsWith('/') || href.includes(window.location.hostname))
    })
    
    const externalLinks = Array.from(links).filter(link => {
      const href = link.getAttribute('href')
      return href && href.startsWith('http') && !href.includes(window.location.hostname)
    })

    const recommendations: string[] = []
    let score = 100

    if (internalLinks.length < 3) {
      recommendations.push('Add more internal links to improve site navigation')
      score -= 20
    }

    // Check for external links without proper attributes
    const externalLinksWithoutRel = externalLinks.filter(link => 
      !link.getAttribute('rel')?.includes('noopener')
    )

    if (externalLinksWithoutRel.length > 0) {
      recommendations.push('Add rel="noopener" to external links')
      score -= 10
    }

    const passed = recommendations.length === 0
    
    return {
      passed,
      message: passed ? 'Link structure is good' : 'Link structure needs improvement',
      score: Math.max(0, score),
      recommendations: recommendations.length > 0 ? recommendations : undefined
    }
  }

  // Check structured data
  checkStructuredData(): SEOCheckResult {
    const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]')
    const recommendations: string[] = []
    let score = 100

    if (jsonLdScripts.length === 0) {
      recommendations.push('Add structured data (JSON-LD) to improve search visibility')
      score = 0
    } else {
      // Validate JSON-LD syntax
      let validJsonLd = 0
      jsonLdScripts.forEach(script => {
        try {
          JSON.parse(script.textContent || '')
          validJsonLd++
        } catch (e) {
          recommendations.push('Fix invalid JSON-LD syntax')
          score -= 20
        }
      })

      if (validJsonLd === 0) {
        score = 20
      }
    }

    const passed = recommendations.length === 0 && jsonLdScripts.length > 0
    
    return {
      passed,
      message: passed ? 'Structured data is present and valid' : 'Structured data needs attention',
      score: Math.max(0, score),
      recommendations: recommendations.length > 0 ? recommendations : undefined
    }
  }

  // Check basic accessibility
  checkAccessibility(): SEOCheckResult {
    const recommendations: string[] = []
    let score = 100

    // Check for skip links
    const skipLink = document.querySelector('a[href="#main-content"]')
    if (!skipLink) {
      recommendations.push('Add skip navigation link for accessibility')
      score -= 15
    }

    // Check for proper landmark roles
    const main = document.querySelector('main')
    if (!main) {
      recommendations.push('Add main landmark element')
      score -= 15
    }

    // Check for proper heading hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    let previousLevel = 0
    let hierarchyIssues = false

    headings.forEach(heading => {
      const level = parseInt(heading.tagName.charAt(1))
      if (level > previousLevel + 1) {
        hierarchyIssues = true
      }
      previousLevel = level
    })

    if (hierarchyIssues) {
      recommendations.push('Fix heading hierarchy (don\'t skip heading levels)')
      score -= 20
    }

    const passed = recommendations.length === 0
    
    return {
      passed,
      message: passed ? 'Basic accessibility checks passed' : 'Accessibility needs improvement',
      score: Math.max(0, score),
      recommendations: recommendations.length > 0 ? recommendations : undefined
    }
  }

  // Check page performance
  async checkPerformance(): Promise<SEOCheckResult> {
    if (typeof window === 'undefined' || !('performance' in window)) {
      return {
        passed: false,
        message: 'Performance API not available',
        score: 0
      }
    }

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const loadTime = navigation.loadEventEnd - navigation.loadEventStart
    
    const recommendations: string[] = []
    let score = 100

    if (loadTime > 3000) {
      recommendations.push('Page load time is too slow (>3s)')
      score -= 40
    } else if (loadTime > 2000) {
      recommendations.push('Page load time could be improved (>2s)')
      score -= 20
    }

    // Check for render-blocking resources
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]')
    if (stylesheets.length > 3) {
      recommendations.push('Consider combining CSS files to reduce requests')
      score -= 10
    }

    const passed = recommendations.length === 0
    
    return {
      passed,
      message: passed ? 'Performance is good' : 'Performance needs optimization',
      score: Math.max(0, score),
      recommendations: recommendations.length > 0 ? recommendations : undefined
    }
  }

  // Run complete SEO analysis
  async analyzeCurrentPage(): Promise<PageSEOAnalysis> {
    const checks = {
      title: this.checkTitle(),
      description: this.checkDescription(),
      headings: this.checkHeadings(),
      images: this.checkImages(),
      links: this.checkLinks(),
      structuredData: this.checkStructuredData(),
      accessibility: this.checkAccessibility(),
      performance: await this.checkPerformance()
    }

    const overallScore = Object.values(checks).reduce((sum, check) => sum + check.score, 0) / Object.keys(checks).length

    return {
      url: window.location.href,
      ...checks,
      overallScore: Math.round(overallScore)
    }
  }

  // Generate SEO report
  generateReport(analysis: PageSEOAnalysis): string {
    let report = `SEO Analysis Report for ${analysis.url}\n`
    report += `Overall Score: ${analysis.overallScore}/100\n\n`

    Object.entries(analysis).forEach(([key, value]) => {
      if (key !== 'url' && key !== 'overallScore' && typeof value === 'object') {
        const check = value as SEOCheckResult
        report += `${key.toUpperCase()}: ${check.score}/100 - ${check.message}\n`
        if (check.recommendations) {
          check.recommendations.forEach(rec => {
            report += `  • ${rec}\n`
          })
        }
        report += '\n'
      }
    })

    return report
  }
}

// Utility function to run SEO check on page load (development only)
export const runSEOCheck = async () => {
  if (process.env.NODE_ENV !== 'development') return

  const monitor = SEOMonitor.getInstance()
  const analysis = await monitor.analyzeCurrentPage()
  
  console.group('🔍 SEO Analysis')
  console.log(`Overall Score: ${analysis.overallScore}/100`)
  
  Object.entries(analysis).forEach(([key, value]) => {
    if (key !== 'url' && key !== 'overallScore' && typeof value === 'object') {
      const check = value as SEOCheckResult
      const emoji = check.passed ? '✅' : '❌'
      console.log(`${emoji} ${key}: ${check.score}/100 - ${check.message}`)
      
      if (check.recommendations) {
        check.recommendations.forEach(rec => {
          console.log(`   💡 ${rec}`)
        })
      }
    }
  })
  
  console.groupEnd()
  
  return analysis
}

// Export for use in components
export default SEOMonitor
