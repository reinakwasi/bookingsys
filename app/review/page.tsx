import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Write a Review - Share Your Hotel 734 Experience",
  description: "Share your experience at Hotel 734. Write a review about your stay, rate our services, and help other guests discover our luxury accommodations and exceptional service.",
  keywords: ["hotel review", "Hotel 734 review", "guest feedback", "hotel rating", "customer testimonials", "hotel experience"],
  openGraph: {
    title: "Write a Review - Hotel 734",
    description: "Share your experience at Hotel 734. Write a review about your stay and help other guests discover our luxury accommodations.",
    url: "https://hotel734.com/review",
    images: [
      {
        url: "/review-og.jpg",
        width: 1200,
        height: 630,
        alt: "Hotel 734 - Write a Review",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Write a Review - Hotel 734",
    description: "Share your experience at Hotel 734. Write a review about your stay and help other guests.",
    images: ["/review-og.jpg"],
  },
}

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Send, CheckCircle, Heart, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function ReviewPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking');
  
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [guestName, setGuestName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  useEffect(() => {
    if (bookingId) {
      // Fetch booking details for display
      fetchBookingDetails();
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`);
      if (response.ok) {
        const booking = await response.json();
        setBookingDetails(booking);
        setGuestName(booking.guest_name || '');
        setEmail(booking.email || '');
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
    }
  };

  const handleStarClick = (starIndex: number) => {
    setRating(starIndex);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rating) {
      toast.error('Please select a rating');
      return;
    }
    
    if (!reviewText.trim()) {
      toast.error('Please write a review');
      return;
    }
    
    if (!guestName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/submit-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          rating,
          reviewText,
          guestName,
          email,
          bookingDetails
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        toast.success('Thank you for your review!');
      } else {
        throw new Error('Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!bookingId) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-slate-800 mb-4">Invalid Review Link</h1>
            <p className="text-slate-600">This review link is not valid or has expired.</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
        {/* Floating background elements */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-[#C49B66]/20 to-[#F4E4BC]/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-green-200/30 to-emerald-200/30 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="container py-24 max-w-2xl mx-auto relative z-10">
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass-morphism text-green-600 mb-8 animate-glow">
              <CheckCircle className="h-6 w-6 animate-pulse" />
              <span className="font-medium">Review Submitted</span>
              <Heart className="h-5 w-5 animate-pulse" />
            </div>
          </div>
          
          <div className="glass-morphism rounded-3xl p-12 shadow-luxury text-center animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            
            <h1 className="text-4xl font-display font-bold mb-6 text-slate-800">Thank You! 🌟</h1>
            <p className="text-lg text-slate-600 leading-relaxed mb-8">
              Your review has been submitted successfully. We truly appreciate your feedback and will use it to improve our services.
            </p>
            
            <div className="bg-gradient-to-r from-[#C49B66]/10 to-amber-100/20 rounded-2xl p-6 mb-8">
              <p className="text-slate-700 font-medium">
                🎉 Your review helps other guests and helps us serve you better in the future!
              </p>
            </div>
            
            <Button 
              onClick={() => window.location.href = '/'}
              size="lg" 
              className="gradient-gold hover:shadow-glow text-white font-bold px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105"
            >
              <Heart className="mr-2 h-5 w-5" />
              Return to Hotel 734
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
      {/* Floating background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-[#C49B66]/20 to-[#F4E4BC]/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-purple-200/30 to-pink-200/30 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-[#C49B66]/10 to-amber-200/20 rounded-full blur-3xl animate-float" style={{animationDelay: '4s'}}></div>
      </div>
      
      <div className="container py-24 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass-morphism text-[#C49B66] mb-8 animate-glow">
              <Star className="h-5 w-5 animate-pulse" />
              <span className="font-medium">Share Your Experience</span>
              <MessageSquare className="h-5 w-5 animate-pulse" />
            </div>
            <h1 className="text-6xl md:text-7xl font-display font-bold mb-8 text-gradient">Rate & Review</h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              We hope you had an amazing experience at Hotel 734. Your feedback helps us improve and serve you better.
            </p>
          </div>

          <div className="glass-morphism rounded-3xl shadow-luxury animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <div className="p-12">
              {bookingDetails && (
                <div className="bg-gradient-to-r from-[#C49B66]/10 to-amber-100/20 rounded-2xl p-6 mb-8">
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">📋 Your Stay Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600">Booking ID:</span>
                      <span className="font-semibold text-slate-800 ml-2">#{bookingId}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">{bookingDetails.booking_type === 'room' ? 'Room' : 'Event'}:</span>
                      <span className="font-semibold text-slate-800 ml-2">{bookingDetails.item_id}</span>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Rating Section */}
                <div className="text-center">
                  <Label className="text-slate-700 font-semibold text-lg mb-4 block">
                    How would you rate your experience?
                  </Label>
                  <div className="flex justify-center items-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleStarClick(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="transition-all duration-200 transform hover:scale-110"
                      >
                        <Star
                          className={`h-12 w-12 ${
                            star <= (hoveredRating || rating)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <p className="text-[#C49B66] font-medium">
                      {rating === 1 && "We're sorry to hear that 😔"}
                      {rating === 2 && "We'll work to improve 🤔"}
                      {rating === 3 && "Thank you for your feedback 😊"}
                      {rating === 4 && "We're glad you enjoyed your stay! 😄"}
                      {rating === 5 && "Wonderful! We're thrilled! 🌟"}
                    </p>
                  )}
                </div>

                {/* Review Text */}
                <div>
                  <Label htmlFor="reviewText" className="text-slate-700 font-semibold text-lg mb-3 block">
                    Tell us about your experience
                  </Label>
                  <Textarea
                    id="reviewText"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your thoughts about your stay, the service, amenities, or anything else you'd like us to know..."
                    className="min-h-[150px] rounded-2xl border-2 border-slate-200 focus:border-[#C49B66] focus:ring-[#C49B66]/20 transition-all duration-300 text-lg p-6"
                    required
                  />
                </div>

                {/* Guest Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="guestName" className="text-slate-700 font-semibold mb-3 block">
                      Your Name *
                    </Label>
                    <Input
                      id="guestName"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Enter your name"
                      className="h-14 rounded-2xl border-2 border-slate-200 focus:border-[#C49B66] focus:ring-[#C49B66]/20 transition-all duration-300 text-lg px-6"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-slate-700 font-semibold mb-3 block">
                      Email (Optional)
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="h-14 rounded-2xl border-2 border-slate-200 focus:border-[#C49B66] focus:ring-[#C49B66]/20 transition-all duration-300 text-lg px-6"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-8 border-t border-slate-200">
                  <Button 
                    type="submit" 
                    size="lg"
                    disabled={isSubmitting || !rating || !reviewText.trim() || !guestName.trim()}
                    className="w-full h-16 gradient-gold hover:shadow-glow text-white font-bold text-xl rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <Send className="mr-3 h-6 w-6" />
                    {isSubmitting ? 'Submitting Review...' : 'Submit Review'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
