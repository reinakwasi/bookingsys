/**
 * Configuration utilities for Hotel 734
 * Provides consistent environment variable handling across the application
 */

/**
 * Get the base URL for the application with proper fallbacks
 * Priority order:
 * 1. NEXT_PUBLIC_APP_URL (recommended)
 * 2. NEXT_PUBLIC_BASE_URL (fallback)
 * 3. https://${VERCEL_URL} (Vercel deployment)
 * 4. https://hotel734.com (final fallback)
 */
export function getBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
    process.env.NEXT_PUBLIC_BASE_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    'https://hotel734.com';
  
  return baseUrl;
}

/**
 * Generate a complete ticket URL using the base URL and access token
 */
export function generateTicketUrl(accessToken: string): string {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/t/${accessToken}`;
}

/**
 * Log the current base URL configuration for debugging
 */
export function logBaseUrlConfig(): void {
  console.log('🔧 Base URL Configuration:');
  console.log('  NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL || 'undefined');
  console.log('  NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL || 'undefined');
  console.log('  VERCEL_URL:', process.env.VERCEL_URL || 'undefined');
  console.log('  Final Base URL:', getBaseUrl());
}

/**
 * Check if the base URL is properly configured (not using fallback)
 */
export function isBaseUrlConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL);
}
