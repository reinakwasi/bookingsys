'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export function useNavigationLoading() {
  const [isNavigating, setIsNavigating] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Reset navigation state when route changes
    setIsNavigating(false)
  }, [pathname, searchParams])

  const startNavigation = () => {
    setIsNavigating(true)
  }

  return { isNavigating, startNavigation }
}
