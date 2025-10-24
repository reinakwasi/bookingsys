/**
 * Hubtel Online Checkout Service
 * Implements Hubtel payment gateway integration for Hotel 734
 * Supports Mobile Money, Bank Card, Wallet, and GhQR payments
 */

export interface HubtelPaymentData {
  totalAmount: number;
  description: string;
  clientReference: string;
  payeeName?: string;
  payeeMobileNumber?: string;
  payeeEmail?: string;
  metadata?: Record<string, any>;
}

export interface HubtelInitializeResponse {
  success: boolean;
  responseCode: string;
  status: string;
  data?: {
    checkoutUrl: string;
    checkoutId: string;
    clientReference: string;
    message: string;
    checkoutDirectUrl: string;
  };
  error?: string;
}

export interface HubtelCallbackData {
  ResponseCode: string;
  Status: string;
  Data: {
    CheckoutId: string;
    SalesInvoiceId: string;
    ClientReference: string;
    Status: string;
    Amount: number;
    CustomerPhoneNumber: string;
    PaymentDetails: {
      MobileMoneyNumber?: string;
      PaymentType: string;
      Channel: string;
    };
    Description: string;
  };
}

export interface HubtelStatusCheckResponse {
  success: boolean;
  message: string;
  responseCode: string;
  data?: {
    date: string;
    status: 'Paid' | 'Unpaid' | 'Refunded';
    transactionId: string;
    externalTransactionId: string;
    paymentMethod: string;
    clientReference: string;
    currencyCode: string | null;
    amount: number;
    charges: number;
    amountAfterCharges: number;
    isFulfilled: boolean | null;
  };
  error?: string;
}

export class HubtelService {
  private static readonly API_BASE_URL = 'https://payproxyapi.hubtel.com';
  private static readonly STATUS_CHECK_URL = 'https://api-txnstatus.hubtel.com';

