import { differenceInDays, startOfDay } from 'date-fns'

/**
 * Calculate the number of nights between check-in and check-out dates
 * @param checkIn - Check-in date
 * @param checkOut - Check-out date
 * @returns Number of nights (0 if invalid dates)
 */
export function calculateNights(checkIn: Date | null | undefined, checkOut: Date | null | undefined): number {
  if (!checkIn || !checkOut) return 0
  
  const checkInDay = startOfDay(checkIn)
  const checkOutDay = startOfDay(checkOut)
  
  const nights = differenceInDays(checkOutDay, checkInDay)
  return Math.max(0, nights)
}

/**
 * Format nights display for UI
 * @param nights - Number of nights
 * @returns Formatted string
 */
export function formatNights(nights: number): string {
  if (nights === 0) return ''
  if (nights === 1) return '1 night'
  return `${nights} nights`
}

/**
 * Validate hotel booking dates
 * @param checkIn - Check-in date
 * @param checkOut - Check-out date
 * @returns Validation result with error message if invalid
 */
export function validateBookingDates(checkIn: Date | null | undefined, checkOut: Date | null | undefined): {
  isValid: boolean
  error?: string
  nights?: number
} {
  if (!checkIn) {
    return { isValid: false, error: 'Please select a check-in date' }
  }
  
  if (!checkOut) {
    return { isValid: false, error: 'Please select a check-out date' }
  }
  
  const nights = calculateNights(checkIn, checkOut)
  
  if (nights < 1) {
    return { isValid: false, error: 'Check-out must be at least 1 day after check-in' }
  }
  
  const today = startOfDay(new Date())
  const checkInDay = startOfDay(checkIn)
  
  if (checkInDay < today) {
    return { isValid: false, error: 'Check-in date cannot be in the past' }
  }
  
  return { isValid: true, nights }
}
