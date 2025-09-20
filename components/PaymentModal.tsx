"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, Shield, Lock, CheckCircle, X, Loader2 } from "lucide-react";
import { PaystackService } from "@/lib/paystack";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketDetails: {
    id: string;
    title: string;
    price: number;
    quantity: number;
    total: number;
  };
  customerDetails: {
    name: string;
    email: string;
    phone: string;
  };
  onPaymentSuccess: (reference: string) => void;
  onPaymentError: (error: string) => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  ticketDetails,
  customerDetails,
  onPaymentSuccess,
  onPaymentError
}: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'confirm' | 'processing' | 'success'>('confirm');

  const handlePayment = async () => {
    setIsProcessing(true);
    setPaymentStep('processing');

    try {
      // Validate Paystack configuration
      const configValidation = PaystackService.validateConfiguration();
      if (!configValidation.isValid) {
        throw new Error(`Payment system not configured: ${configValidation.issues.join(', ')}`);
      }

      // Initialize payment
      const paymentData = {
        email: `noreply+${Date.now()}@hotel734.com`,
        amount: ticketDetails.total,
        metadata: {
          ticket_id: ticketDetails.id,
          ticket_title: ticketDetails.title,
          quantity: ticketDetails.quantity,
          customer_name: customerDetails.name,
          customer_phone: customerDetails.phone,
          real_customer_email: customerDetails.email
        }
      };

      const initResponse = await PaystackService.initializePayment(paymentData);

      // Open Paystack modal with custom styling
      await PaystackService.openPaymentModal({
        key: '',
        email: paymentData.email,
        amount: ticketDetails.total * 100,
        currency: 'GHS',
        ref: initResponse.data.reference,
        metadata: paymentData.metadata,
        callback: async (response: any) => {
          setPaymentStep('success');
          setTimeout(() => {
            onPaymentSuccess(response.reference);
            onClose();
          }, 1500);
        },
        onClose: () => {
          setIsProcessing(false);
          setPaymentStep('confirm');
          onClose();
        }
      });

    } catch (error) {
      console.error('Payment error:', error);
      setIsProcessing(false);
      setPaymentStep('confirm');
      onPaymentError(error instanceof Error ? error.message : 'Payment failed');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto p-0">
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-black rounded-lg overflow-hidden">
          {/* Header with Hotel 734 branding */}
          <div className="relative bg-gradient-to-r from-amber-600 to-yellow-600 p-6 text-white">
            <div className="absolute inset-0 bg-black/20"></div>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-white/20 rounded-full p-2">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Secure Payment</h2>
                  <p className="text-amber-100 text-sm">Hotel 734 Experience</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {paymentStep === 'confirm' && (
              <>
                {/* Order Summary */}
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-4 mb-6 border border-amber-200">
                  <h3 className="font-semibold text-amber-900 mb-3">Order Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-amber-700">Experience:</span>
                      <span className="text-amber-900 font-medium">{ticketDetails.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-700">Quantity:</span>
                      <span className="text-amber-900 font-medium">{ticketDetails.quantity} ticket{ticketDetails.quantity > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-700">Price per ticket:</span>
                      <span className="text-amber-900 font-medium">GHC {ticketDetails.price}</span>
                    </div>
                    <div className="border-t border-amber-300 pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-amber-800 font-semibold">Total Amount:</span>
                        <span className="text-amber-600 font-bold text-lg">GHC {ticketDetails.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="bg-slate-50 rounded-lg p-4 mb-6 border border-slate-200">
                  <h3 className="font-semibold text-slate-800 mb-3">Customer Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Name:</span>
                      <span className="text-slate-800 font-medium">{customerDetails.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Email:</span>
                      <span className="text-slate-800 font-medium text-xs break-all">{customerDetails.email}</span>
                    </div>
                    {customerDetails.phone && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Phone:</span>
                        <span className="text-slate-800 font-medium">{customerDetails.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Security Notice */}
                <div className="flex items-center gap-3 mb-6 p-3 bg-green-50 rounded-lg border border-green-200">
                  <Shield className="h-5 w-5 text-green-600" />
                  <div className="text-sm">
                    <p className="text-green-800 font-medium">Secure Payment</p>
                    <p className="text-green-600">Your payment is protected by Paystack's secure encryption</p>
                  </div>
                </div>

                {/* Payment Button */}
                <Button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full h-12 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-semibold text-base rounded-xl shadow-lg hover:shadow-amber-500/30 transition-all duration-300"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Opening Secure Payment...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Lock className="h-5 w-5" />
                      Pay Securely with Paystack
                    </div>
                  )}
                </Button>

                <p className="text-center text-xs text-slate-500 mt-3">
                  Powered by Paystack • Bank cards, Mobile money, Bank transfer
                </p>
              </>
            )}

            {paymentStep === 'processing' && (
              <div className="text-center py-8">
                <div className="mb-4">
                  <Loader2 className="h-12 w-12 animate-spin text-amber-500 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Processing Payment...</h3>
                <p className="text-slate-400">Please complete your payment in the Paystack window</p>
              </div>
            )}

            {paymentStep === 'success' && (
              <div className="text-center py-8">
                <div className="mb-4">
                  <div className="relative mx-auto w-16 h-16">
                    <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
                    <div className="relative bg-green-500 rounded-full p-4">
                      <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Payment Successful!</h3>
                <p className="text-slate-400">Redirecting to confirmation...</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
