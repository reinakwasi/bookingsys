'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { bookingsAPI } from '@/lib/api'
import { useCustomAlert } from '@/components/ui/CustomAlert'
import { notificationService } from '@/lib/notificationService'
import { User, Mail, Phone, Users, CalendarIcon, MessageSquare, Sparkles, Bed } from 'lucide-react'

const bookingSchema = z.object({
  guestName: z.string().min(1, 'Guest name is required'),
  email: z.union([
    z.string().email('Invalid email address'),
    z.string().length(0)
  ]).optional(),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  checkIn: z.string().min(1, 'Check-in date is required'),
  checkOut: z.string().min(1, 'Check-out date is required'),
  roomType: z.string().min(1, 'Room type is required'),
  specialRequests: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface RoomBookingFormProps {
  roomId: string;
  roomType: string;
  price: number;
  onSuccess?: () => void;
}

export default function RoomBookingForm({
  roomId,
  roomType,
  price,
  onSuccess,
}: RoomBookingFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { showError, showSuccess, CustomAlert } = useCustomAlert();

  // Debug logging for loading state
  console.log('🔍 RoomBookingForm - isLoading:', isLoading);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  const checkIn = watch('checkIn');
  const checkOut = watch('checkOut');

  const calculateTotalPrice = () => {
    if (!checkIn || !checkOut) return price;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return price * nights;
  };

  const onSubmit = async (data: BookingFormData) => {
    try {
      console.log('🔄 Setting loading state to true');
      setIsLoading(true);
      
      // Add a delay to make loading state visible
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check room availability before booking - use roomType instead of roomId
      const availability = await bookingsAPI.checkRoomAvailability(roomType, data.checkIn, data.checkOut);
      
      console.log('🔍 Booking form availability check:', availability);
      
      if (!availability.available || availability.availableRooms <= 0) {
        const roomTypeName = roomType === 'royal_suite' ? 'Royal Suite' : 
                           roomType === 'superior_room' ? 'Superior Room' : 
                           roomType === 'classic_room' ? 'Classic Room' : roomType;
        
        // Show toast immediately for instant feedback
        toast.error(`${roomTypeName} is fully booked for these dates. Please try different dates.`);
        
        // Show styled alert for booking denial
        showError(
          'Room Unavailable',
          `We apologize, but no ${roomTypeName} rooms are available for your selected dates (${data.checkIn} to ${data.checkOut}).`,
          [
            'All rooms of this type are fully booked for these dates.',
            'Please try selecting different dates or consider another room type.',
            'Our team is happy to help you find alternative accommodations.'
          ]
        );
        
        return;
      }
      
      // Create booking with roomType as item_id for proper tracking
      const booking = await bookingsAPI.create({
        guest_name: data.guestName,
        email: data.email || '',
        phone: data.phone,
        start_date: data.checkIn,
        end_date: data.checkOut,
        booking_type: 'room',
        item_id: roomType,
        total_price: calculateTotalPrice(),
        special_requests: data.specialRequests || '',
      });
      
      const roomTypeName = roomType === 'royal_suite' ? 'Royal Suite' : 
                         roomType === 'superior_room' ? 'Superior Room' : 
                         roomType === 'classic_room' ? 'Classic Room' : roomType;
      
      // Show success message immediately
      toast.success('Booking confirmed successfully!');
      
      // Show styled success alert immediately
      showSuccess(
        'BOOKING CONFIRMED!',
        `Your ${roomTypeName} has been successfully booked!`,
        [
          `Check-in: ${data.checkIn}`,
          `Check-out: ${data.checkOut}`,
          `Total Amount: GHC ${calculateTotalPrice()}`,
          data.email ? 'Confirmation email will be sent shortly!' : 'Confirmation details saved!'
        ]
      );
      
      onSuccess?.();
      
      // Send notifications asynchronously (don't block UI)
      notificationService.sendBookingConfirmation({
        guestName: data.guestName,
        email: data.email || undefined,
        phone: data.phone,
        bookingType: 'room',
        itemName: roomTypeName,
        startDate: data.checkIn,
        endDate: data.checkOut,
        totalPrice: calculateTotalPrice(),
        bookingId: booking.id || `ROOM_${Date.now()}`,
        specialRequests: data.specialRequests
      }).then(notificationResults => {
        console.log('📧📱 Notification results:', notificationResults);
      }).catch(notificationError => {
        console.error('⚠️ Notification sending failed:', notificationError);
      });
      
    } catch (error: any) {
      console.error('Booking error:', error);
      
      // Handle specific availability errors from atomic validation
      if (error.message && error.message.includes('rooms available')) {
        showError(
          'Room Unavailable',
          'The room became unavailable while processing your request.',
          [
            'Another guest may have just booked this room.',
            'Please try selecting different dates or another room type.',
            'We apologize for any inconvenience.'
          ]
        );
        toast.error('Room became unavailable. Please try different dates.');
      } else {
        showError(
          'Booking Failed',
          'We encountered an issue processing your booking request.',
          [
            'Please check your information and try again.',
            'If the problem persists, contact our support team.',
            'We apologize for the inconvenience.'
          ]
        );
        toast.error('Booking failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="glass-morphism rounded-3xl shadow-luxury overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-display font-bold mb-3 text-slate-800">Book {roomType}</h3>
            <p className="text-slate-600">Complete your luxury reservation</p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3 group">
                <Label htmlFor="guestName" className="text-slate-700 font-semibold flex items-center gap-2">
                  <User className="h-4 w-4 text-[#C49B66]" />
                  Guest Name
                </Label>
                <Input
                  id="guestName"
                  {...register('guestName')}
                  disabled={isLoading}
                  className="h-12 rounded-2xl border-2 border-slate-200 focus:border-[#C49B66] focus:ring-[#C49B66]/20 transition-all duration-300 px-4 group-hover:border-[#C49B66]/50"
                />
                {errors.guestName && (
                  <p className="text-sm text-red-500">{errors.guestName.message}</p>
                )}
              </div>

              <div className="space-y-3 group">
                <Label htmlFor="email" className="text-slate-700 font-semibold flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#C49B66]" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  disabled={isLoading}
                  className="h-12 rounded-2xl border-2 border-slate-200 focus:border-[#C49B66] focus:ring-[#C49B66]/20 transition-all duration-300 px-4 group-hover:border-[#C49B66]/50"
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-3 group">
                <Label htmlFor="phone" className="text-slate-700 font-semibold flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[#C49B66]" />
                  Phone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register('phone')}
                  disabled={isLoading}
                  className="h-12 rounded-2xl border-2 border-slate-200 focus:border-[#C49B66] focus:ring-[#C49B66]/20 transition-all duration-300 px-4 group-hover:border-[#C49B66]/50"
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>


              <div className="space-y-3 group">
                <Label htmlFor="checkIn" className="text-slate-700 font-semibold flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-[#C49B66]" />
                  Check-in Date
                </Label>
                <Input
                  id="checkIn"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  {...register('checkIn')}
                  disabled={isLoading}
                  className="h-12 rounded-2xl border-2 border-slate-200 focus:border-[#C49B66] focus:ring-[#C49B66]/20 transition-all duration-300 px-4 group-hover:border-[#C49B66]/50"
                />
                {errors.checkIn && (
                  <p className="text-sm text-red-500">{errors.checkIn.message}</p>
                )}
              </div>

              <div className="space-y-3 group">
                <Label htmlFor="checkOut" className="text-slate-700 font-semibold flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-[#C49B66]" />
                  Check-out Date
                </Label>
                <Input
                  id="checkOut"
                  type="date"
                  min={checkIn || new Date().toISOString().split('T')[0]}
                  {...register('checkOut')}
                  disabled={isLoading}
                  className="h-12 rounded-2xl border-2 border-slate-200 focus:border-[#C49B66] focus:ring-[#C49B66]/20 transition-all duration-300 px-4 group-hover:border-[#C49B66]/50"
                />
                {errors.checkOut && (
                  <p className="text-sm text-red-500">{errors.checkOut.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-3 group">
              <Label htmlFor="specialRequests" className="text-slate-700 font-semibold flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[#C49B66]" />
                Special Requests (Optional)
              </Label>
              <Input
                id="specialRequests"
                {...register('specialRequests')}
                disabled={isLoading}
                placeholder="Any special requirements or preferences..."
                className="h-12 rounded-2xl border-2 border-slate-200 focus:border-[#C49B66] focus:ring-[#C49B66]/20 transition-all duration-300 px-4 group-hover:border-[#C49B66]/50"
              />
            </div>

            <div className="border-t border-slate-200 pt-6">
              <div className="glass-morphism rounded-2xl p-6 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-slate-700">Total Price:</span>
                  <span className="text-2xl font-bold text-[#C49B66]">GHC {calculateTotalPrice()}</span>
                </div>
              </div>
              
              <Button 
                type="submit" 
                size="lg"
                className={`w-full h-14 gradient-gold hover:shadow-glow text-white font-bold text-lg rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                  isLoading ? 'opacity-80 cursor-not-allowed' : ''
                }`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    <span>Processing Booking...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Sparkles className="mr-2 h-5 w-5 animate-pulse" />
                    <span>Complete Booking</span>
                    <Bed className="ml-2 h-5 w-5" />
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Custom Alert Component */}
      <CustomAlert />
    </>
  );
}
