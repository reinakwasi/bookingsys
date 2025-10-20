import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/hooks/useAuth"
import SiteFrame from "./SiteFrame"
import Script from "next/script"

// Start MSW in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  import('../mocks/browser').then(({ worker }) => {
    worker.start({
      onUnhandledRequest: 'bypass',
    });
  });
}

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Hotel 734 - Luxury Hotel & Resort | Premium Accommodations & Events",
    template: "%s | Hotel 734"
  },
  description: "Experience unparalleled luxury at Hotel 734. Premium accommodations, world-class facilities, elegant event spaces, and exceptional service. Book your perfect stay today.",
  keywords: ["luxury hotel", "premium resort", "Hotel 734", "luxury accommodations", "event venue", "conference center", "wedding venue", "business hotel", "luxury suites", "hotel booking"],
  authors: [{ name: "Hotel 734" }],
  creator: "Hotel 734",
  publisher: "Hotel 734",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://hotel734.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Hotel 734 - Luxury Hotel & Resort",
    description: "Experience unparalleled luxury at Hotel 734. Premium accommodations, world-class facilities, elegant event spaces, and exceptional service.",
    url: 'https://hotel734.com',
    siteName: 'Hotel 734',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Hotel 734 - Luxury Hotel & Resort',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hotel 734 - Luxury Hotel & Resort',
    description: 'Experience unparalleled luxury at Hotel 734. Premium accommodations, world-class facilities, and exceptional service.',
    images: ['/og-image.jpg'],
    creator: '@hotel734',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  category: 'hospitality',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1a233b" />
        <meta name="msapplication-TileColor" content="#1a233b" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Hotel 734 Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
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
            })
          }}
        />
      </head>
      <body className={inter.className}>
        {/* Google Analytics */}
        {process.env.NODE_ENV === 'production' && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                  page_title: document.title,
                  page_location: window.location.href,
                });
              `}
            </Script>
          </>
        )}
        
        {/* SEO Monitoring in Development */}
        {process.env.NODE_ENV === 'development' && (
          <Script id="seo-monitor" strategy="afterInteractive">
            {`
              if (typeof window !== 'undefined') {
                import('/lib/seo-monitor.js').then(({ runSEOCheck }) => {
                  setTimeout(runSEOCheck, 2000);
                });
              }
            `}
          </Script>
        )}
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <SiteFrame>
              {children}
            </SiteFrame>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
