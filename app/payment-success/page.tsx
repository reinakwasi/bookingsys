"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get payment reference from URL or sessionStorage
    const pendingPaymentStr = sessionStorage.getItem('pendingPayment');
    
    if (pendingPaymentStr) {
      try {
        const pendingPayment = JSON.parse(pendingPaymentStr);
        console.log('✅ Payment successful:', pendingPayment);
        
        // Clear pending payment
        sessionStorage.removeItem('pendingPayment');
        
        // If this is in a popup, close it and notify parent
        if (window.opener) {
          console.log('🔄 Closing popup and notifying parent window');
          
          // Try to communicate with parent window
          try {
            window.opener.postMessage({
              type: 'PAYMENT_SUCCESS',
              data: pendingPayment
            }, window.location.origin);
          } catch (e) {
            console.error('Could not communicate with parent window:', e);
          }
          
          // Close popup after short delay
          setTimeout(() => {
            window.close();
          }, 1000);
        } else {
          // Not in popup, redirect to tickets page with success message
          setTimeout(() => {
            router.push('/tickets?payment=success');
          }, 1000);
        }
      } catch (error) {
        console.error('Error processing payment success:', error);
        if (window.opener) {
          window.close();
        } else {
          router.push('/tickets');
        }
      }
    } else {
      // No pending payment, redirect to tickets
      if (window.opener) {
        window.close();
      } else {
        router.push('/tickets');
      }
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="text-center p-8">
        <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-4">Processing your ticket purchase...</p>
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse delay-75"></div>
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse delay-150"></div>
        </div>
      </div>
    </div>
  );
}
