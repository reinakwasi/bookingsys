import { ReactNode } from 'react'

interface SemanticLayoutProps {
  children: ReactNode
  className?: string
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  breadcrumb?: ReactNode
  className?: string
  children?: ReactNode
}

interface SectionProps {
  children: ReactNode
  className?: string
  id?: string
  'aria-label'?: string
  'aria-labelledby'?: string
}

interface ArticleProps {
  children: ReactNode
  className?: string
  id?: string
  'aria-label'?: string
}

// Main semantic layout wrapper
export function SemanticMain({ children, className = '' }: SemanticLayoutProps) {
  return (
    <main 
      className={`min-h-screen ${className}`}
      role="main"
      id="main-content"
    >
      {children}
    </main>
  )
}

// Page header with proper semantic structure
export function PageHeader({ 
  title, 
  subtitle, 
  breadcrumb, 
  className = '',
  children 
}: PageHeaderProps) {
  return (
    <header className={`page-header ${className}`}>
      {breadcrumb && (
        <nav aria-label="Breadcrumb navigation">
          {breadcrumb}
        </nav>
      )}
      <div className="page-title-section">
        <h1 className="page-title">{title}</h1>
        {subtitle && (
          <p className="page-subtitle">{subtitle}</p>
        )}
      </div>
      {children}
    </header>
  )
}

// Semantic section wrapper
export function SemanticSection({ 
  children, 
  className = '', 
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy
}: SectionProps) {
  return (
    <section 
      className={className}
      id={id}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
    >
      {children}
    </section>
  )
}

// Semantic article wrapper
export function SemanticArticle({ 
  children, 
  className = '', 
  id,
  'aria-label': ariaLabel
}: ArticleProps) {
  return (
    <article 
      className={className}
      id={id}
      aria-label={ariaLabel}
    >
      {children}
    </article>
  )
}

// Aside wrapper for sidebar content
export function SemanticAside({ children, className = '' }: SemanticLayoutProps) {
  return (
    <aside className={className} role="complementary">
      {children}
    </aside>
  )
}

// Navigation wrapper
export function SemanticNav({ children, className = '', 'aria-label': ariaLabel }: SemanticLayoutProps & { 'aria-label'?: string }) {
  return (
    <nav className={className} aria-label={ariaLabel}>
      {children}
    </nav>
  )
}

// Footer wrapper
export function SemanticFooter({ children, className = '' }: SemanticLayoutProps) {
  return (
    <footer className={className} role="contentinfo">
      {children}
    </footer>
  )
}

// Content wrapper with proper heading hierarchy
export function ContentSection({ 
  title, 
  level = 2, 
  children, 
  className = '',
  id
}: {
  title?: string
  level?: 1 | 2 | 3 | 4 | 5 | 6
  children: ReactNode
  className?: string
  id?: string
}) {
  const renderHeading = () => {
    if (!title) return null
    
    const headingId = id ? `${id}-heading` : undefined
    const headingClass = "section-heading"
    
    switch (level) {
      case 1:
        return <h1 id={headingId} className={headingClass}>{title}</h1>
      case 2:
        return <h2 id={headingId} className={headingClass}>{title}</h2>
      case 3:
        return <h3 id={headingId} className={headingClass}>{title}</h3>
      case 4:
        return <h4 id={headingId} className={headingClass}>{title}</h4>
      case 5:
        return <h5 id={headingId} className={headingClass}>{title}</h5>
      case 6:
        return <h6 id={headingId} className={headingClass}>{title}</h6>
      default:
        return <h2 id={headingId} className={headingClass}>{title}</h2>
    }
  }
  
  return (
    <section className={className} id={id} aria-labelledby={id ? `${id}-heading` : undefined}>
      {renderHeading()}
      <div className="section-content">
        {children}
      </div>
    </section>
  )
}

// Skip to main content link for accessibility
export function SkipToMain() {
  return (
    <a 
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-amber-600 text-white px-4 py-2 rounded-md z-50 transition-all"
    >
      Skip to main content
    </a>
  )
}

// Landmark navigation for screen readers
export function LandmarkNav() {
  return (
    <nav aria-label="Page landmarks" className="sr-only">
      <ul>
        <li><a href="#main-content">Main content</a></li>
        <li><a href="#navigation">Navigation</a></li>
        <li><a href="#footer">Footer</a></li>
      </ul>
    </nav>
  )
}
