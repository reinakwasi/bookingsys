/**
 * ============================================================================
 * PAYSTACK STUB - Temporary placeholders for Hubtel integration
 * ============================================================================
 * 
 * This file contains stub implementations to prevent TypeScript errors
 * while we prepare for Hubtel integration.
 * 
 * Original Paystack code is saved in:
 * - lib/paystack.ORIGINAL.ts (working copy)
 * - lib/paystack.COMMENTED.ts (commented version)
 * 
 * See PAYMENT_FLOW_DOCUMENTATION.md for complete flow details.
 * ============================================================================
 */

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
  /**
   * STUB: Validate client configuration
   * Returns disabled status for Hubtel integration
   */
  static validateClientConfiguration(): { isValid: boolean; issues: string[] } {
    return {
      isValid: false,
      issues: ['⚠️ Paystack disabled - Awaiting Hubtel integration']
    };
  }

  /**
   * STUB: Validate server configuration
   * Returns disabled status for Hubtel integration
   */
  static validateConfiguration(): { isValid: boolean; issues: string[] } {
    return {
      isValid: false,
      issues: ['⚠️ Paystack disabled - Awaiting Hubtel integration']
    };
  }

  /**
   * Generate unique reference for transactions
   * This method is still useful for Hubtel
   */
  static generateReference(prefix: string = 'HTL734'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `${prefix}_${timestamp}_${random}`;
  }

  /**
   * STUB: Initialize payment
   * Returns error for Hubtel integration
   */
  static async initializePayment(
    paymentData: PaystackPaymentData
  ): Promise<PaystackInitializeResponse> {
    console.log('⚠️ Paystack is disabled - Awaiting Hubtel integration');
    console.log('Payment data:', paymentData);
    
    return {
      success: false,
      error: 'Paystack has been disabled. Hubtel integration in progress.'
    };
  }

  /**
   * STUB: Verify payment
   * Returns error for Hubtel integration
   */
  static async verifyPayment(reference: string): Promise<PaystackVerifyResponse> {
    console.log('⚠️ Paystack is disabled - Awaiting Hubtel integration');
    console.log('Reference:', reference);
    
    return {
      success: false,
      error: 'Paystack has been disabled. Hubtel integration in progress.'
    };
  }

  /**
   * Get payment method name for display
   * Generic implementation for now
   */
  static getPaymentMethodName(channel: string): string {
    return 'Payment Gateway';
  }
}
