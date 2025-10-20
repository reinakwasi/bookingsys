import { supabase } from './supabase';
import { getBaseUrl } from './config';

/**
 * Generate a short, unique hash for ticket access
 * Format: 8 characters, alphanumeric, URL-safe
 */
export function generateShortHash(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a unique short hash that doesn't exist in the database
 */
export async function generateUniqueShortHash(): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const hash = generateShortHash();
    
    // Check if this hash already exists
    const { data, error } = await supabase
      .from('ticket_purchases')
      .select('id')
      .eq('access_token', hash)
      .single();

    // If no data found (error), the hash is unique
    if (error && error.code === 'PGRST116') {
      console.log('✅ Generated unique short hash:', hash);
      return hash;
    }

    attempts++;
    console.log(`⚠️ Hash collision detected, retrying... (${attempts}/${maxAttempts})`);
  }

  // Fallback to timestamp-based hash if all attempts fail
  const fallbackHash = Date.now().toString(36).slice(-8).toUpperCase();
  console.log('⚠️ Using fallback hash:', fallbackHash);
  return fallbackHash;
}

/**
 * Generate the complete short link URL for a ticket
 */
export function generateTicketShortLink(shortHash: string, baseUrl?: string): string {
  // Use provided baseUrl or get from config utility
  const domain = baseUrl || getBaseUrl();
  
  console.log('🔗 Generating short link with domain:', domain);
  return `${domain}/t/${shortHash}`;
}

/**
 * Create SMS message with short link for ticket purchase
 */
export function createTicketSMSMessage(data: {
  customerName: string;
  eventName: string;
  eventDate: string;
  ticketNumber: string;
  shortLink: string;
  quantity: number;
}): string {
  const { customerName, eventName, eventDate, ticketNumber, shortLink, quantity } = data;
  
  const formattedDate = new Date(eventDate).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  
  const ticketText = quantity === 1 ? 'Ticket' : 'Tickets';
  
  return `HOTEL 734 - TICKET CONFIRMED

Hello ${customerName}!

EVENT: ${eventName.toUpperCase()}
DATE: ${formattedDate}
${ticketText.toUpperCase()}: ${quantity}
REFERENCE: ${ticketNumber}

VIEW TICKET: ${shortLink}

IMPORTANT: Present this SMS or scan QR code at venue entrance.

Thank you for choosing Hotel 734!

Support: 0244093821
Email: info@hotel734.com

- Hotel 734 Management`;
}

/**
 * Extract short hash from a ticket access URL
 */
export function extractShortHashFromUrl(url: string): string | null {
  const match = url.match(/\/t\/([A-Za-z0-9]{8})/);
  return match ? match[1] : null;
}
