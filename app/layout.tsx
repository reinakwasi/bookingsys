import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/hooks/useAuth"
import SiteFrame from "./SiteFrame"
import StructuredData from "@/components/StructuredData"

// Start MSW in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  import('../mocks/browser').then(({ worker }) => {
    worker.start({
      onUnhandledRequest: 'bypass',
    });
  });
}

const inter = Inter({ subsets: ["latin"] })
const playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-playfair' })

export const metadata: Metadata = {
  title: "Hotel 734 | Luxury Accommodation in New Edubiase, Ghana",
  description: "Experience luxury at Hotel 734 in New Edubiase. Premium rooms, world-class amenities, event spaces, and exceptional service. Book your stay today for an unforgettable experience.",
  keywords: "Hotel 734, New Edubiase hotel, luxury accommodation Ghana, premium hotel rooms, event venue, conference facilities, hotel booking, Ghana hospitality",
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
    title: "Hotel 734 | Luxury Accommodation in New Edubiase, Ghana",
    description: "Experience luxury at Hotel 734 in New Edubiase. Premium rooms, world-class amenities, event spaces, and exceptional service. Book your stay today.",
    url: 'https://hotel734.com',
    siteName: 'Hotel 734',
    images: [
      {
        url: '/images/hotel-734-exterior.jpg',
        width: 1200,
        height: 630,
        alt: 'Hotel 734 - Luxury Hotel in New Edubiase, Ghana',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Hotel 734 | Luxury Accommodation in New Edubiase, Ghana",
    description: "Experience luxury at Hotel 734 in New Edubiase. Premium rooms, world-class amenities, event spaces, and exceptional service.",
    images: ['/images/hotel-734-exterior.jpg'],
    creator: '@Hotel734Ghana',
    site: '@Hotel734Ghana',
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
  generator: 'Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.className} ${playfair.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#1a233b" />
        <meta name="msapplication-TileColor" content="#1a233b" />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS prefetch for performance */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      </head>
      <body className={inter.className}>
        <StructuredData type="hotel" />
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
