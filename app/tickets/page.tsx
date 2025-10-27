"use client";

import { useState, useEffect } from "react";
import { ticketsAPI, ticketPurchasesAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, DollarSign, Users, MapPin, Minus, Plus, CheckCircle, X, Sparkles, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { PaystackService } from "@/lib/paystack";

export default function TicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false); // Disabled loading for faster experience
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Track initial load
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [customerForm, setCustomerForm] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [purchaseDetails, setPurchaseDetails] = useState<any>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isConfirmingBooking, setIsConfirmingBooking] = useState(false);
  const [loadingTicketId, setLoadingTicketId] = useState<string | null>(null);

  useEffect(() => {
    loadTickets();
    
    // Check Paystack configuration (client-side check only)
    console.log('💳 Checking Paystack configuration...');
    const configValidation = PaystackService.validateClientConfiguration();
    if (!configValidation.isValid) {
      console.error('❌ Paystack configuration issues:', configValidation.issues);
    } else {
      console.log('✅ Paystack client configuration is properly set');
    }

    // Listen for messages from popup window
    const handleMessage = (event: MessageEvent) => {
      // Verify origin for security
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data.type === 'PAYMENT_SUCCESS') {
        console.log('✅ Payment successful (from popup):', event.data.data);
        toast.success('Payment completed successfully!');
        
        // Show success message
        setPurchaseDetails(event.data.data);
        setShowSuccessAlert(true);
        
        // Clear pending payment
        sessionStorage.removeItem('pendingPayment');
        
        // Remove overlay if exists
        const overlay = document.getElementById('payment-overlay');
        if (overlay && document.body.contains(overlay)) {
          document.body.removeChild(overlay);
        }
      } else if (event.data.type === 'PAYMENT_CANCELLED') {
        console.log('❌ Payment cancelled (from popup)');
        toast.error('Payment was cancelled');
        
        // Clear pending payment
        sessionStorage.removeItem('pendingPayment');
        
        // Remove overlay if exists
        const overlay = document.getElementById('payment-overlay');
        if (overlay && document.body.contains(overlay)) {
          document.body.removeChild(overlay);
        }
      }
    };

    window.addEventListener('message', handleMessage);

    // Cleanup
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const loadTickets = async () => {
    try {
      // Remove loading state for instant display
      console.log('🎫 Loading tickets...');
      
      const allTickets = await ticketsAPI.getAll();
      console.log('🎫 Fetched tickets:', allTickets?.length || 0);
      console.log('🎫 All tickets data:', allTickets);
      
      // Filter for active tickets with future dates (hide only expired tickets from users)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const activeTickets = allTickets.filter((ticket: any) => {
        const eventDate = new Date(ticket.event_date);
        eventDate.setHours(0, 0, 0, 0);
        const isExpired = eventDate < today;
        const isSoldOut = ticket.available_quantity <= 0;
        
        console.log(`🎫 Ticket "${ticket.title}":`, {
          eventDate: eventDate.toDateString(),
          isExpired,
          isSoldOut,
          available_quantity: ticket.available_quantity,
          status: ticket.status,
          willShow: !isExpired && (ticket.status === 'active' || ticket.status === 'sold_out')
        });
        
        // Show tickets that are active OR sold_out AND have future dates
        // Sold out tickets should still be visible with SOLD OUT tag
        return eventDate >= today && (ticket.status === 'active' || ticket.status === 'sold_out');
      });
      
      console.log('🎫 Active tickets:', activeTickets?.length || 0);
      setTickets(activeTickets);
      setIsInitialLoad(false);
    } catch (error) {
      console.error('❌ Failed to load tickets:', error);
      toast.error('Failed to load tickets');
      setIsInitialLoad(false);
    }
  };

  const handlePurchaseClick = (ticket: any) => {
    setLoadingTicketId(ticket.id);
    // Reduced delay for faster experience
    setTimeout(() => {
      setSelectedTicket(ticket);
      setQuantity(1);
      setCustomerForm({ name: '', email: '', phone: '' });
      setIsPurchaseDialogOpen(true);
      setLoadingTicketId(null);
    }, 200);
  };

  const handlePurchase = async () => {
    if (!selectedTicket || !customerForm.name || !customerForm.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Prevent multiple simultaneous payment attempts
    if (isProcessingPayment) {
      console.log('Payment already in progress, ignoring duplicate request');
      return;
    }

    setIsProcessingPayment(true);
    
    try {
      // Validate Paystack configuration (client-side check)
      const configValidation = PaystackService.validateClientConfiguration();
      if (!configValidation.isValid) {
        throw new Error(`Payment system not configured: ${configValidation.issues.join(', ')}`);
      }

      // Generate unique reference for this payment attempt
      const reference = PaystackService.generateReference(`TKT${selectedTicket.id.substring(0, 8)}`);
      
      console.log('🚀 Initializing Paystack payment with reference:', reference);

      // Initialize payment with Paystack via API
      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: selectedTicket.price * quantity,
          email: customerForm.email,
          customerName: customerForm.name,
          customerPhone: customerForm.phone,
          metadata: {
            reference: reference,
            ticket_id: selectedTicket.id,
            ticket_title: selectedTicket.title,
            quantity: quantity,
            customer_name: customerForm.name,
            customer_phone: customerForm.phone,
            customer_email: customerForm.email,
            description: `${quantity}x ${selectedTicket.title} - Hotel 734`
          }
        })
      });

      console.log('📡 API Response status:', response.status, response.statusText);

      // Check if response is OK before parsing JSON
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`Payment initialization failed: ${response.status} ${response.statusText}`);
      }

      // Parse JSON response
      let initResult;
      try {
        initResult = await response.json();
        console.log('📋 Parsed API response:', initResult);
      } catch (jsonError) {
        console.error('❌ Failed to parse API response as JSON:', jsonError);
        const responseText = await response.text();
        console.error('❌ Raw response:', responseText);
        throw new Error('Invalid response from payment API. Please check server logs.');
      }

      if (!initResult.success || !initResult.authorization_url) {
        throw new Error(initResult.error || 'Failed to initialize payment');
      }

      console.log('✅ Payment initialized successfully');
      console.log('🔗 Paystack authorization URL:', initResult.authorization_url);

      // Store payment details for verification later
      sessionStorage.setItem('pendingPayment', JSON.stringify({
        reference: reference,
        ticketId: selectedTicket.id,
        ticketTitle: selectedTicket.title,
        quantity: quantity,
        totalAmount: selectedTicket.price * quantity,
        customerName: customerForm.name,
        customerEmail: customerForm.email,
        customerPhone: customerForm.phone
      }));

      // Close the form dialog
      setIsPurchaseDialogOpen(false);

      // Show loading message
      toast.info('Opening Paystack payment...');

      // Load Paystack inline script if not already loaded
      if (!window.PaystackPop) {
        const script = document.createElement('script');
        script.src = 'https://js.paystack.co/v1/inline.js';
        script.onload = () => {
          openPaystackPopup();
        };
        document.head.appendChild(script);
      } else {
        openPaystackPopup();
      }

      function openPaystackPopup() {
        console.log('🚀 Opening Paystack popup');
        
        const handler = window.PaystackPop.setup({
          key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
          email: customerForm.email,
          amount: Math.round((selectedTicket.price * quantity) * 100), // Convert to pesewas
          currency: 'GHS', // Ghana Cedis
          ref: reference,
          metadata: {
            ticket_id: selectedTicket.id,
            ticket_title: selectedTicket.title,
            quantity: quantity,
            customer_name: customerForm.name,
            customer_phone: customerForm.phone,
            description: `${quantity}x ${selectedTicket.title} - Hotel 734`
          },
          callback: function(response: any) {
            console.log('✅ Paystack payment successful:', response);
            toast.success('Payment completed successfully!');
            
            // Verify payment on server
            handlePaymentSuccess(response.reference);
          },
          onClose: function() {
            console.log('❌ Paystack popup closed');
            toast.info('Payment cancelled. Click "Pay Now" to try again.');
            setIsProcessingPayment(false);
          }
        });

        handler.openIframe();
      }

    } catch (error: any) {
      console.error('❌ Payment initialization error:', error);
      toast.error(error.message || 'Failed to initialize payment');
      handlePaymentError(error.message || 'Payment initialization failed');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePaymentSuccess = async (reference: string) => {
    try {
      console.log('✅ Starting payment success handling for reference:', reference);
      
      // Get pending payment details from session storage
      const pendingPaymentStr = sessionStorage.getItem('pendingPayment');
      const pendingPayment = pendingPaymentStr ? JSON.parse(pendingPaymentStr) : null;

      if (!pendingPayment) {
        console.error('❌ No pending payment found in session');
        toast.error('Payment details not found. Please contact support.');
        return;
      }

      // Verify payment with backend
      const verifyResponse = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reference: reference
        })
      });

      console.log('🔍 Verification response status:', verifyResponse.status, verifyResponse.statusText);
      
      let verificationResult;
      try {
        verificationResult = await verifyResponse.json();
        console.log('📋 Payment verification response:', verificationResult);
      } catch (jsonError) {
        console.error('❌ Failed to parse verification response as JSON:', jsonError);
        const responseText = await verifyResponse.text();
        console.error('❌ Raw verification response:', responseText);
        toast.error('Payment verification failed: Invalid response from server');
        return;
      }
      
      // Handle non-200 status codes
      if (!verifyResponse.ok) {
        console.error('❌ Verification API returned error status:', verifyResponse.status);
        const errorMessage = verificationResult?.error || `Server error: ${verifyResponse.status} ${verifyResponse.statusText}`;
        toast.error(`Payment verification failed: ${errorMessage}`);
        return;
      }
      
      if (!verificationResult.success || !verificationResult.isPaid) {
        console.error('❌ Payment verification failed:', verificationResult);
        
        // Provide specific error messages based on the failure reason
        if (verificationResult.responseCode === 'IP_NOT_WHITELISTED') {
          toast.error('Payment verification failed: Server IP not whitelisted with Hubtel. Please contact support.');
          console.error('📝 Contact Hubtel support to whitelist server IP for payment verification');
        } else {
          toast.error(verificationResult.error || 'Payment verification failed. Please contact support if payment was completed.');
        }
        return;
      }

      // Create ticket purchase record
      const purchaseData = {
        ticket_id: pendingPayment.ticketId,
        customer_name: pendingPayment.customerName,
        customer_email: pendingPayment.customerEmail,
        customer_phone: pendingPayment.customerPhone,
        quantity: pendingPayment.quantity,
        total_amount: pendingPayment.totalAmount,
        payment_status: 'completed',
        payment_reference: reference,
        payment_method: 'hubtel'
      };
      
      // Show success alert immediately after payment verification
      setPurchaseDetails({
        ticketTitle: pendingPayment.ticketTitle,
        quantity: pendingPayment.quantity,
        total: pendingPayment.totalAmount.toFixed(2),
        customerName: pendingPayment.customerName,
        customerEmail: pendingPayment.customerEmail,
        paymentReference: reference,
        paymentMethod: PaystackService.getPaymentMethodName(verificationResult.data?.channel || 'paystack')
      });
      
      // Show success alert immediately - no delay
      setShowSuccessAlert(true);
      toast.success(`Payment successful! Tickets purchased.`);
      
      // Clear session storage
      sessionStorage.removeItem('pendingPayment');
      
      // Reset form immediately
      setSelectedTicket(null);
      setQuantity(1);
      setCustomerForm({ name: '', email: '', phone: '' });
      
      // Create ticket purchase record in background (don't wait for it)
      // NOTE: Email and SMS notifications are automatically sent by ticketPurchasesAPI.create()
      // in database.ts - no need to send them here to avoid duplicates
      ticketPurchasesAPI.create(purchaseData).then(purchase => {
        console.log('✅ Ticket purchase created:', purchase);
        console.log('📧 Email and SMS notifications sent automatically by ticketPurchasesAPI');
        
        // Refresh tickets after background creation
        loadTickets();
      }).catch(error => {
        console.error('❌ Background ticket creation error:', error);
        // Don't show error to user since payment was successful
      });
    } catch (error) {
      console.error('❌ Purchase completion error:', error);
      if (error instanceof Error) {
        toast.error(`Payment successful but ticket creation failed: ${error.message}`);
      } else {
        toast.error('Payment successful but ticket creation failed. Please contact support.');
      }
    }
  };

  const handlePaymentError = (error: string) => {
    toast.error(error);
    // Reopen the purchase dialog after a short delay
    setTimeout(() => {
      setIsPurchaseDialogOpen(true);
    }, 300);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Loading removed for faster navigation experience

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black relative overflow-hidden">
      {/* Dynamic background pattern */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-amber-500/10 to-yellow-500/10"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-400/5 via-transparent to-yellow-400/5"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-amber-400/15 to-yellow-400/15 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-yellow-400/15 to-orange-400/15 rounded-full blur-3xl animate-float-slow" style={{animationDelay: '2s'}}></div>
      </div>
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-amber-600 to-yellow-600 text-white py-12 sm:py-16 lg:py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container-responsive text-center z-10">
          <h1 className="text-responsive-4xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-amber-100 via-yellow-100 to-white bg-clip-text text-transparent">
            Hotel 734 Experiences
          </h1>
          <p className="text-responsive-base opacity-90 max-w-2xl mx-auto">
            Discover unforgettable activities and experiences at our luxury hotel
          </p>
        </div>
      </div>

      {/* Tickets Section */}
      <div className="container-responsive py-12 sm:py-16 relative z-10">
        {isInitialLoad ? (
          // Show skeleton loading that looks like tickets
          <>
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-responsive-2xl font-bold text-amber-100 mb-3 sm:mb-4">
                Available Experiences
              </h2>
              <p className="text-responsive-base text-amber-200/80 max-w-2xl mx-auto">
                Book your spot for these exclusive hotel activities and experiences
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-3xl overflow-hidden border border-amber-400/20 shadow-2xl animate-pulse">
                  <div className="h-48 bg-slate-700/50"></div>
                  <div className="p-6 sm:p-8">
                    <div className="h-6 bg-slate-600/50 rounded mb-4"></div>
                    <div className="h-4 bg-slate-600/30 rounded mb-2"></div>
                    <div className="h-4 bg-slate-600/30 rounded mb-4 w-3/4"></div>
                    <div className="h-12 bg-amber-500/30 rounded-xl"></div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12 sm:py-16 lg:py-20">
            <div className="text-4xl sm:text-5xl lg:text-6xl mb-4 sm:mb-6">🎟️</div>
            <h2 className="text-responsive-2xl font-bold text-amber-100 mb-3 sm:mb-4">No Tickets Available</h2>
            <p className="text-responsive-base text-amber-200/80">
              We're currently preparing exciting new experiences for you. Please check back soon!
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-responsive-2xl font-bold text-amber-100 mb-3 sm:mb-4">
                Available Experiences
              </h2>
              <p className="text-responsive-base text-amber-200/80 max-w-2xl mx-auto">
                Book your spot for these exclusive hotel activities and experiences
              </p>
            </div>

            <div className="grid grid-responsive-3 gap-6 sm:gap-8">
              {tickets.map((ticket) => {
                const isOutOfStock = ticket.available_quantity <= 0;
                return (
                  <div
                    key={ticket.id}
                    className="relative group"
                  >
                    {/* Glowing border effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 rounded-2xl sm:rounded-3xl blur-xl opacity-40 group-hover:opacity-70 hover-transition"></div>
                    
                    <div className="relative bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-amber-400/20 hover-transition hover:scale-[1.02]">
                      {ticket.image_url && (
                        <div className="w-full bg-gradient-to-br from-amber-400/20 to-yellow-500/20 relative overflow-hidden">
                          <img
                            src={ticket.image_url}
                            alt={ticket.title}
                            className={`w-full h-auto object-cover hover-transition ${isOutOfStock ? 'grayscale opacity-50' : 'group-hover:scale-105'}`}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                          
                          {/* Stock status indicator */}
                          <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                            {isOutOfStock ? (
                              <span className="bg-red-500/90 backdrop-blur-sm text-white px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-semibold">
                                SOLD OUT
                              </span>
                            ) : (
                              <span className="bg-amber-500/90 backdrop-blur-sm text-white px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-semibold">
                                {ticket.activity_type}
                              </span>
                            )}
                          </div>
                          
                          {/* Low stock indicator (without showing exact numbers) */}
                          {!isOutOfStock && ticket.available_quantity <= 5 && (
                            <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4">
                              <span className="bg-orange-500/90 backdrop-blur-sm text-white px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-semibold animate-pulse">
                                Limited spots left!
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="p-4 sm:p-6">
                        <h3 className={`text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 ${isOutOfStock ? 'text-gray-400' : 'text-white'}`}>
                          {ticket.title}
                        </h3>
                        
                        <p className={`text-sm sm:text-base mb-3 sm:mb-4 line-clamp-3 ${isOutOfStock ? 'text-gray-500' : 'text-slate-300'}`}>
                          {ticket.description}
                        </p>

                        <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                          <div className={`flex items-center ${isOutOfStock ? 'text-gray-500' : 'text-amber-200'}`}>
                            <Calendar className={`h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 ${isOutOfStock ? 'text-gray-500' : 'text-amber-400'}`} />
                            <span className="text-sm sm:text-base">{formatDate(ticket.event_date)}</span>
                          </div>
                          
                          <div className={`flex items-center ${isOutOfStock ? 'text-gray-500' : 'text-amber-200'}`}>
                            <Clock className={`h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 ${isOutOfStock ? 'text-gray-500' : 'text-amber-400'}`} />
                            <span className="text-sm sm:text-base">
                              {formatTime(ticket.event_time)}
                            </span>
                          </div>

                          {ticket.venue && (
                            <div className={`flex items-center ${isOutOfStock ? 'text-gray-500' : 'text-amber-200'}`}>
                              <MapPin className={`h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 ${isOutOfStock ? 'text-gray-500' : 'text-amber-400'}`} />
                              <span className="text-sm sm:text-base">{ticket.venue}</span>
                            </div>
                          )}

                          <div className={`flex items-center ${isOutOfStock ? 'text-gray-500' : 'text-amber-200'}`}>
                            <Users className={`h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 ${isOutOfStock ? 'text-gray-500' : 'text-amber-400'}`} />
                            <span className="text-sm sm:text-base">
                              {isOutOfStock ? 'Sold Out' : 'Available for booking'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div className={`text-2xl sm:text-3xl font-bold ${isOutOfStock ? 'text-gray-500' : 'text-amber-400'}`}>
                            GHC {ticket.price}
                          </div>
                          
                          <Button
                            onClick={() => handlePurchaseClick(ticket)}
                            disabled={isOutOfStock || loadingTicketId === ticket.id}
                            className={`${isOutOfStock
                              ? 'bg-gray-600 cursor-not-allowed'
                              : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400'
                            } text-white px-4 sm:px-6 py-2 rounded-lg sm:rounded-xl font-semibold hover-transition text-sm sm:text-base disabled:opacity-50`}
                          >
                            {loadingTicketId === ticket.id ? (
                              <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Loading...
                              </div>
                            ) : isOutOfStock ? 'Sold Out' : 'Purchase Ticket'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Purchase Dialog */}
      <Dialog open={isPurchaseDialogOpen} onOpenChange={setIsPurchaseDialogOpen}>
        <DialogContent className="w-[95vw] max-w-sm sm:max-w-md mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book Your Experience</DialogTitle>
          </DialogHeader>
          
          {selectedTicket && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-3 sm:p-4 rounded-lg border border-amber-200">
                <h3 className="font-semibold text-sm sm:text-base lg:text-lg mb-2 text-amber-900 leading-tight">{selectedTicket.title}</h3>
                <div className="text-xs sm:text-sm text-amber-700 space-y-1.5">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-amber-600" />
                    <span className="text-xs sm:text-sm break-words">{formatDate(selectedTicket.event_date)} at {formatTime(selectedTicket.event_time)}</span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-amber-600" />
                    <span className="text-xs sm:text-sm">GHC {selectedTicket.price} per person</span>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="quantity" className="text-sm sm:text-base font-medium">Quantity</Label>
                <div className="flex items-center gap-3 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="h-8 w-8 sm:h-9 sm:w-9"
                  >
                    <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <span className="w-12 text-center font-semibold text-base">{quantity}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.min(selectedTicket.available_quantity || selectedTicket.total_quantity, quantity + 1))}
                    disabled={quantity >= (selectedTicket.available_quantity || selectedTicket.total_quantity)}
                    className="h-8 w-8 sm:h-9 sm:w-9"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="name" className="text-sm sm:text-base font-medium">Full Name *</Label>
                <Input
                  id="name"
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                  className="h-11 text-base mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-sm sm:text-base font-medium">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email"
                  className="h-11 text-base mt-1"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm sm:text-base font-medium">Phone Number</Label>
                <Input
                  id="phone"
                  value={customerForm.phone}
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter your phone number"
                  className="h-11 text-base mt-1"
                />
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-3 sm:p-4 rounded-lg border border-amber-200">
                <div className="flex justify-between items-center text-base sm:text-lg font-semibold">
                  <span className="text-amber-900">Total Amount:</span>
                  <span className="text-amber-600">
                    GHC {(selectedTicket.price * quantity).toFixed(2)}
                  </span>
                </div>
              </div>


              <div className="flex flex-col gap-3 pt-4">
                <Button
                  onClick={handlePurchase}
                  disabled={isConfirmingBooking || isProcessingPayment}
                  className="w-full h-12 text-base bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {isConfirmingBooking ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <Sparkles className="h-4 w-4" />
                      Confirming Booking...
                      <Sparkles className="h-4 w-4" />
                    </div>
                  ) : isProcessingPayment ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing Payment...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Pay Now
                    </div>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsPurchaseDialogOpen(false)}
                  className="w-full h-11 text-base"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Beautiful Custom Success Alert */}
      {showSuccessAlert && purchaseDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-[95vw] max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto">
            {/* Glowing background effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 rounded-2xl blur-xl opacity-60 animate-glow"></div>
            
            <div className="relative bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-amber-400/30 shadow-2xl">
              {/* Close button */}
              <button
                onClick={() => setShowSuccessAlert(false)}
                className="absolute top-4 right-4 text-amber-200 hover:text-white transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Success icon with animation */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full blur-lg opacity-60 animate-pulse"></div>
                  <div className="relative bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-3 border border-green-300/30 shadow-xl">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>

              {/* Success message */}
              <div className="text-center mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2 flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
                  <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400 animate-pulse" />
                  <span>Purchase Successful!</span>
                  <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400 animate-pulse" />
                </h3>
                <p className="text-amber-200/80 text-sm sm:text-base">Your tickets have been confirmed</p>
              </div>

              {/* Purchase details */}
              <div className="space-y-3 mb-4 sm:mb-6">
                <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-lg p-4 border border-amber-400/20">
                  <h4 className="font-semibold text-amber-100 mb-3 text-sm sm:text-base leading-tight">{purchaseDetails.ticketTitle}</h4>
                  
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-amber-200/80 flex-shrink-0">Customer:</span>
                      <span className="text-white font-medium text-right break-words">{purchaseDetails.customerName}</span>
                    </div>
                    
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-amber-200/80 flex-shrink-0">Email:</span>
                      <span className="text-white font-medium text-right break-all text-xs sm:text-sm">{purchaseDetails.customerEmail}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-amber-200/80">Quantity:</span>
                      <span className="text-white font-medium">{purchaseDetails.quantity} ticket{purchaseDetails.quantity > 1 ? 's' : ''}</span>
                    </div>
                    
                    <div className="border-t border-amber-400/20 pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-amber-200 font-semibold text-sm sm:text-base">Total Amount:</span>
                        <span className="text-amber-400 font-bold text-base sm:text-lg">GHC {purchaseDetails.total}</span>
                      </div>
                      
                      {purchaseDetails.paymentReference && (
                        <div className="flex justify-between items-center mt-2 gap-2">
                          <span className="text-amber-200/80 text-xs flex-shrink-0">Payment Ref:</span>
                          <span className="text-amber-300 text-xs font-mono break-all text-right">{purchaseDetails.paymentReference}</span>
                        </div>
                      )}
                      
                      {purchaseDetails.paymentMethod && (
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-amber-200/80 text-xs">Payment Method:</span>
                          <span className="text-amber-300 text-xs capitalize">{purchaseDetails.paymentMethod}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Next steps */}
                <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg p-4 border border-blue-400/20">
                  <h5 className="font-semibold text-blue-200 mb-2 flex items-center gap-2 text-sm sm:text-base">
                    <Calendar className="h-4 w-4" />
                    What's Next?
                  </h5>
                  <ul className="text-xs sm:text-sm text-blue-200/80 space-y-1">
                    <li>• Check your email for Hotel 734 ticket confirmation with QR codes</li>
                    <li>• Individual QR codes for each ticket will be in your email</li>
                    <li>• You can download and share individual tickets</li>
                    <li>• Present QR codes at the event entrance</li>
                    <li>• Arrive 15 minutes before event time</li>
                  </ul>
                </div>
              </div>

              {/* Action button */}
              <Button
                onClick={() => setShowSuccessAlert(false)}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-white font-semibold py-3 h-12 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-amber-500/30 text-base"
              >
                Perfect! Got it
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
