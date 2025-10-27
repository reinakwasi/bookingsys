/**
 * ============================================================================
 * PAYSTACK PAYMENT INTEGRATION - COMMENTED OUT FOR HUBTEL INTEGRATION
 * ============================================================================
 * 
 * This file contains the complete Paystack payment integration.
 * It has been commented out to prepare for Hubtel integration.
 * 
 * See PAYMENT_FLOW_DOCUMENTATION.md for complete flow details.
 * 
 * To restore Paystack: 
 * 1. Delete lib/paystack.ts
 * 2. Rename this file to lib/paystack.ts
 * 3. Uncomment all code below
 * ============================================================================
 */

/*
// ============================================================================
// PAYSTACK CODE STARTS HERE
// ============================================================================

export interface PaystackPaymentData {
  amount: number;
  email: string;
  reference?: string;
  metadata?: Record<string, any>;
  callback_url?: string;
  channels?: string[];
}

export interface PaystackInitializeResponse {
  success: boolean;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
  error?: string;
}

export interface PaystackVerifyResponse {
  success: boolean;
  data?: {
    status: string;
    reference: string;
    amount: number;
    currency: string;
    paid_at: string;
    channel: string;
    customer: {
      email: string;
      customer_code: string;
    };
    metadata?: Record<string, any>;
  };
  error?: string;
}

export class PaystackService {
  private static readonly PAYSTACK_BASE_URL = 'https://api.paystack.co';

  static validateClientConfiguration(): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];

    if (!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY) {
      issues.push('NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is not configured');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  static validateConfiguration(): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];

    if (!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY) {
      issues.push('NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is not configured');
    }

    if (!process.env.PAYSTACK_SECRET_KEY) {
      issues.push('PAYSTACK_SECRET_KEY is not configured');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  static generateReference(prefix: string = 'HTL734'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `${prefix}_${timestamp}_${random}`;
  }

  static async initializePayment(
    paymentData: PaystackPaymentData
  ): Promise<PaystackInitializeResponse> {
    try {
      const secretKey = process.env.PAYSTACK_SECRET_KEY;

      if (!secretKey) {
        throw new Error('Paystack secret key not configured');
      }

      const reference = paymentData.reference || this.generateReference();
      const amountInKobo = Math.round(paymentData.amount * 100);

      const requestBody = {
        email: paymentData.email,
        amount: amountInKobo,
        currency: 'GHS',
        reference: reference,
        callback_url: paymentData.callback_url,
        metadata: paymentData.metadata,
        channels: paymentData.channels || ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer']
      };

      console.log('🚀 Initializing Paystack payment:', {
        email: requestBody.email,
        amount: requestBody.amount,
        reference: requestBody.reference
      });

      const response = await fetch(`${this.PAYSTACK_BASE_URL}/transaction/initialize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${secretKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();

      if (!response.ok || !result.status) {
        console.error('❌ Paystack initialization failed:', result);
        return {
          success: false,
          error: result.message || 'Payment initialization failed'
        };
      }

      console.log('✅ Paystack payment initialized successfully');

      return {
        success: true,
        data: result.data
      };

    } catch (error) {
      console.error('❌ Paystack initialization error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  static async verifyPayment(reference: string): Promise<PaystackVerifyResponse> {
    try {
      const secretKey = process.env.PAYSTACK_SECRET_KEY;

      if (!secretKey) {
        throw new Error('Paystack secret key not configured');
      }

      console.log('🔍 Verifying Paystack payment:', reference);

      const response = await fetch(
        `${this.PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = await response.json();

      if (!response.ok || !result.status) {
        console.error('❌ Paystack verification failed:', result);
        return {
          success: false,
          error: result.message || 'Payment verification failed'
        };
      }

      console.log('✅ Paystack payment verified:', {
        status: result.data.status,
        amount: result.data.amount,
        reference: result.data.reference
      });

      return {
        success: true,
        data: result.data
      };

    } catch (error) {
      console.error('❌ Paystack verification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  static getPaymentMethodName(channel: string): string {
    const channelMap: Record<string, string> = {
      'card': 'Card Payment',
      'bank': 'Bank Transfer',
      'ussd': 'USSD',
      'qr': 'QR Code',
      'mobile_money': 'Mobile Money',
      'bank_transfer': 'Bank Transfer',
      'eft': 'EFT'
    };

    return channelMap[channel.toLowerCase()] || 'Paystack';
  }
}

// ============================================================================
// PAYSTACK CODE ENDS HERE
// ============================================================================
*/

// Temporary exports to prevent TypeScript errors
// These will be replaced with Hubtel implementations
export interface PaystackPaymentData {
  amount: number;
  email: string;
  reference?: string;
  metadata?: Record<string, any>;
  callback_url?: string;
  channels?: string[];
}

export interface PaystackInitializeResponse {
  success: boolean;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
  error?: string;
}

export interface PaystackVerifyResponse {
  success: boolean;
  data?: {
    status: string;
    reference: string;
    amount: number;
    currency: string;
    paid_at: string;
    channel: string;
    customer: {
      email: string;
      customer_code: string;
    };
    metadata?: Record<string, any>;
  };
  error?: string;
}

export class PaystackService {
  static validateClientConfiguration(): { isValid: boolean; issues: string[] } {
    return {
      isValid: false,
      issues: ['Paystack has been disabled - awaiting Hubtel integration']
    };
  }

  static validateConfiguration(): { isValid: boolean; issues: string[] } {
    return {
      isValid: false,
      issues: ['Paystack has been disabled - awaiting Hubtel integration']
    };
  }

  static generateReference(prefix: string = 'HTL734'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `${prefix}_${timestamp}_${random}`;
  }

  static async initializePayment(
    paymentData: PaystackPaymentData
  ): Promise<PaystackInitializeResponse> {
    console.log('⚠️ Paystack is disabled - awaiting Hubtel integration');
    return {
      success: false,
      error: 'Paystack has been disabled - awaiting Hubtel integration'
    };
  }

  static async verifyPayment(reference: string): Promise<PaystackVerifyResponse> {
    console.log('⚠️ Paystack is disabled - awaiting Hubtel integration');
    return {
      success: false,
      error: 'Paystack has been disabled - awaiting Hubtel integration'
    };
  }

  static getPaymentMethodName(channel: string): string {
    return 'Payment Gateway';
  }
}