  /**
   * Validate Hubtel configuration (client-safe)
   * Only checks public environment variables accessible from client
   */
  static validateClientConfiguration(): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];

    if (!process.env.NEXT_PUBLIC_HUBTEL_API_ID) {
      issues.push('NEXT_PUBLIC_HUBTEL_API_ID is not configured');
    }

    if (!process.env.NEXT_PUBLIC_HUBTEL_MERCHANT_ACCOUNT) {
      issues.push('NEXT_PUBLIC_HUBTEL_MERCHANT_ACCOUNT is not configured');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Validate Hubtel configuration (server-side only)
   * Checks all environment variables including API key
   * Should only be called from API routes or server components
   */
  static validateConfiguration(): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];

    if (!process.env.NEXT_PUBLIC_HUBTEL_API_ID) {
      issues.push('NEXT_PUBLIC_HUBTEL_API_ID is not configured');
    }

    if (!process.env.HUBTEL_API_KEY) {
      issues.push('HUBTEL_API_KEY is not configured');
    }

    if (!process.env.NEXT_PUBLIC_HUBTEL_MERCHANT_ACCOUNT) {
      issues.push('NEXT_PUBLIC_HUBTEL_MERCHANT_ACCOUNT is not configured');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Get authorization header for Hubtel API
   */
  private static getAuthHeader(): string {
    const apiId = process.env.NEXT_PUBLIC_HUBTEL_API_ID || '';
    const apiKey = process.env.HUBTEL_API_KEY || '';
    
    // Debug logging (masked for security)
    console.log('🔐 Auth Debug:', {
      apiId: apiId ? `${apiId.substring(0, 3)}***` : 'MISSING',
      apiKeyLength: apiKey ? apiKey.length : 0,
      hasApiId: !!apiId,
      hasApiKey: !!apiKey
    });
    
    if (!apiId || !apiKey) {
      console.error('❌ Missing Hubtel credentials!', {
        hasApiId: !!apiId,
        hasApiKey: !!apiKey
      });
    }
    
    const credentials = `${apiId}:${apiKey}`;
    return `Basic ${Buffer.from(credentials).toString('base64')}`;
  }

  /**
   * Initialize payment with Hubtel
   * This should be called from the server-side API route
   */
  static async initializePayment(paymentData: HubtelPaymentData): Promise<HubtelInitializeResponse> {
    try {
      console.log('🚀 Initializing Hubtel payment:', paymentData);

      const validation = this.validateConfiguration();
      if (!validation.isValid) {
        throw new Error(`Hubtel configuration error: ${validation.issues.join(', ')}`);
      }

      const merchantAccountNumber = process.env.NEXT_PUBLIC_HUBTEL_MERCHANT_ACCOUNT;
      const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 
                      process.env.NEXT_PUBLIC_SITE_URL || 
                      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

      console.log('🌍 Site URL being used:', siteUrl);
      console.log('🔍 Environment check:', {
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ? 'SET' : 'NOT SET',
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ? 'SET' : 'NOT SET',
        VERCEL_URL: process.env.VERCEL_URL ? 'SET' : 'NOT SET'
      });

      const payload = {
        totalAmount: paymentData.totalAmount,
        description: paymentData.description,
        callbackUrl: `${siteUrl}/api/payments/hubtel/callback`,
        returnUrl: `${siteUrl}/payment-success`, // Dedicated success page for popup handling
        merchantAccountNumber: merchantAccountNumber,
        cancellationUrl: `${siteUrl}/payment-cancelled`, // Dedicated cancel page
        clientReference: paymentData.clientReference,
        ...(paymentData.payeeName && { payeeName: paymentData.payeeName }),
        ...(paymentData.payeeMobileNumber && { payeeMobileNumber: paymentData.payeeMobileNumber }),
        ...(paymentData.payeeEmail && { payeeEmail: paymentData.payeeEmail })
      };

      console.log('📤 Sending to Hubtel:', { ...payload, merchantAccountNumber: '***' });

      const response = await fetch(`${this.API_BASE_URL}/items/initiate`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader(),
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(payload)
      });

      console.log('📡 Hubtel API response status:', response.status, response.statusText);

      // Check if response is OK before parsing JSON
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Hubtel API error response:', errorText);
        console.error('❌ Response status:', response.status, response.statusText);
        
        return {
          success: false,
          responseCode: 'HTTP_ERROR',
          status: 'Failed',
          error: `Hubtel API error: ${response.status} ${response.statusText}. ${errorText ? 'Details: ' + errorText : ''}`
        };
      }

      // Try to parse JSON response
      let data;
      try {
        const responseText = await response.text();
        console.log('📥 Raw Hubtel response:', responseText);
        
        if (!responseText || responseText.trim() === '') {
          console.error('❌ Empty response from Hubtel');
          return {
            success: false,
            responseCode: 'EMPTY_RESPONSE',
            status: 'Failed',
            error: 'Hubtel returned an empty response'
          };
        }
        
        data = JSON.parse(responseText);
        console.log('📥 Parsed Hubtel response:', data);
      } catch (parseError) {
        console.error('❌ Failed to parse Hubtel response as JSON:', parseError);
        return {
          success: false,
          responseCode: 'PARSE_ERROR',
          status: 'Failed',
          error: 'Invalid response from Hubtel API. Please check your credentials and try again.'
        };
      }

      if (data.responseCode !== '0000') {
        console.error('❌ Hubtel initialization error:', data);
        return {
          success: false,
          responseCode: data.responseCode || 'ERROR',
          status: data.status || 'Failed',
          error: data.message || 'Payment initialization failed'
        };
      }

      return {
        success: true,
        responseCode: data.responseCode,
        status: data.status,
        data: data.data
      };

    } catch (error) {
      console.error('❌ Hubtel initialization exception:', error);
      return {
        success: false,
        responseCode: 'ERROR',
        status: 'Failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Check transaction status
   * This should be called from the server-side API route
   */
  static async checkTransactionStatus(clientReference: string): Promise<HubtelStatusCheckResponse> {
    try {
      console.log('🔍 Checking transaction status for:', clientReference);

      const validation = this.validateConfiguration();
      if (!validation.isValid) {
        throw new Error(`Hubtel configuration error: ${validation.issues.join(', ')}`);
      }

      const merchantAccountNumber = process.env.NEXT_PUBLIC_HUBTEL_MERCHANT_ACCOUNT;
      const url = `${this.STATUS_CHECK_URL}/transactions/${merchantAccountNumber}/status?clientReference=${encodeURIComponent(clientReference)}`;

      console.log('📤 Checking status at:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader()
        }
      });

      console.log('📡 Status check response status:', response.status, response.statusText);

      // Check if response is HTML (403 Forbidden - IP not whitelisted)
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('text/html')) {
        console.error('❌ Status check returned HTML - IP not whitelisted!');
        console.error('⚠️ Your IP address needs to be whitelisted by Hubtel for status check API');
        return {
          success: false,
          message: 'IP address not whitelisted for status check API',
          responseCode: 'IP_NOT_WHITELISTED',
          error: 'Contact Hubtel support to whitelist your IP address for Transaction Status Check API'
        };
      }

      // Try to parse JSON response
      let data;
      try {
        const responseText = await response.text();
        console.log('📥 Raw status check response:', responseText.substring(0, 200));
        
        if (!responseText || responseText.trim() === '') {
          return {
            success: false,
            message: 'Empty response from status check API',
            responseCode: 'EMPTY_RESPONSE',
            error: 'Status check API returned empty response'
          };
        }
        
        data = JSON.parse(responseText);
        console.log('📥 Parsed status check response:', data);
      } catch (parseError) {
        console.error('❌ Failed to parse status check response:', parseError);
        return {
          success: false,
          message: 'Invalid response from status check API',
          responseCode: 'PARSE_ERROR',
          error: 'Could not parse status check response. IP may not be whitelisted.'
        };
      }

      if (!response.ok || data.responseCode !== '0000') {
        console.error('❌ Status check error:', data);
        return {
          success: false,
          message: data.message || 'Status check failed',
          responseCode: data.responseCode || 'ERROR',
          error: data.message || 'Failed to check transaction status'
        };
      }

      return {
        success: true,
        message: data.message,
        responseCode: data.responseCode,
        data: data.data
      };

    } catch (error) {
      console.error('❌ Status check exception:', error);
      return {
        success: false,
        message: 'Status check failed',
        responseCode: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Verify payment status (alias for checkTransactionStatus for consistency)
   */
  static async verifyPayment(clientReference: string): Promise<HubtelStatusCheckResponse> {
    return this.checkTransactionStatus(clientReference);
  }

  /**
   * Generate unique client reference for transaction
   * Maximum 32 characters as per Hubtel requirements
   */
  static generateClientReference(prefix: string = 'HTL734'): string {
    const timestamp = Date.now().toString().slice(-10); // Last 10 digits
    const random = Math.random().toString(36).substring(2, 8); // 6 chars
    // Format: PREFIX_TIMESTAMP_RANDOM (max 32 chars)
    return `${prefix}_${timestamp}_${random}`;
  }

  /**
   * Parse Hubtel callback data
   */
  static parseCallbackData(callbackData: any): HubtelCallbackData | null {
    try {
      if (!callbackData || !callbackData.Data) {
        return null;
      }

      return {
        ResponseCode: callbackData.ResponseCode,
        Status: callbackData.Status,
        Data: {
          CheckoutId: callbackData.Data.CheckoutId,
          SalesInvoiceId: callbackData.Data.SalesInvoiceId,
          ClientReference: callbackData.Data.ClientReference,
          Status: callbackData.Data.Status,
          Amount: callbackData.Data.Amount,
          CustomerPhoneNumber: callbackData.Data.CustomerPhoneNumber,
          PaymentDetails: {
            MobileMoneyNumber: callbackData.Data.PaymentDetails?.MobileMoneyNumber,
            PaymentType: callbackData.Data.PaymentDetails?.PaymentType || 'unknown',
            Channel: callbackData.Data.PaymentDetails?.Channel || 'unknown'
          },
          Description: callbackData.Data.Description
        }
      };
    } catch (error) {
      console.error('Error parsing callback data:', error);
      return null;
    }
  }

  /**
   * Format amount for display (GHS currency)
   */
  static formatAmount(amount: number): string {
    return `GH₵ ${amount.toFixed(2)}`;
  }

  /**
   * Get payment method display name
   */
  static getPaymentMethodName(paymentType: string): string {
    const methods: Record<string, string> = {
      'mobilemoney': 'Mobile Money',
      'card': 'Bank Card',
      'wallet': 'Wallet',
      'ghqr': 'GhQR',
      'cash': 'Cash',
      'cheque': 'Cheque'
    };

    return methods[paymentType.toLowerCase()] || paymentType;
  }

  /**
   * Get channel display name
   */
  static getChannelName(channel: string): string {
    const channels: Record<string, string> = {
      'mtn-gh': 'MTN Mobile Money',
      'tigo-gh': 'AirtelTigo Money',
      'vodafone-gh': 'Vodafone Cash',
      'airtel-gh': 'AirtelTigo Money'
    };

    return channels[channel.toLowerCase()] || channel;
  }
}

export default HubtelService;
