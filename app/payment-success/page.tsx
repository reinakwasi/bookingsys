"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing your payment...');

  useEffect(() => {
    const reference = searchParams.get('reference');
    
    if (reference) {
      console.log('🔍 Payment reference found:', reference);
      setMessage('Payment completed! Your ticket is being processed...');
      
      // The webhook will handle the ticket creation automatically
      // Just wait a moment and redirect to my-tickets
      setTimeout(() => {
        setStatus('success');
        setMessage('Ticket purchase completed successfully!');
        
        setTimeout(() => {
          router.push('/my-tickets?payment=success');
        }, 2000);
      }, 3000);
      
    } else {
      // Check for legacy sessionStorage method
      const pendingPaymentStr = sessionStorage.getItem('pendingPayment');
      
      if (pendingPaymentStr) {
        try {
          const pendingPayment = JSON.parse(pendingPaymentStr);
          console.log('✅ Payment successful (legacy):', pendingPayment);
          
          // Clear pending payment
          sessionStorage.removeItem('pendingPayment');
          
          // If this is in a popup, close it and notify parent
          if (window.opener) {
            console.log('🔄 Closing popup and notifying parent window');
            
            try {
              window.opener.postMessage({
                type: 'PAYMENT_SUCCESS',
                data: pendingPayment
              }, window.location.origin);
            } catch (e) {
              console.error('Could not communicate with parent window:', e);
            }
            
            setTimeout(() => {
              window.close();
            }, 1000);
          } else {
            setTimeout(() => {
              router.push('/my-tickets?payment=success');
            }, 2000);
          }
        } catch (error) {
          console.error('Error processing payment success:', error);
          setStatus('error');
          setMessage('Error processing payment. Please contact support.');
        }
      } else {
        // No payment reference found
        console.log('⚠️ No payment reference found, redirecting...');
        setTimeout(() => {
          router.push('/tickets');
        }, 1000);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {status === 'success' ? 'Payment Successful!' : status === 'error' ? 'Payment Error' : 'Processing Payment...'}
        </h1>
        <p className="text-gray-600 mb-4">{message}</p>
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse delay-75"></div>
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse delay-150"></div>
        </div>
      </div>
    </div>
  );
}
