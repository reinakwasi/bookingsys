// Analytics and tracking utilities for Hotel 734

declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

// Google Analytics 4 configuration
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX'

// Initialize Google Analytics
export const initGA = () => {
  if (typeof window === 'undefined') return

  window.dataLayer = window.dataLayer || []
  function gtag(...args: any[]) {
    window.dataLayer.push(args)
  }
  window.gtag = gtag

  gtag('js', new Date())
  gtag('config', GA_TRACKING_ID, {
    page_title: document.title,
    page_location: window.location.href,
  })
}

// Track page views
export const trackPageView = (url: string, title?: string) => {
  if (typeof window === 'undefined' || !window.gtag) return

  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
    page_title: title || document.title,
  })
}

// Track custom events
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window === 'undefined' || !window.gtag) return

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  })
}

// Hotel-specific tracking events
export const hotelAnalytics = {
  // Room booking events
  trackRoomView: (roomType: string, roomId: string) => {
    trackEvent('view_room', 'engagement', `${roomType}_${roomId}`)
  },

  trackRoomBookingStart: (roomType: string) => {
    trackEvent('begin_checkout', 'booking', roomType)
  },

  trackRoomBookingComplete: (roomType: string, value: number) => {
    trackEvent('purchase', 'booking', roomType, value)
  },

  // Event booking events
  trackEventView: (eventName: string) => {
    trackEvent('view_event', 'engagement', eventName)
  },

  trackEventInquiry: (eventType: string) => {
    trackEvent('generate_lead', 'events', eventType)
  },

  // Ticket events
  trackTicketView: (ticketId: string, eventName: string) => {
    trackEvent('view_item', 'tickets', `${eventName}_${ticketId}`)
  },

  trackTicketPurchase: (ticketId: string, quantity: number, value: number) => {
    trackEvent('purchase', 'tickets', ticketId, value)
    window.gtag('event', 'purchase', {
      transaction_id: `ticket_${Date.now()}`,
      value: value,
      currency: 'USD',
      items: [{
        item_id: ticketId,
        item_name: 'Event Ticket',
        category: 'tickets',
        quantity: quantity,
        price: value / quantity,
      }]
    })
  },

  // Contact and engagement
  trackContactForm: (formType: string) => {
    trackEvent('form_submit', 'contact', formType)
  },

  trackPhoneClick: () => {
    trackEvent('phone_call', 'contact', 'header_phone')
  },

  trackEmailClick: () => {
    trackEvent('email_click', 'contact', 'header_email')
  },

  // Navigation and engagement
  trackGalleryView: (imageCategory: string) => {
    trackEvent('view_gallery', 'engagement', imageCategory)
  },

  trackFacilitiesView: (facilityName: string) => {
    trackEvent('view_facility', 'engagement', facilityName)
  },

  trackReviewSubmit: (rating: number) => {
    trackEvent('submit_review', 'engagement', 'guest_review', rating)
  },

  // Search and filtering
  trackSearch: (searchTerm: string, category: string) => {
    trackEvent('search', 'engagement', `${category}_${searchTerm}`)
  },

  trackFilter: (filterType: string, filterValue: string) => {
    trackEvent('filter', 'engagement', `${filterType}_${filterValue}`)
  },
}

// Enhanced ecommerce tracking for bookings
export const trackBookingFunnel = {
  viewRooms: () => {
    window.gtag('event', 'view_item_list', {
      item_list_id: 'rooms',
      item_list_name: 'Hotel Rooms',
    })
  },

  selectRoom: (roomType: string, price: number) => {
    window.gtag('event', 'select_item', {
      item_list_id: 'rooms',
      item_list_name: 'Hotel Rooms',
      items: [{
        item_id: roomType,
        item_name: roomType,
        category: 'accommodation',
        price: price,
      }]
    })
  },

  beginBooking: (roomType: string, price: number, checkIn: string, checkOut: string) => {
    window.gtag('event', 'begin_checkout', {
      currency: 'USD',
      value: price,
      items: [{
        item_id: roomType,
        item_name: roomType,
        category: 'accommodation',
        price: price,
        quantity: 1,
      }],
      custom_parameters: {
        check_in: checkIn,
        check_out: checkOut,
      }
    })
  },

  completeBooking: (
    bookingId: string,
    roomType: string,
    price: number,
    checkIn: string,
    checkOut: string
  ) => {
    window.gtag('event', 'purchase', {
      transaction_id: bookingId,
      value: price,
      currency: 'USD',
      items: [{
        item_id: roomType,
        item_name: roomType,
        category: 'accommodation',
        price: price,
        quantity: 1,
      }],
      custom_parameters: {
        check_in: checkIn,
        check_out: checkOut,
      }
    })
  },
}

// Performance monitoring
export const trackPerformance = {
  trackPageLoad: () => {
    if (typeof window === 'undefined') return

    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart

      trackEvent('page_load_time', 'performance', 'load_complete', Math.round(loadTime))
    })
  },

  trackCoreWebVitals: () => {
    if (typeof window === 'undefined') return

    // Track Largest Contentful Paint (LCP)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      const lastEntry = entries[entries.length - 1]
      trackEvent('core_web_vitals', 'performance', 'LCP', Math.round(lastEntry.startTime))
    }).observe({ entryTypes: ['largest-contentful-paint'] })

    // Track First Input Delay (FID)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      entries.forEach((entry: any) => {
        trackEvent('core_web_vitals', 'performance', 'FID', Math.round(entry.processingStart - entry.startTime))
      })
    }).observe({ entryTypes: ['first-input'] })

    // Track Cumulative Layout Shift (CLS)
    let clsValue = 0
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      })
      trackEvent('core_web_vitals', 'performance', 'CLS', Math.round(clsValue * 1000))
    }).observe({ entryTypes: ['layout-shift'] })
  },
}

// Scroll tracking for engagement
export const trackScrollDepth = () => {
  if (typeof window === 'undefined') return

  let maxScroll = 0
  const milestones = [25, 50, 75, 90, 100]
  const tracked = new Set<number>()

  const handleScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    const scrollPercent = Math.round((scrollTop / docHeight) * 100)

    if (scrollPercent > maxScroll) {
      maxScroll = scrollPercent

      milestones.forEach(milestone => {
        if (scrollPercent >= milestone && !tracked.has(milestone)) {
          tracked.add(milestone)
          trackEvent('scroll_depth', 'engagement', `${milestone}%`, milestone)
        }
      })
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true })
}

// Initialize all tracking
export const initAnalytics = () => {
  if (process.env.NODE_ENV === 'production') {
    initGA()
    trackPerformance.trackPageLoad()
    trackPerformance.trackCoreWebVitals()
    trackScrollDepth()
  }
}
