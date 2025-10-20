import Script from 'next/script'

interface SEOStructuredDataProps {
  data: any
  id?: string
}

export default function SEOStructuredData({ data, id = 'structured-data' }: SEOStructuredDataProps) {
  return (
    <Script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data)
      }}
    />
  )
}

// Specific components for different types of structured data
export function HotelStructuredData({ data }: { data: any }) {
  return <SEOStructuredData data={data} id="hotel-structured-data" />
}

export function EventStructuredData({ data }: { data: any }) {
  return <SEOStructuredData data={data} id="event-structured-data" />
}

export function RoomStructuredData({ data }: { data: any }) {
  return <SEOStructuredData data={data} id="room-structured-data" />
}

export function BreadcrumbStructuredData({ data }: { data: any }) {
  return <SEOStructuredData data={data} id="breadcrumb-structured-data" />
}

export function ReviewStructuredData({ data }: { data: any }) {
  return <SEOStructuredData data={data} id="review-structured-data" />
}
