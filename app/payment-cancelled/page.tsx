"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PaymentCancelledPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear pending payment
    sessionStorage.removeItem('pendingPayment');
    
    // If this is in a popup, close it and notify parent
    if (window.opener) {
      console.log('❌ Payment cancelled in popup');
      
      // Try to communicate with parent window
      try {
        window.opener.postMessage({
          type: 'PAYMENT_CANCELLED'
        }, window.location.origin);
      } catch (e) {
        console.error('Could not communicate with parent window:', e);
      }
      
      // Close popup after short delay
      setTimeout(() => {
        window.close();
      }, 1500);
    } else {
      // Not in popup, redirect to tickets page
      setTimeout(() => {
        router.push('/tickets');
      }, 2000);
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
      <div className="text-center p-8">
        <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
        <p className="text-gray-600 mb-4">Your payment was cancelled. No charges were made.</p>
        <p className="text-sm text-gray-500">Closing window...</p>
      </div>
    </div>
  );
}
