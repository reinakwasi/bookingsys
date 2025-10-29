/**
 * Paystack Payment Integration Service
 * Handles payment initialization and verification with Paystack
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
  isPaid?: boolean;
  error?: string;
}

export class PaystackService {
  private static readonly PAYSTACK_BASE_URL = 'https://api.paystack.co';

  /**
   * Validate Paystack configuration (client-side check)
   */
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

  /**
   * Validate Paystack configuration (server-side check)
   */
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

  /**
   * Generate unique reference for Paystack transaction
   */
  static generateReference(prefix: string = 'HTL734'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `${prefix}_${timestamp}_${random}`;
  }

  /**
   * Initialize payment with Paystack (server-side only)
   */
  static async initializePayment(
    paymentData: PaystackPaymentData
  ): Promise<PaystackInitializeResponse> {
    try {
      const secretKey = process.env.PAYSTACK_SECRET_KEY;

      if (!secretKey) {
        throw new Error('Paystack secret key not configured');
      }

      // Generate reference if not provided
      const reference = paymentData.reference || this.generateReference();

      // Convert amount to pesewas (Paystack uses smallest currency unit - pesewas for GHS)
      const amountInPesewas = Math.round(paymentData.amount * 100);

      // Always include customer object for SMS receipts
      const customerPhone = paymentData.metadata?.customer_phone;
      const customerName = paymentData.metadata?.customer_name || 'Customer';
      
      const requestBody: any = {
        email: paymentData.email,
        amount: amountInPesewas,
        currency: 'GHS', // Ghana Cedis
        reference: reference,
        callback_url: paymentData.callback_url,
        metadata: paymentData.metadata,
        channels: paymentData.channels || ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer']
      };

      // Always include customer object if we have phone number for SMS receipts
      if (customerPhone) {
        requestBody.customer = {
          email: paymentData.email,
          phone: customerPhone,
          first_name: customerName.split(' ')[0] || 'Customer',
          last_name: customerName.split(' ').slice(1).join(' ') || ''
        };
        
        console.log('📱 Customer object for SMS receipts:', {
          phone: customerPhone,
          email: paymentData.email,
          name: customerName
        });
      }

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

  /**
   * Verify payment with Paystack (server-side only)
   */
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

      const isSuccessful = result.data.status === 'success';
      
      console.log(`${isSuccessful ? '✅' : '❌'} Payment verification result:`, {
        status: result.data.status,
        amount: result.data.amount,
        reference: result.data.reference
      });

      return {
        success: true,
        isPaid: isSuccessful,
        data: {
          status: result.data.status,
          reference: result.data.reference,
          amount: result.data.amount / 100, // Convert from pesewas back to cedis
          currency: result.data.currency,
          paid_at: result.data.paid_at,
          channel: result.data.channel,
          customer: {
            email: result.data.customer.email,
            customer_code: result.data.customer.customer_code
          },
          metadata: result.data.metadata
        }
      };

    } catch (error) {
      console.error('❌ Paystack verification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get payment method name for display
   */
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
