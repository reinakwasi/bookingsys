/**
 * Utility functions for consistent ticket number and QR code generation
 */

/**
 * Generate consistent ticket number from purchase ID
 * Format: TKT-[8-CHAR-UPPERCASE-ID]
 */
export function generateTicketNumber(purchaseId: string): string {
  return `TKT-${purchaseId.slice(0, 8).toUpperCase()}`;
}

/**
 * Generate consistent QR code from access token
 * Format: QR-[ACCESS-TOKEN]
 */
export function generateQRCode(accessToken: string): string {
  return `QR-${accessToken.toUpperCase()}`;
}

/**
 * Extract purchase ID from ticket number
 * Handles both new format (TKT-XXXXXXXX) and old format (TKT-timestamp-seq)
 */
export function extractPurchaseIdFromTicketNumber(ticketNumber: string): string | null {
  // New format: TKT-[8-CHAR-ID]
  const newFormatMatch = ticketNumber.match(/^TKT-([A-Z0-9]{8})$/);
  if (newFormatMatch) {
    return newFormatMatch[1];
  }
  
  // Old format: TKT-[timestamp]-[sequence] - return the timestamp part
  const oldFormatMatch = ticketNumber.match(/^TKT-(\d{10,13})-\d{3}$/);
  if (oldFormatMatch) {
    return oldFormatMatch[1];
  }
  
  return null;
}

/**
 * Validate ticket number format (supports both old and new formats)
 * New format: TKT-[A-Z0-9]{8}
 * Old format: TKT-[timestamp]-[sequence]
 */
export function isValidTicketNumber(ticketNumber: string): boolean {
  // New format: TKT-[8 alphanumeric characters]
  const newFormat = /^TKT-[A-Z0-9]{8}$/.test(ticketNumber);
  
  // Old format: TKT-[timestamp]-[sequence] (for backward compatibility)
  const oldFormat = /^TKT-\d{10,13}-\d{3}$/.test(ticketNumber);
  
  return newFormat || oldFormat;
}

/**
 * Validate QR code format (supports both old and new formats)
 * New format: QR-[A-Z0-9]{8}
 * Old format: QR-[timestamp]-[id]-[sequence]
 */
export function isValidQRCode(qrCode: string): boolean {
  // New format: QR-[8 alphanumeric characters]
  const newFormat = /^QR-[A-Z0-9]{8}$/.test(qrCode);
  
  // Old format: QR-[timestamp]-[id]-[sequence] (for backward compatibility)
  const oldFormat = /^QR-\d{10,13}-[A-Z0-9]{8}-\d+$/.test(qrCode);
  
  return newFormat || oldFormat;
}

/**
 * Normalize ticket identifier for search (removes prefixes and handles different formats)
 */
export function normalizeTicketIdentifier(identifier: string): string {
  // Remove TKT- or QR- prefix if present
  let normalized = identifier.replace(/^(TKT-|QR-)/, '');
  
  // If it's the old timestamp format, extract the relevant part
  if (/^\d{10,13}-/.test(normalized)) {
    // For old format, we'll use the full string for now
    return identifier;
  }
  
  return normalized;
}
