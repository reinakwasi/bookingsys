import Head from 'next/head'

interface SEOMetadataProps {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'business.hotel'
  noIndex?: boolean
}

export default function SEOMetadata({
  title = "Hotel 734 | Luxury Accommodation in New Edubiase, Ghana",
  description = "Experience luxury at Hotel 734 in New Edubiase. Premium rooms, world-class amenities, event spaces, and exceptional service. Book your stay today for an unforgettable experience.",
  keywords = "Hotel 734, New Edubiase hotel, luxury accommodation Ghana, premium hotel rooms, event venue, conference facilities, hotel booking, Ghana hospitality",
  image = "/images/hotel-734-exterior.jpg",
  url = "https://hotel734.com",
  type = "business.hotel",
  noIndex = false
}: SEOMetadataProps) {
  const fullTitle = title.includes('Hotel 734') ? title : `${title} | Hotel 734`
  const fullUrl = url.startsWith('http') ? url : `https://hotel734.com${url}`

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Hotel 734" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow"} />
      <meta name="googlebot" content={noIndex ? "noindex, nofollow" : "index, follow"} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image.startsWith('http') ? image : `https://hotel734.com${image}`} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="Hotel 734" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image.startsWith('http') ? image : `https://hotel734.com${image}`} />
      <meta name="twitter:site" content="@Hotel734Ghana" />
      <meta name="twitter:creator" content="@Hotel734Ghana" />
      
      {/* Additional Meta Tags for Hotels */}
      <meta property="business:contact_data:street_address" content="Main Street, New Edubiase" />
      <meta property="business:contact_data:locality" content="New Edubiase" />
      <meta property="business:contact_data:region" content="Ashanti Region" />
      <meta property="business:contact_data:postal_code" content="00233" />
      <meta property="business:contact_data:country_name" content="Ghana" />
      <meta property="business:contact_data:phone_number" content="+233-XX-XXX-XXXX" />
      <meta property="business:contact_data:website" content="https://hotel734.com" />
      
      {/* Favicon and App Icons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />
      
      {/* Additional SEO Meta Tags */}
      <meta name="theme-color" content="#1a233b" />
      <meta name="msapplication-TileColor" content="#1a233b" />
      <meta name="application-name" content="Hotel 734" />
      <meta name="apple-mobile-web-app-title" content="Hotel 734" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      
      {/* Preconnect to External Domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* DNS Prefetch for Performance */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
    </Head>
  )
}

// Pre-defined SEO configurations for different pages
export const seoConfigs = {
  home: {
    title: "Hotel 734 | Luxury Accommodation in New Edubiase, Ghana",
    description: "Experience luxury at Hotel 734 in New Edubiase. Premium rooms, world-class amenities, event spaces, and exceptional service. Book your stay today.",
    keywords: "Hotel 734, New Edubiase hotel, luxury accommodation Ghana, premium hotel rooms, event venue, hotel booking",
    url: "/"
  },
  rooms: {
    title: "Luxury Hotel Rooms & Suites | Hotel 734 New Edubiase",
    description: "Discover our elegant rooms and suites at Hotel 734. Royal Suites, Superior Rooms, and Classic Rooms with modern amenities and exceptional comfort.",
    keywords: "hotel rooms New Edubiase, luxury suites Ghana, Royal Suite, Superior Room, Classic Room, hotel accommodation",
    url: "/rooms"
  },
  events: {
    title: "Event Venues & Conference Facilities | Hotel 734",
    description: "Host your events at Hotel 734's premium venues. Conference rooms, wedding venues, corporate events, and special occasions in New Edubiase.",
    keywords: "event venue New Edubiase, conference facilities Ghana, wedding venue, corporate events, Hotel 734 events",
    url: "/events"
  },
  booking: {
    title: "Book Your Stay | Hotel 734 New Edubiase",
    description: "Book your luxury stay at Hotel 734. Easy online booking, competitive rates, and exceptional service in New Edubiase, Ghana.",
    keywords: "book hotel New Edubiase, hotel reservation Ghana, Hotel 734 booking, luxury hotel booking",
    url: "/booking"
  },
  tickets: {
    title: "Event Tickets & Experiences | Hotel 734",
    description: "Purchase tickets for exclusive events and experiences at Hotel 734. Premium entertainment, dining experiences, and special events.",
    keywords: "Hotel 734 tickets, event tickets New Edubiase, hotel experiences, premium events Ghana",
    url: "/tickets"
  },
  facilities: {
    title: "Hotel Facilities & Amenities | Hotel 734 New Edubiase",
    description: "Explore world-class facilities at Hotel 734. Swimming pool, fitness center, spa, restaurant, conference rooms, and luxury amenities.",
    keywords: "hotel facilities New Edubiase, hotel amenities Ghana, swimming pool, spa, fitness center, Hotel 734 facilities",
    url: "/facilities"
  },
  contact: {
    title: "Contact Hotel 734 | New Edubiase Luxury Hotel",
    description: "Contact Hotel 734 for reservations, inquiries, and information. Located in New Edubiase, Ghana. Phone, email, and location details.",
    keywords: "contact Hotel 734, New Edubiase hotel contact, hotel phone number, hotel address Ghana",
    url: "/contact"
  },
  about: {
    title: "About Hotel 734 | Luxury Hospitality in New Edubiase",
    description: "Learn about Hotel 734's commitment to luxury hospitality in New Edubiase. Our story, values, and dedication to exceptional guest experiences.",
    keywords: "about Hotel 734, New Edubiase hotel history, luxury hospitality Ghana, hotel story",
    url: "/about"
  }
}
