// SEO utility functions for Hotel 734

export interface HotelStructuredData {
  "@context": string;
  "@type": string;
  name: string;
  description: string;
  url: string;
  logo: string;
  image: string;
  telephone: string;
  email: string;
  address: {
    "@type": string;
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  geo: {
    "@type": string;
    latitude: string;
    longitude: string;
  };
  priceRange: string;
  starRating: {
    "@type": string;
    ratingValue: string;
    bestRating: string;
  };
  amenityFeature: Array<{
    "@type": string;
    name: string;
    value: boolean;
  }>;
  hasMap: string;
  sameAs: string[];
}

export interface EventStructuredData {
  "@context": string;
  "@type": string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: {
    "@type": string;
    name: string;
    address: {
      "@type": string;
      streetAddress: string;
      addressLocality: string;
      addressRegion: string;
      postalCode: string;
      addressCountry: string;
    };
  };
  organizer: {
    "@type": string;
    name: string;
    url: string;
  };
  offers?: {
    "@type": string;
    price: number;
    priceCurrency: string;
    availability: string;
    url: string;
  };
}

export interface RoomStructuredData {
  "@context": string;
  "@type": string;
  name: string;
  description: string;
  image: string;
  url: string;
  offers: {
    "@type": string;
    price: number;
    priceCurrency: string;
    availability: string;
  };
  amenityFeature: Array<{
    "@type": string;
    name: string;
    value: boolean;
  }>;
  partOf: {
    "@type": string;
    name: string;
    url: string;
  };
}

export function generateHotelStructuredData(): HotelStructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "Hotel",
    "name": "Hotel 734",
    "description": "Experience unparalleled luxury at Hotel 734. Premium accommodations, world-class facilities, elegant event spaces, and exceptional service.",
    "url": "https://hotel734.com",
    "logo": "https://hotel734.com/logo.png",
    "image": "https://hotel734.com/og-image.jpg",
    "telephone": "+1-234-567-8900",
    "email": "info@hotel734.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "734 Luxury Boulevard",
      "addressLocality": "Premium District",
      "addressRegion": "State",
      "postalCode": "12345",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "40.7128",
      "longitude": "-74.0060"
    },
    "priceRange": "$150-$500",
    "starRating": {
      "@type": "Rating",
      "ratingValue": "5",
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
        "name": "Event Spaces",
        "value": true
      }
    ],
    "hasMap": "https://maps.google.com/?q=Hotel+734",
    "sameAs": [
      "https://www.facebook.com/hotel734",
      "https://www.instagram.com/hotel734",
      "https://www.twitter.com/hotel734",
      "https://www.linkedin.com/company/hotel734"
    ]
  };
}

export function generateEventStructuredData(event: {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  price?: number;
}): EventStructuredData {
  const baseData: EventStructuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": event.name,
    "description": event.description,
    "startDate": event.startDate,
    "endDate": event.endDate,
    "location": {
      "@type": "Place",
      "name": "Hotel 734",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "734 Luxury Boulevard",
        "addressLocality": "Premium District",
        "addressRegion": "State",
        "postalCode": "12345",
        "addressCountry": "US"
      }
    },
    "organizer": {
      "@type": "Organization",
      "name": "Hotel 734",
      "url": "https://hotel734.com"
    }
  };

  if (event.price) {
    baseData.offers = {
      "@type": "Offer",
      "price": event.price,
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "url": "https://hotel734.com/events"
    };
  }

  return baseData;
}

export function generateRoomStructuredData(room: {
  name: string;
  description: string;
  price: number;
  image: string;
  roomId: string;
}): RoomStructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "HotelRoom",
    "name": room.name,
    "description": room.description,
    "image": `https://hotel734.com${room.image}`,
    "url": `https://hotel734.com/rooms/${room.roomId}`,
    "offers": {
      "@type": "Offer",
      "price": room.price,
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "amenityFeature": [
      {
        "@type": "LocationFeatureSpecification",
        "name": "Free WiFi",
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
    "partOf": {
      "@type": "Hotel",
      "name": "Hotel 734",
      "url": "https://hotel734.com"
    }
  };
}

// Breadcrumb structured data
export function generateBreadcrumbStructuredData(items: Array<{name: string, url: string}>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}

// FAQ structured data
export function generateFAQStructuredData(faqs: Array<{question: string, answer: string}>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

// Review/Rating structured data
export function generateReviewStructuredData(reviews: Array<{
  author: string;
  rating: number;
  reviewBody: string;
  datePublished: string;
}>) {
  return reviews.map(review => ({
    "@context": "https://schema.org",
    "@type": "Review",
    "author": {
      "@type": "Person",
      "name": review.author
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": review.rating,
      "bestRating": "5"
    },
    "reviewBody": review.reviewBody,
    "datePublished": review.datePublished,
    "itemReviewed": {
      "@type": "Hotel",
      "name": "Hotel 734",
      "url": "https://hotel734.com"
    }
  }));
}
