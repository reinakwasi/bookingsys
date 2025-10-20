import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { generateBreadcrumbStructuredData } from '@/lib/seo'
import SEOStructuredData from './SEOStructuredData'

interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
  showHome?: boolean
  separator?: React.ReactNode
}

export default function Breadcrumb({ 
  items, 
  className = '', 
  showHome = true,
  separator = <ChevronRight className="h-4 w-4 text-gray-400" />
}: BreadcrumbProps) {
  // Prepare items for structured data
  const structuredDataItems = [
    ...(showHome ? [{ name: 'Home', url: 'https://hotel734.com' }] : []),
    ...items
      .filter(item => item.href)
      .map(item => ({
        name: item.label,
        url: `https://hotel734.com${item.href}`
      }))
  ]

  const structuredData = generateBreadcrumbStructuredData(structuredDataItems)

  return (
    <>
      <SEOStructuredData data={structuredData} id="breadcrumb-structured-data" />
      <nav 
        className={`flex items-center space-x-1 text-sm text-gray-600 ${className}`}
        aria-label="Breadcrumb"
      >
        <ol className="flex items-center space-x-1">
          {showHome && (
            <>
              <li>
                <Link 
                  href="/" 
                  className="flex items-center hover:text-amber-600 transition-colors"
                  aria-label="Go to homepage"
                >
                  <Home className="h-4 w-4" />
                  <span className="sr-only">Home</span>
                </Link>
              </li>
              {items.length > 0 && (
                <li className="flex items-center">
                  {separator}
                </li>
              )}
            </>
          )}
          
          {items.map((item, index) => (
            <li key={index} className="flex items-center">
              {item.href && !item.current ? (
                <Link 
                  href={item.href}
                  className="hover:text-amber-600 transition-colors"
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              ) : (
                <span 
                  className={item.current ? 'text-amber-600 font-medium' : 'text-gray-500'}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
              
              {index < items.length - 1 && (
                <span className="ml-1 flex items-center">
                  {separator}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}

// Predefined breadcrumb configurations for common pages
export function RoomsBreadcrumb({ roomName }: { roomName?: string }) {
  const items: BreadcrumbItem[] = [
    { label: 'Rooms', href: '/rooms' }
  ]
  
  if (roomName) {
    items.push({ label: roomName, current: true })
  }
  
  return <Breadcrumb items={items} />
}

export function EventsBreadcrumb({ eventName }: { eventName?: string }) {
  const items: BreadcrumbItem[] = [
    { label: 'Events', href: '/events' }
  ]
  
  if (eventName) {
    items.push({ label: eventName, current: true })
  }
  
  return <Breadcrumb items={items} />
}

export function BookingBreadcrumb() {
  return <Breadcrumb items={[{ label: 'Book Your Stay', current: true }]} />
}

export function ContactBreadcrumb() {
  return <Breadcrumb items={[{ label: 'Contact Us', current: true }]} />
}

export function FacilitiesBreadcrumb() {
  return <Breadcrumb items={[{ label: 'Facilities', current: true }]} />
}

export function GalleryBreadcrumb() {
  return <Breadcrumb items={[{ label: 'Gallery', current: true }]} />
}

export function TicketsBreadcrumb() {
  return <Breadcrumb items={[{ label: 'Event Tickets', current: true }]} />
}

export function ReviewBreadcrumb() {
  return <Breadcrumb items={[{ label: 'Write a Review', current: true }]} />
}
