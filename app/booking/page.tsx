"use client"

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { CalendarIcon, User, Mail, Phone, Users, Bed, Sparkles, CheckCircle2 } from 'lucide-react'
import { useCustomAlert } from '@/components/ui/CustomAlert'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { calculateNights, formatNights, validateBookingDates } from '@/lib/dateUtils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const formSchema = z
  .object({
    name: z.string().min(2, {
      message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    phone: z.string().min(10, {
      message: "Phone number must be at least 10 digits.",
    }),
    checkIn: z.date({
      required_error: "Check-in date is required.",
    }),
    checkOut: z.date({
      required_error: "Check-out date is required.",
    }),
    roomType: z.string({
      required_error: "Please select a room type.",
    }),
    guests: z.string().min(1, {
      message: "Please enter the number of guests.",
    }),
  })
  .refine((data) => data.checkOut > data.checkIn, {
    message: "Check-out date must be after check-in date.",
    path: ["checkOut"],
  })

export default function BookingPage() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [checkInOpen, setCheckInOpen] = useState(false)
  const [checkOutOpen, setCheckOutOpen] = useState(false)
  const { showError, showSuccess, CustomAlert } = useCustomAlert()
  const searchParams = useSearchParams()
  
  // Get URL parameters for pre-filled room booking
  const roomType = searchParams.get('roomType')
  const roomId = searchParams.get('roomId')
  const roomName = searchParams.get('roomName')
  const price = searchParams.get('price')
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      guests: "1",
      roomType: roomType || "",
    },
  })
  
  // Update form when URL params change
  useEffect(() => {
    if (roomType) {
      form.setValue('roomType', roomType)
    }
  }, [roomType, form])

  // Calculate total price based on dates and room type
  function calculateTotalPrice(checkIn: Date, checkOut: Date, roomType: string): number {
    if (!checkIn || !checkOut || !roomType) return 0
    
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    const pricePerNight = getRoomPrice(roomType)
    return nights * pricePerNight
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      // Import the bookings API
      const { bookingsAPI, authAPI } = await import('@/lib/api')
      
      // Check room availability before booking
      const startDate = values.checkIn.toISOString().split('T')[0];
      const endDate = values.checkOut.toISOString().split('T')[0];
      
      console.log('🔍 Checking availability before booking submission...');
      const availability = await bookingsAPI.checkRoomAvailability(values.roomType, startDate, endDate);
      
      console.log('📊 Availability check result:', availability);
      
      // Prevent booking if no rooms available
      if (!availability.available || availability.availableRooms <= 0) {
        const roomTypeName = values.roomType === 'royal_suite' ? 'Royal Suite' : 
                           values.roomType === 'superior_room' ? 'Superior Room' : 
                           values.roomType === 'classic_room' ? 'Classic Room' : values.roomType;
        
        showError(
          'Room Unavailable',
          `We apologize, but no ${roomTypeName} rooms are available for your selected dates (${startDate} to ${endDate}).`,
          [
            'All rooms of this type are fully booked for these dates.',
            'Please try selecting different dates or consider another room type.',
            'Our team is happy to help you find alternative accommodations.'
          ]
        );
        
        // Scroll to top to ensure alert is visible
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return; // Stop booking process
      }
      
      // Calculate total price based on dates
      const totalPrice = calculateTotalPrice(values.checkIn, values.checkOut, values.roomType)
      
      // Create booking data
      const bookingData = {
        guest_name: values.name,
        email: values.email,
        phone: values.phone,
        start_date: startDate,
        end_date: endDate,
        guests_count: parseInt(values.guests),
        booking_type: 'room',
        item_id: values.roomType,
        total_price: totalPrice,
        special_requests: ''
      }
      
      console.log('✅ Availability confirmed, submitting booking...')
      // Save to database
      const booking = await bookingsAPI.create(bookingData)
      
      console.log('🎉 Booking saved successfully!')
      
      // Show success immediately
      setIsSubmitted(true)
      
      // Scroll to top to ensure success message is visible
      window.scrollTo({ top: 0, behavior: 'smooth' })
      
      // Send notifications asynchronously (don't block UI)
      const { notificationService } = await import('@/lib/notificationService')
      
      const roomTypeName = values.roomType === 'royal_suite' ? 'Royal Suite' : 
                         values.roomType === 'superior_room' ? 'Superior Room' : 
                         values.roomType === 'classic_room' ? 'Classic Room' : values.roomType;
      
      notificationService.sendBookingConfirmation({
        guestName: values.name,
        email: values.email,
        phone: values.phone,
        bookingType: 'room',
        itemName: roomTypeName,
        startDate: startDate,
        endDate: endDate,
        totalPrice: totalPrice,
        bookingId: booking.id || `ROOM_${Date.now()}`,
        specialRequests: ''
      }).then(notificationResults => {
        console.log('📧📱 Notification results:', notificationResults);
      }).catch(notificationError => {
        console.error('⚠️ Notification sending failed:', notificationError);
      });
    } catch (error: any) {
      console.error('❌ Booking failed:', error?.message || 'Unknown error')
      
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
        
        // Scroll to top to ensure alert is visible
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
        
        // Scroll to top to ensure alert is visible
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } finally {
      setIsLoading(false);
    }
  }
  
  function getRoomPrice(roomType: string): number {
    const prices = {
      'royal_suite': 350,
      'superior_room': 300,
      'classic_room': 250,
      // Legacy support for old names
      'expensive': 350,
      'standard': 300,
      'regular': 250
    }
    return prices[roomType as keyof typeof prices] || 0
  }

  if (isSubmitted) {
    return (
      <main className="bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden" style={{ minHeight: 'calc(100vh - 200px)' }}>
        {/* Floating background elements */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-[#C49B66]/20 to-[#F4E4BC]/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-green-200/30 to-emerald-200/30 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="container-responsive py-12 sm:py-16 lg:py-24 max-w-2xl mx-auto relative z-10" style={{ minHeight: 'calc(100vh - 300px)' }}>
          <div className="text-center mb-8 sm:mb-12 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-full glass-morphism text-green-600 mb-6 sm:mb-8 animate-glow">
              <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 animate-pulse" />
              <span className="text-sm sm:text-base font-medium">Reservation Confirmed</span>
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 animate-spin-slow" />
            </div>
          </div>
          
          <div className="glass-morphism rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 shadow-luxury text-center animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 animate-bounce">
              <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
            
            <h1 className="text-responsive-2xl font-display font-bold mb-4 sm:mb-6 text-slate-800">Booking Successful!</h1>
            <p className="text-responsive-base text-slate-600 leading-relaxed mb-6 sm:mb-8">
              Your luxury reservation has been confirmed. We've sent a detailed confirmation email with all your booking information and special instructions.
            </p>
            
            <div className="bg-gradient-to-r from-[#C49B66]/10 to-amber-100/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
              <p className="text-sm sm:text-base text-slate-700 font-medium">
                🎉 Welcome to Hotel 734 - Where luxury meets exceptional service
              </p>
            </div>
            
            <Button 
              onClick={() => setIsSubmitted(false)}
              size="lg" 
              className="w-full sm:w-auto gradient-gold hover:shadow-glow text-white font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-105"
            >
              <Bed className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Make Another Booking
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden" style={{ minHeight: 'calc(100vh - 200px)' }}>
      {/* Floating background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-[#C49B66]/20 to-[#F4E4BC]/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-[#C49B66]/10 to-amber-200/20 rounded-full blur-3xl animate-float" style={{animationDelay: '4s'}}></div>
      </div>
      
      <div className="container-responsive py-12 sm:py-16 lg:py-24 relative z-10" style={{ minHeight: 'calc(100vh - 300px)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-full glass-morphism text-[#C49B66] mb-6 sm:mb-8 animate-glow">
              <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" />
              <span className="text-sm sm:text-base font-medium">Luxury Reservations</span>
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 animate-spin-slow" />
            </div>
            <h1 className="text-responsive-4xl font-display font-bold mb-6 sm:mb-8 text-gradient">Book Your Stay</h1>
            <p className="text-responsive-base text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Reserve your luxurious escape at Hotel 734. Fill out the elegant form below to secure your perfect accommodation.
            </p>
          </div>

          <div className="glass-morphism rounded-2xl sm:rounded-3xl shadow-luxury animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <div className="p-6 sm:p-8 lg:p-12">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-responsive-2xl font-display font-bold mb-3 sm:mb-4 text-slate-800">Reservation Form</h2>
                <p className="text-responsive-base text-slate-600">
                  Please provide your details to complete your luxury booking experience.
                </p>
              </div>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="group">
                          <FormLabel className="text-slate-700 font-semibold flex items-center gap-2">
                            <User className="h-4 w-4 text-[#C49B66]" />
                            Full Name
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="John Doe" 
                              {...field} 
                              className="h-12 sm:h-14 rounded-xl sm:rounded-2xl border-2 border-slate-200 focus:border-[#C49B66] focus:ring-[#C49B66]/20 transition-all duration-300 text-base sm:text-lg px-4 sm:px-6 group-hover:border-[#C49B66]/50"
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="group">
                          <FormLabel className="text-slate-700 font-semibold flex items-center gap-2">
                            <Mail className="h-4 w-4 text-[#C49B66]" />
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="john.doe@example.com" 
                              {...field} 
                              className="h-12 sm:h-14 rounded-xl sm:rounded-2xl border-2 border-slate-200 focus:border-[#C49B66] focus:ring-[#C49B66]/20 transition-all duration-300 text-base sm:text-lg px-4 sm:px-6 group-hover:border-[#C49B66]/50"
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem className="group">
                          <FormLabel className="text-slate-700 font-semibold flex items-center gap-2">
                            <Phone className="h-4 w-4 text-[#C49B66]" />
                            Phone Number
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="+233 123 456 789" 
                              {...field} 
                              className="h-12 sm:h-14 rounded-xl sm:rounded-2xl border-2 border-slate-200 focus:border-[#C49B66] focus:ring-[#C49B66]/20 transition-all duration-300 text-base sm:text-lg px-4 sm:px-6 group-hover:border-[#C49B66]/50"
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="guests"
                      render={({ field }) => (
                        <FormItem className="group">
                          <FormLabel className="text-slate-700 font-semibold flex items-center gap-2">
                            <Users className="h-4 w-4 text-[#C49B66]" />
                            Number of Guests
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              {...field} 
                              className="h-12 sm:h-14 rounded-xl sm:rounded-2xl border-2 border-slate-200 focus:border-[#C49B66] focus:ring-[#C49B66]/20 transition-all duration-300 text-base sm:text-lg px-4 sm:px-6 group-hover:border-[#C49B66]/50"
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="checkIn"
                      render={({ field }) => (
                        <FormItem className="flex flex-col group">
                          <FormLabel className="text-slate-700 font-semibold flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-[#C49B66]" />
                            Check-in Date
                          </FormLabel>
                          <Popover open={checkInOpen} onOpenChange={setCheckInOpen}>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={`h-12 sm:h-14 rounded-xl sm:rounded-2xl border-2 border-slate-200 hover:border-[#C49B66] focus:border-[#C49B66] transition-all duration-300 text-base sm:text-lg px-4 sm:px-6 justify-start group-hover:border-[#C49B66]/50 ${!field.value && "text-slate-500"}`}
                                >
                                  {field.value ? format(field.value, "PPP") : <span>Select date</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 sm:h-5 sm:w-5 text-[#C49B66]" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto max-w-[calc(100vw-1rem)] p-0 bg-white border-2 border-[#C49B66]/30 shadow-2xl rounded-3xl mx-2 sm:mx-0" align="start" sideOffset={12}>
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => {
                                  field.onChange(date);
                                  setCheckInOpen(false);
                                }}
                                className="rounded-3xl"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="checkOut"
                      render={({ field }) => (
                        <FormItem className="flex flex-col group">
                          <FormLabel className="text-slate-700 font-semibold flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-[#C49B66]" />
                            Check-out Date
                          </FormLabel>
                          <Popover open={checkOutOpen} onOpenChange={setCheckOutOpen}>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={`h-12 sm:h-14 rounded-xl sm:rounded-2xl border-2 border-slate-200 hover:border-[#C49B66] focus:border-[#C49B66] transition-all duration-300 text-base sm:text-lg px-4 sm:px-6 justify-start group-hover:border-[#C49B66]/50 ${!field.value && "text-slate-500"}`}
                                >
                                  {field.value ? format(field.value, "PPP") : <span>Select date</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 sm:h-5 sm:w-5 text-[#C49B66]" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto max-w-[calc(100vw-1rem)] p-0 bg-white border-2 border-[#C49B66]/30 shadow-2xl rounded-3xl mx-2 sm:mx-0" align="start" sideOffset={12}>
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => {
                                  field.onChange(date);
                                  setCheckOutOpen(false);
                                }}
                                disabled={(date) => {
                                  const checkIn = form.getValues("checkIn")
                                  if (!checkIn) return false
                                  // Must be at least 1 day after check-in
                                  const checkInDate = new Date(checkIn)
                                  const nextDay = new Date(checkInDate)
                                  nextDay.setDate(checkInDate.getDate() + 1)
                                  return date < nextDay
                                }}
                                className="rounded-3xl"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Show room type selection only if not pre-selected from room details */}
                  {!roomType ? (
                    <FormField
                      control={form.control}
                      name="roomType"
                      render={({ field }) => (
                        <FormItem className="group">
                          <FormLabel className="text-slate-700 font-semibold flex items-center gap-2">
                            <Bed className="h-4 w-4 text-[#C49B66]" />
                            Room Type
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 sm:h-14 rounded-xl sm:rounded-2xl border-2 border-slate-200 focus:border-[#C49B66] focus:ring-[#C49B66]/20 transition-all duration-300 text-base sm:text-lg px-4 sm:px-6 group-hover:border-[#C49B66]/50">
                                <SelectValue placeholder="Select a room type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="glass-morphism border-2 border-[#C49B66]/20 rounded-2xl">
                              <SelectItem value="royal_suite" className="text-lg py-4 px-6 hover:bg-[#C49B66]/10 rounded-xl">
                                <div className="flex items-center justify-between w-full">
                                  <span>Royal Suite</span>
                                  <span className="text-[#C49B66] font-bold">GHC 500</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="superior_room" className="text-lg py-4 px-6 hover:bg-[#C49B66]/10 rounded-xl">
                                <div className="flex items-center justify-between w-full">
                                  <span>Superior Room</span>
                                  <span className="text-[#C49B66] font-bold">GHC 250</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="classic_room" className="text-lg py-4 px-6 hover:bg-[#C49B66]/10 rounded-xl">
                                <div className="flex items-center justify-between w-full">
                                  <span>Classic Room</span>
                                  <span className="text-[#C49B66] font-bold">GHC 150</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription className="text-slate-600">
                            Select the type of luxury accommodation you would like to book.
                          </FormDescription>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                  ) : (
                    /* Show selected room info when pre-selected */
                    <div className="glass-morphism rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-[#C49B66]/20">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <Bed className="h-4 w-4 sm:h-5 sm:w-5 text-[#C49B66]" />
                        <span className="text-base sm:text-lg font-semibold text-slate-700">Selected Room</span>
                      </div>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-lg sm:text-xl font-bold text-slate-800">{roomName}</span>
                        <span className="text-lg sm:text-xl font-bold text-[#C49B66]">GHC {price} / night</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 mt-2">Room type has been pre-selected from your room choice.</p>
                    </div>
                  )}
                  
                  {/* Price Summary */}
                  {(form.watch("checkIn") && form.watch("checkOut") && form.watch("roomType")) && (
                    <div className="glass-morphism rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-emerald-200/50 bg-emerald-50/30">
                      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-xs sm:text-sm">₵</span>
                        </div>
                        <span className="text-base sm:text-lg font-semibold text-slate-700">Booking Summary</span>
                      </div>
                      {(() => {
                        const checkIn = form.watch("checkIn")
                        const checkOut = form.watch("checkOut")
                        const roomType = form.watch("roomType")
                        const nights = checkIn && checkOut ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) : 0
                        const pricePerNight = getRoomPrice(roomType)
                        const totalPrice = calculateTotalPrice(checkIn, checkOut, roomType)
                        
                        return (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-slate-600">Room Type:</span>
                              <span className="font-semibold text-slate-800 capitalize">{roomType} Room</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-600">Price per night:</span>
                              <span className="font-semibold text-slate-800">GHC {pricePerNight}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-600">Number of nights:</span>
                              <span className="font-semibold text-slate-800">{nights} {nights === 1 ? 'night' : 'nights'}</span>
                            </div>
                            <div className="border-t border-slate-200 pt-3">
                              <div className="flex justify-between items-center">
                                <span className="text-base sm:text-lg font-bold text-slate-800">Total Amount:</span>
                                <span className="text-xl sm:text-2xl font-bold text-emerald-600">GHC {totalPrice}</span>
                              </div>
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  )}
                  <div className="pt-6 sm:pt-8 border-t border-slate-200">
                    <Button 
                      type="submit" 
                      size="lg"
                      disabled={isLoading}
                      className={`w-full h-14 sm:h-16 gradient-gold hover:shadow-glow text-white font-bold text-lg sm:text-xl rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                        isLoading ? 'opacity-80 cursor-not-allowed' : ''
                      }`}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                          <span>Processing Booking...</span>
                        </div>
                      ) : (
                        <>
                          <Sparkles className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 animate-pulse" />
                          Confirm Booking
                          <Sparkles className="ml-2 sm:ml-3 h-5 w-5 sm:h-6 sm:w-6 animate-pulse" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
      
      {/* Custom Alert Component */}
      <CustomAlert />
    </main>
  )
}
