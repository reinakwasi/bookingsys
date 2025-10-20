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
 * Returns the 8-character ID portion from TKT-XXXXXXXX format
 */
export function extractPurchaseIdFromTicketNumber(ticketNumber: string): string | null {
  const match = ticketNumber.match(/^TKT-([A-Z0-9]{8})$/);
  return match ? match[1] : null;
}

/**
 * Validate ticket number format
 */
export function isValidTicketNumber(ticketNumber: string): boolean {
  return /^TKT-[A-Z0-9]{8}$/.test(ticketNumber);
}

/**
 * Validate QR code format
 */
export function isValidQRCode(qrCode: string): boolean {
  return /^QR-[A-Z0-9]{8}$/.test(qrCode);
}
