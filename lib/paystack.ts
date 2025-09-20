// Paystack integration utilities
declare global {
  interface Window {
    PaystackPop: any;
  }
}

export interface PaystackConfig {
  key: string;
  email: string;
  amount: number;
  currency?: string;
  ref?: string;
  metadata?: any;
  callback: (response: any) => void;
  onClose: () => void;
}

export interface PaymentData {
  email: string;
  amount: number;
  metadata: {
    ticket_id: string;
    ticket_title: string;
    quantity: number;
    customer_name: string;
    customer_phone?: string;
    real_customer_email?: string;
  };
}

export class PaystackService {
  private static getPublicKey() {
    return process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
  }

  static validateConfiguration() {
    const publicKey = this.getPublicKey();
    const issues = [];

    if (!publicKey) {
      issues.push('NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is not set');
    } else if (!publicKey.startsWith('pk_test_') && !publicKey.startsWith('pk_live_')) {
      issues.push('Public key should start with pk_test_ or pk_live_');
    }

    if (!window.PaystackPop) {
      issues.push('Paystack script not loaded');
    }

    return {
      isValid: issues.length === 0,
      issues,
      publicKey: publicKey ? `${publicKey.substring(0, 10)}...` : 'Not set'
    };
  }

  static async initializePayment(paymentData: PaymentData) {
    try {
      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment initialization failed');
      }

      return data;
    } catch (error) {
      console.error('Payment initialization error:', error);
      throw error;
    }
  }

  static async verifyPayment(reference: string) {
    try {
      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reference }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment verification failed');
      }

      return data;
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  }

  static openPaymentModal(config: PaystackConfig) {
    return new Promise((resolve, reject) => {
      const publicKey = this.getPublicKey();
      console.log('Opening Paystack payment modal...');
      console.log('Config:', config);
      console.log('Public key:', publicKey);
      
      if (!window.PaystackPop) {
        console.error('Paystack script not loaded');
        reject(new Error('Paystack script not loaded'));
        return;
      }

      if (!publicKey) {
        console.error('Paystack public key not configured');
        reject(new Error('Paystack public key not configured'));
        return;
      }

      const handler = window.PaystackPop.setup({
        ...config,
        key: publicKey,
        callback: (response: any) => {
          console.log('Payment callback received:', response);
          config.callback(response);
          resolve(response);
        },
        onClose: () => {
          console.log('Payment modal closed');
          console.log('Modal closed - this could be due to:');
          console.log('1. User cancelled payment');
          console.log('2. Invalid public key');
          console.log('3. Network error');
          console.log('4. Invalid payment configuration');
          config.onClose();
          // Don't reject immediately, let the user try again
        },
      });

      console.log('Opening Paystack iframe...');
      handler.openIframe();
    });
  }

  static loadPaystackScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.PaystackPop) {
        console.log('Paystack script already loaded');
        resolve();
        return;
      }

      console.log('Loading Paystack script...');
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.onload = () => {
        console.log('Paystack script loaded successfully');
        resolve();
      };
      script.onerror = () => {
        console.error('Failed to load Paystack script');
        reject(new Error('Failed to load Paystack script'));
      };
      document.head.appendChild(script);
    });
  }
}
