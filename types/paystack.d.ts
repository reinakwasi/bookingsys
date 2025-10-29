/**
 * Paystack TypeScript Definitions
 * For Paystack Inline JS integration
 */

interface PaystackOptions {
  key: string | undefined;
  email: string;
  amount: number;
  currency: string; // Required: 'GHS', 'NGN', 'USD', 'ZAR', etc.
  ref: string;
  metadata?: Record<string, any>;
  channels?: string[];
  customer?: {
    email: string;
    phone: string;
    first_name: string;
    last_name: string;
  };
  onClose?: () => void;
  callback?: (response: PaystackResponse) => void;
}

interface PaystackResponse {
  reference: string;
  status: string;
  message: string;
  trans: string;
  transaction: string;
  trxref: string;
}

interface PaystackHandler {
  openIframe: () => void;
  closeIframe: () => void;
}

interface PaystackPop {
  setup: (options: PaystackOptions) => PaystackHandler;
}

interface Window {
  PaystackPop: PaystackPop;
}

declare const PaystackPop: PaystackPop;
