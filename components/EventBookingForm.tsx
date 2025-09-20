'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { bookingsAPI } from '@/lib/api';
import { notificationService } from '@/lib/notificationService';
import { Calendar, Users, Clock, CheckCircle, AlertCircle, Search } from 'lucide-react';

const bookingSchema = z.object({
  guestName: z.string().min(1, 'Guest name is required'),
  email: z.union([
    z.string().email('Invalid email address'),
    z.string().length(0)
  ]).optional(),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  numberOfGuests: z.number().min(1, 'Number of guests is required'),
  eventType: z.string().min(1, 'Event type is required'),
  specialRequests: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface EventBookingFormProps {
  eventId: string;
  eventType: string;
  price: number;
  capacity: number;
  onSuccess?: () => void;
}

export default function EventBookingForm({
  eventId,
  eventType,
  price,
  capacity,
  onSuccess,
}: EventBookingFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState<'available' | 'unavailable' | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      numberOfGuests: 1,
    },
  });

  const numberOfGuests = watch('numberOfGuests');
  const startDate = watch('startDate');
  const endDate = watch('endDate');

  const calculateTotalPrice = () => {
    const days = calculateDays();
    return price * days;
  };

  const calculateDays = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, diffDays);
  };

  const checkAvailability = async () => {
    if (!startDate || !endDate) return;
    
    setIsCheckingAvailability(true);
    
    try {
      // Use the new event availability checking method
      const availability = await bookingsAPI.checkEventAvailability(eventId, startDate);
      
      setAvailabilityStatus(availability.available ? 'available' : 'unavailable');
      
      if (!availability.available) {
        toast.error('This event date is already booked. Please select a different date.');
      } else {
        toast.success(`Event is available for your selected date!`);
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      setAvailabilityStatus('unavailable');
      toast.error('Unable to check availability. Please try again.');
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const onSubmit = async (data: BookingFormData) => {
    try {
      console.log('🔄 Setting event booking loading state to true');
      setIsLoading(true);
      
      // Add a small delay to make loading state visible
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Final availability check before booking submission
      console.log('🔍 Final availability check before booking submission...');
      const availability = await bookingsAPI.checkEventAvailability(eventId, data.startDate);
      
      if (!availability.available) {
        toast.error('Event is no longer available for the selected date.');
        setAvailabilityStatus('unavailable');
        return;
      }
      
      const booking = await bookingsAPI.create({
        guest_name: data.guestName,
        email: data.email || '',
        phone: data.phone,
        start_date: data.startDate,
        end_date: data.endDate,
        guests_count: data.numberOfGuests,
        booking_type: 'event',
        item_id: eventId,
        total_price: calculateTotalPrice(),
        special_requests: data.specialRequests || '',
      });
      
      // Show success message immediately
      toast.success('Event booking request submitted successfully!');
      
      // Create and show styled alert modal
      const alertModal = document.createElement('div');
      alertModal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm';
      alertModal.innerHTML = `
        <div class="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-8 max-w-md mx-4 shadow-2xl border-2 border-emerald-200 animate-fade-in-up">
          <div class="text-center">
            <div class="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-slate-800 mb-4">Booking Confirmed!</h3>
            <div class="space-y-2 text-left bg-white/50 rounded-2xl p-4 mb-6">
              <div class="flex justify-between">
                <span class="text-slate-600 font-medium">Event:</span>
                <span class="text-slate-800 font-bold">${eventType}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600 font-medium">Guest:</span>
                <span class="text-slate-800 font-bold">${data.guestName}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600 font-medium">Dates:</span>
                <span class="text-slate-800 font-bold">${data.startDate} to ${data.endDate}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600 font-medium">Duration:</span>
                <span class="text-slate-800 font-bold">${calculateDays()} day(s)</span>
              </div>
              <div class="border-t border-slate-200 pt-2 mt-2">
                <div class="flex justify-between">
                  <span class="text-slate-700 font-bold text-lg">Total:</span>
                  <span class="text-emerald-600 font-bold text-xl">$${calculateTotalPrice()}</span>
                </div>
              </div>
            </div>
            <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                    class="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg">
              Continue
            </button>
          </div>
        </div>
      `;
      
      document.body.appendChild(alertModal);
      
      // Auto-remove after 10 seconds
      setTimeout(() => {
        if (alertModal.parentNode) {
          alertModal.remove();
        }
      }, 10000);
      
      onSuccess?.();
      
      // Send notifications asynchronously (don't block UI)
      notificationService.sendBookingConfirmation({
        guestName: data.guestName,
        email: data.email || undefined,
        phone: data.phone,
        bookingType: 'event',
        itemName: `${eventType} - ${data.eventType}`,
        startDate: data.startDate,
        endDate: data.endDate,
        totalPrice: calculateTotalPrice(),
        bookingId: booking.id || `EVENT_${Date.now()}`,
        specialRequests: data.specialRequests
      }).then(notificationResults => {
        console.log('📧📱 Event notification results:', notificationResults);
      }).catch(notificationError => {
        console.error('⚠️ Event notification sending failed:', notificationError);
      });
    } catch (error: any) {
      console.error('Event booking error:', error);
      
      // Handle specific availability errors from atomic validation
      if (error.message && error.message.includes('already booked')) {
        toast.error('Event is no longer available for the selected date.');
      } else {
        toast.error('Failed to submit event booking request. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-3xl overflow-hidden border border-amber-400/30 shadow-2xl">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-yellow-400/20 rounded-t-3xl"></div>
        <div className="relative bg-gradient-to-r from-amber-500/25 to-yellow-500/25 p-6 border-b border-amber-400/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full p-2 shadow-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white drop-shadow-lg">Book {eventType} Event</h3>
          </div>
          <p className="text-amber-100 drop-shadow-md">Fill out the details below to reserve your event space</p>
        </div>
      </div>
      
      <div className="p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-amber-400" />
              Personal Information
            </h4>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="guestName" className="text-amber-100 font-medium">Guest Name *</Label>
                <Input
                  id="guestName"
                  placeholder="Enter your full name"
                  className="bg-slate-800/50 border-amber-400/30 focus:border-amber-400 focus:ring-amber-400/50 text-white placeholder:text-slate-400"
                  {...register('guestName')}
                  disabled={isLoading}
                />
                {errors.guestName && (
                  <p className="text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.guestName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-amber-100 font-medium">Email Address (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com (optional)"
                  className="bg-slate-800/50 border-amber-400/30 focus:border-amber-400 focus:ring-amber-400/50 text-white placeholder:text-slate-400"
                  {...register('email')}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-amber-100 font-medium">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+233 XX XXX XXXX"
                  className="bg-slate-800/50 border-amber-400/30 focus:border-amber-400 focus:ring-amber-400/50 text-white placeholder:text-slate-400"
                  {...register('phone')}
                  disabled={isLoading}
                />
                {errors.phone && (
                  <p className="text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="numberOfGuests" className="text-amber-100 font-medium">Number of Guests *</Label>
                <Input
                  id="numberOfGuests"
                  type="number"
                  min="1"
                  max={capacity}
                  placeholder="1"
                  className="bg-slate-800/50 border-amber-400/30 focus:border-amber-400 focus:ring-amber-400/50 text-white placeholder:text-slate-400"
                  {...register('numberOfGuests', { valueAsNumber: true })}
                  disabled={isLoading}
                />
                {errors.numberOfGuests && (
                  <p className="text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.numberOfGuests.message}
                  </p>
                )}
                <p className="text-sm text-amber-300 font-medium">
                  Maximum capacity: {capacity} guests
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventType" className="text-amber-100 font-medium">Event Type *</Label>
                <select
                  id="eventType"
                  className="w-full bg-slate-800/50 border border-amber-400/30 focus:border-amber-400 focus:ring-amber-400/50 text-white placeholder:text-slate-400 rounded-md px-3 py-2"
                  {...register('eventType')}
                  disabled={isLoading}
                >
                  <option value="">Select event type</option>
                  {eventId === 'compound' && (
                    <>
                      <option value="Wedding">Wedding</option>
                      <option value="Birthday Party">Birthday Party</option>
                      <option value="Corporate Event">Corporate Event</option>
                      <option value="Family Reunion">Family Reunion</option>
                      <option value="Anniversary">Anniversary</option>
                      <option value="Graduation Party">Graduation Party</option>
                      <option value="Other Celebration">Other Celebration</option>
                    </>
                  )}
                  {eventId === 'conference' && (
                    <>
                      <option value="Business Meeting">Business Meeting</option>
                      <option value="Conference">Conference</option>
                      <option value="Workshop">Workshop</option>
                      <option value="Seminar">Seminar</option>
                      <option value="Training Session">Training Session</option>
                      <option value="Product Launch">Product Launch</option>
                      <option value="Board Meeting">Board Meeting</option>
                    </>
                  )}
                </select>
                {errors.eventType && (
                  <p className="text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.eventType.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Event Dates */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
              <Calendar className="h-5 w-5 text-amber-400" />
              Event Dates
            </h4>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-amber-100 font-medium">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  className="bg-slate-800/50 border-amber-400/30 focus:border-amber-400 focus:ring-amber-400/50 text-white placeholder:text-slate-400"
                  {...register('startDate')}
                  disabled={isLoading}
                  onChange={(e) => {
                    setValue('startDate', e.target.value);
                    setAvailabilityStatus(null);
                  }}
                />
                {errors.startDate && (
                  <p className="text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.startDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-amber-100 font-medium">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  min={startDate || new Date().toISOString().split('T')[0]}
                  className="bg-slate-800/50 border-amber-400/30 focus:border-amber-400 focus:ring-amber-400/50 text-white placeholder:text-slate-400"
                  {...register('endDate')}
                  disabled={isLoading}
                  onChange={(e) => {
                    setValue('endDate', e.target.value);
                    setAvailabilityStatus(null);
                  }}
                />
                {errors.endDate && (
                  <p className="text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.endDate.message}
                  </p>
                )}
              </div>
            </div>
            
            {/* Check Availability Button */}
            <div className="flex items-center gap-4">
              <Button
                type="button"
                onClick={checkAvailability}
                disabled={isCheckingAvailability || !startDate || !endDate}
                className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-amber-100 font-semibold px-6 py-2 rounded-lg border border-amber-400/30 hover:border-amber-400/50 transition-all duration-300"
              >
                <Search className="mr-2 h-4 w-4" />
                {isCheckingAvailability ? 'Checking...' : 'Check Availability'}
              </Button>
              
              {availabilityStatus && (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  availabilityStatus === 'available' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {availabilityStatus === 'available' ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <span className="font-medium">
                    {availabilityStatus === 'available' ? 'Available' : 'Not Available'}
                  </span>
                </div>
              )}
            </div>
            
            {startDate && endDate && (
              <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 p-4 rounded-lg border border-amber-400/30">
                <div className="flex items-center gap-2 text-amber-200">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">Duration: {calculateDays()} day(s)</span>
                </div>
              </div>
            )}
          </div>

          <Separator className="my-6" />

          {/* Special Requests */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white mb-2">Special Requests</h4>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent mb-4"></div>
            <div className="space-y-2">
              <Label htmlFor="specialRequests" className="text-amber-100 font-medium">Additional Requirements (Optional)</Label>
              <Textarea
                id="specialRequests"
                placeholder="Any special arrangements, dietary requirements, or additional services..."
                className="bg-slate-800/50 border-amber-400/30 focus:border-amber-400 focus:ring-amber-400/50 text-white placeholder:text-slate-400 min-h-[100px]"
                {...register('specialRequests')}
                disabled={isLoading}
              />
            </div>
          </div>

          <Separator className="my-6" />

          {/* Pricing Summary */}
          <div className="bg-gradient-to-r from-amber-500/15 to-yellow-500/15 p-6 rounded-xl border border-amber-400/30 shadow-inner">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-amber-400" />
              Booking Summary
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-amber-200">Base Price per Day:</span>
                <span className="font-semibold text-white">${price}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-amber-200">Number of Guests:</span>
                <span className="font-semibold text-white">{numberOfGuests || 1}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-amber-200">Duration:</span>
                <span className="font-semibold text-white">{calculateDays()} day(s)</span>
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between items-center text-lg">
                <span className="font-bold text-white">Total Price:</span>
                <span className="text-2xl font-bold text-amber-300 drop-shadow-lg">${calculateTotalPrice()}</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className={`w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-900 font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-amber-500/30 border border-amber-300/50 text-lg ${
              isLoading ? 'opacity-80 cursor-not-allowed' : ''
            }`}
            disabled={isLoading || availabilityStatus === 'unavailable'}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-900 mr-3"></div>
                <span>Processing Booking...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Calendar className="mr-2 h-5 w-5" />
                <span>Book Event Now</span>
              </div>
            )}
          </Button>
          
          {availabilityStatus === 'unavailable' && (
            <p className="text-center text-red-400 text-sm">
              Please check availability for different dates before booking.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}