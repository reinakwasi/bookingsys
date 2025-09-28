import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/hooks/useAuth"
import SiteFrame from "./SiteFrame"

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
  title: "Hotel 734",
  description: "Experience luxury and comfort at our premium hotel and resort",
    generator: 'v0.dev'
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
      </head>
      <body className={inter.className}>
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
