import Head from 'next/head'

interface StructuredDataProps {
  type?: 'hotel' | 'event' | 'room' | 'restaurant'
  data?: any
}

export default function StructuredData({ type = 'hotel', data }: StructuredDataProps) {
  const getStructuredData = () => {
    switch (type) {
      case 'hotel':
        return {
          "@context": "https://schema.org",
          "@type": "Hotel",
          "name": "Hotel 734",
          "description": "Luxury accommodation in New Edubiase, Ghana. Premium rooms, world-class amenities, event spaces, and exceptional service.",
          "url": "https://hotel734.com",
          "telephone": "+233-XX-XXX-XXXX",
          "email": "info@hotel734.com",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Main Street",
            "addressLocality": "New Edubiase",
            "addressRegion": "Ashanti Region",
            "postalCode": "00233",
            "addressCountry": "GH"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "6.2000",
            "longitude": "-1.6000"
          },
          "image": [
            "https://hotel734.com/images/hotel-734-exterior.jpg",
            "https://hotel734.com/images/hotel-734-lobby.jpg",
            "https://hotel734.com/images/hotel-734-rooms.jpg"
          ],
          "priceRange": "$$-$$$",
          "starRating": {
            "@type": "Rating",
            "ratingValue": "4.8",
            "bestRating": "5"
          },
          "amenityFeature": [
            {
              "@type": "LocationFeatureSpecification",
              "name": "Free WiFi",
              "value": true
            },
            {
              "@type": "LocationFeatureSpecification",
              "name": "Swimming Pool",
              "value": true
            },
            {
              "@type": "LocationFeatureSpecification",
              "name": "Fitness Center",
              "value": true
            },
            {
              "@type": "LocationFeatureSpecification",
              "name": "Restaurant",
              "value": true
            },
            {
              "@type": "LocationFeatureSpecification",
              "name": "Conference Facilities",
              "value": true
            },
            {
              "@type": "LocationFeatureSpecification",
              "name": "Parking",
              "value": true
            },
            {
              "@type": "LocationFeatureSpecification",
              "name": "Air Conditioning",
              "value": true
            },
            {
              "@type": "LocationFeatureSpecification",
              "name": "Room Service",
              "value": true
            }
          ],
          "checkinTime": "15:00",
          "checkoutTime": "12:00",
          "numberOfRooms": "15",
          "petsAllowed": false,
          "smokingAllowed": false,
          "openingHours": "Mo-Su 00:00-24:00",
          "sameAs": [
            "https://www.facebook.com/Hotel734Ghana",
            "https://www.instagram.com/hotel734ghana",
            "https://www.twitter.com/Hotel734Ghana"
          ],
          "hasMap": "https://maps.google.com/?q=Hotel+734+New+Edubiase+Ghana",
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "127",
            "bestRating": "5",
            "worstRating": "1"
          },
          "review": [
            {
              "@type": "Review",
              "author": {
                "@type": "Person",
                "name": "Sarah Johnson"
              },
              "reviewRating": {
                "@type": "Rating",
                "ratingValue": "5",
                "bestRating": "5"
              },
              "reviewBody": "Exceptional service and beautiful facilities. The Royal Suite was absolutely stunning and the staff went above and beyond."
            },
            {
              "@type": "Review",
              "author": {
                "@type": "Person",
                "name": "Michael Asante"
              },
              "reviewRating": {
                "@type": "Rating",
                "ratingValue": "5",
                "bestRating": "5"
              },
              "reviewBody": "Perfect venue for our corporate event. Professional staff, excellent facilities, and great location in New Edubiase."
            }
          ],
          "makesOffer": [
            {
              "@type": "Offer",
              "name": "Royal Suite",
              "description": "Luxury suite with premium amenities",
              "priceCurrency": "GHS",
              "price": "350",
              "priceValidUntil": "2025-12-31",
              "availability": "https://schema.org/InStock"
            },
            {
              "@type": "Offer",
              "name": "Superior Room",
              "description": "Comfortable room with modern amenities",
              "priceCurrency": "GHS",
              "price": "300",
              "priceValidUntil": "2025-12-31",
              "availability": "https://schema.org/InStock"
            },
            {
              "@type": "Offer",
              "name": "Classic Room",
              "description": "Cozy room with essential amenities",
              "priceCurrency": "GHS",
              "price": "250",
              "priceValidUntil": "2025-12-31",
              "availability": "https://schema.org/InStock"
            }
          ]
        }

      case 'event':
        return {
          "@context": "https://schema.org",
          "@type": "Event",
          "name": data?.name || "Hotel 734 Events",
          "description": data?.description || "Premium events and experiences at Hotel 734",
          "startDate": data?.startDate || new Date().toISOString(),
          "endDate": data?.endDate || new Date().toISOString(),
          "location": {
            "@type": "Place",
            "name": "Hotel 734",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Main Street",
              "addressLocality": "New Edubiase",
              "addressRegion": "Ashanti Region",
              "addressCountry": "GH"
            }
          },
          "organizer": {
            "@type": "Organization",
            "name": "Hotel 734",
            "url": "https://hotel734.com"
          },
          "offers": {
            "@type": "Offer",
            "price": data?.price || "0",
            "priceCurrency": "GHS",
            "availability": "https://schema.org/InStock",
            "url": "https://hotel734.com/tickets"
          }
        }

      case 'room':
        return {
          "@context": "https://schema.org",
          "@type": "HotelRoom",
          "name": data?.name || "Hotel Room",
          "description": data?.description || "Comfortable hotel room with modern amenities",
          "occupancy": {
            "@type": "QuantitativeValue",
            "maxValue": data?.maxOccupancy || 2
          },
          "bed": {
            "@type": "BedDetails",
            "numberOfBeds": data?.numberOfBeds || 1,
            "typeOfBed": data?.bedType || "King"
          },
          "amenityFeature": data?.amenities || [
            {
              "@type": "LocationFeatureSpecification",
              "name": "Free WiFi",
              "value": true
            },
            {
              "@type": "LocationFeatureSpecification",
              "name": "Air Conditioning",
              "value": true
            }
          ],
          "floorSize": {
            "@type": "QuantitativeValue",
            "value": data?.floorSize || 35,
            "unitCode": "MTK"
          }
        }

      case 'restaurant':
        return {
          "@context": "https://schema.org",
          "@type": "Restaurant",
          "name": "Hotel 734 Restaurant",
          "description": "Fine dining restaurant at Hotel 734 serving local and international cuisine",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Main Street",
            "addressLocality": "New Edubiase",
            "addressRegion": "Ashanti Region",
            "addressCountry": "GH"
          },
          "telephone": "+233-XX-XXX-XXXX",
          "servesCuisine": ["Ghanaian", "International", "Continental"],
          "priceRange": "$$",
          "openingHours": [
            "Mo-Su 06:00-23:00"
          ],
          "hasMenu": "https://hotel734.com/restaurant/menu"
        }

      default:
        return null
    }
  }

  const structuredData = getStructuredData()

  if (!structuredData) return null

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
    </Head>
  )
}

// Breadcrumb structured data component
export function BreadcrumbStructuredData({ items }: { items: Array<{ name: string; url: string }> }) {
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url.startsWith('http') ? item.url : `https://hotel734.com${item.url}`
    }))
  }

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbData)
        }}
      />
    </Head>
  )
}
