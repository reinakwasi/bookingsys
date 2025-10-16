// Note: Install these packages with: npm install isomorphic-dompurify validator
// import DOMPurify from 'isomorphic-dompurify'
// import validator from 'validator'

// Temporary implementation without external dependencies
const validator = {
  isEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },
  normalizeEmail: (email: string): string | false => {
    if (!email) return false
    return email.toLowerCase().trim()
  }
}

const DOMPurify = {
  sanitize: (input: string, options?: any): string => {
    // Basic HTML sanitization - remove all HTML tags
    return input.replace(/<[^>]*>/g, '').trim()
  }
}

export interface ValidationResult {
  isValid: boolean
  sanitized?: string
  errors: string[]
}

export class InputValidator {
  
  /**
   * Sanitize HTML input to prevent XSS attacks
   */
  static sanitizeHtml(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [], // No HTML tags allowed
      ALLOWED_ATTR: []
    })
  }

  /**
   * Validate and sanitize email
   */
  static validateEmail(email: string): ValidationResult {
    const errors: string[] = []
    
    if (!email) {
      return { isValid: true, sanitized: '', errors: [] } // Email is optional
    }

    const sanitized = validator.normalizeEmail(email) || ''
    
    if (!validator.isEmail(sanitized)) {
      errors.push('Invalid email format')
    }
    
    if (sanitized.length > 254) {
      errors.push('Email too long')
    }

    return {
      isValid: errors.length === 0,
      sanitized,
      errors
    }
  }

  /**
   * Validate phone number
   */
  static validatePhone(phone: string): ValidationResult {
    const errors: string[] = []
    
    if (!phone) {
      errors.push('Phone number is required')
      return { isValid: false, errors }
    }

    // Remove all non-digit characters for validation
    const cleaned = phone.replace(/\D/g, '')
    
    if (cleaned.length < 10 || cleaned.length > 15) {
      errors.push('Phone number must be between 10-15 digits')
    }

    // Keep original format but sanitized
    const sanitized = this.sanitizeHtml(phone.trim())

    return {
      isValid: errors.length === 0,
      sanitized,
      errors
    }
  }

  /**
   * Validate name fields
   */
  static validateName(name: string, fieldName: string = 'Name'): ValidationResult {
    const errors: string[] = []
    
    if (!name) {
      errors.push(`${fieldName} is required`)
      return { isValid: false, errors }
    }

    const sanitized = this.sanitizeHtml(name.trim())
    
    if (sanitized.length < 2) {
      errors.push(`${fieldName} must be at least 2 characters`)
    }
    
    if (sanitized.length > 100) {
      errors.push(`${fieldName} must be less than 100 characters`)
    }

    // Check for valid name characters (letters, spaces, hyphens, apostrophes)
    if (!/^[a-zA-Z\s\-']+$/.test(sanitized)) {
      errors.push(`${fieldName} contains invalid characters`)
    }

    return {
      isValid: errors.length === 0,
      sanitized,
      errors
    }
  }

  /**
   * Validate message/comment fields
   */
  static validateMessage(message: string): ValidationResult {
    const errors: string[] = []
    
    if (!message) {
      errors.push('Message is required')
      return { isValid: false, errors }
    }

    const sanitized = this.sanitizeHtml(message.trim())
    
    if (sanitized.length < 10) {
      errors.push('Message must be at least 10 characters')
    }
    
    if (sanitized.length > 1000) {
      errors.push('Message must be less than 1000 characters')
    }

    return {
      isValid: errors.length === 0,
      sanitized,
      errors
    }
  }

  /**
   * Validate date inputs
   */
  static validateDate(dateString: string, fieldName: string = 'Date'): ValidationResult {
    const errors: string[] = []
    
    if (!dateString) {
      errors.push(`${fieldName} is required`)
      return { isValid: false, errors }
    }

    const date = new Date(dateString)
    
    if (isNaN(date.getTime())) {
      errors.push(`Invalid ${fieldName.toLowerCase()} format`)
    }

    // Check if date is in the past (for booking dates)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (date < today) {
      errors.push(`${fieldName} cannot be in the past`)
    }

    return {
      isValid: errors.length === 0,
      sanitized: dateString,
      errors
    }
  }

  /**
   * Validate numeric inputs
   */
  static validateNumber(
    value: string | number, 
    min?: number, 
    max?: number, 
    fieldName: string = 'Number'
  ): ValidationResult {
    const errors: string[] = []
    
    const num = typeof value === 'string' ? parseFloat(value) : value
    
    if (isNaN(num)) {
      errors.push(`${fieldName} must be a valid number`)
      return { isValid: false, errors }
    }

    if (min !== undefined && num < min) {
      errors.push(`${fieldName} must be at least ${min}`)
    }

    if (max !== undefined && num > max) {
      errors.push(`${fieldName} must be at most ${max}`)
    }

    return {
      isValid: errors.length === 0,
      sanitized: num.toString(),
      errors
    }
  }

  /**
   * Validate room type
   */
  static validateRoomType(roomType: string): ValidationResult {
    const validTypes = ['regular', 'standard', 'expensive', 'classic_room', 'superior_room', 'royal_suite']
    const errors: string[] = []
    
    if (!roomType) {
      errors.push('Room type is required')
      return { isValid: false, errors }
    }

    const sanitized = this.sanitizeHtml(roomType.trim().toLowerCase())
    
    if (!validTypes.includes(sanitized)) {
      errors.push('Invalid room type selected')
    }

    return {
      isValid: errors.length === 0,
      sanitized,
      errors
    }
  }

  /**
   * Comprehensive form validation
   */
  static validateBookingForm(data: any): { isValid: boolean; errors: Record<string, string[]>; sanitized: any } {
    const errors: Record<string, string[]> = {}
    const sanitized: any = {}

    // Validate name
    const nameResult = this.validateName(data.name, 'Full Name')
    if (!nameResult.isValid) errors.name = nameResult.errors
    else sanitized.name = nameResult.sanitized

    // Validate email (optional)
    const emailResult = this.validateEmail(data.email)
    if (!emailResult.isValid) errors.email = emailResult.errors
    else sanitized.email = emailResult.sanitized

    // Validate phone
    const phoneResult = this.validatePhone(data.phone)
    if (!phoneResult.isValid) errors.phone = phoneResult.errors
    else sanitized.phone = phoneResult.sanitized

    // Validate check-in date
    if (data.checkIn) {
      const checkInResult = this.validateDate(data.checkIn, 'Check-in date')
      if (!checkInResult.isValid) errors.checkIn = checkInResult.errors
      else sanitized.checkIn = checkInResult.sanitized
    }

    // Validate check-out date
    if (data.checkOut) {
      const checkOutResult = this.validateDate(data.checkOut, 'Check-out date')
      if (!checkOutResult.isValid) errors.checkOut = checkOutResult.errors
      else sanitized.checkOut = checkOutResult.sanitized
    }

    // Validate room type
    if (data.roomType) {
      const roomTypeResult = this.validateRoomType(data.roomType)
      if (!roomTypeResult.isValid) errors.roomType = roomTypeResult.errors
      else sanitized.roomType = roomTypeResult.sanitized
    }

    // Validate number of guests
    if (data.numberOfGuests) {
      const guestsResult = this.validateNumber(data.numberOfGuests, 1, 10, 'Number of guests')
      if (!guestsResult.isValid) errors.numberOfGuests = guestsResult.errors
      else sanitized.numberOfGuests = parseInt(guestsResult.sanitized!)
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      sanitized
    }
  }

  /**
   * Validate contact form
   */
  static validateContactForm(data: any): { isValid: boolean; errors: Record<string, string[]>; sanitized: any } {
    const errors: Record<string, string[]> = {}
    const sanitized: any = {}

    // Validate name
    const nameResult = this.validateName(data.name, 'Name')
    if (!nameResult.isValid) errors.name = nameResult.errors
    else sanitized.name = nameResult.sanitized

    // Validate email
    const emailResult = this.validateEmail(data.email)
    if (!emailResult.isValid) errors.email = emailResult.errors
    else sanitized.email = emailResult.sanitized

    // Validate message
    const messageResult = this.validateMessage(data.message)
    if (!messageResult.isValid) errors.message = messageResult.errors
    else sanitized.message = messageResult.sanitized

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      sanitized
    }
  }
}
