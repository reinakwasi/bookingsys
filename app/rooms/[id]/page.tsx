"use client"

import { useParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Bed, Wifi, Coffee, Bath, Tv, Users } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"

// This would typically come from your API or database
const rooms = {
  1: {
    name: "Royal Suite",
    type: "royal_suite",
    description: "Luxurious room with ocean view and premium amenities",
    price: 500,
    images: [
      { src: "/room1.jpg", alt: "Expensive Room Main" },
      { src: "/view.jpg", alt: "Expensive Room View" },
      { src: "/poolview1.jpg", alt: "Expensive Room Pool View" },
    ],
    features: [
      { icon: Bed, text: "King Size Bed" },
      { icon: Wifi, text: "High-Speed WiFi" },
      { icon: Coffee, text: "Coffee Maker" },
      { icon: Bath, text: "Jacuzzi Bath" },
      { icon: Tv, text: "55\" Smart TV" },
      { icon: Users, text: "Up to 4 Guests" },
    ],
    longDescription: `Experience unparalleled luxury in our Royal Suite. This spacious room features a king-size bed, 
    premium amenities, and breathtaking ocean views. Enjoy the comfort of a private balcony, a luxurious bathroom with 
    a jacuzzi, and 24/7 room service. Perfect for those seeking the ultimate luxury experience.`,
  },
  2: {
    name: "Superior Room",
    type: "superior_room",
    description: "Comfortable room with modern amenities and city view",
    price: 250,
    images: [
      { src: "/room2.jpg", alt: "Standard Room Main" },
      { src: "/one.jpg", alt: "Standard Room Alt 1" },
      { src: "/two.jpg", alt: "Standard Room Alt 2" },
    ],
    features: [
      { icon: Bed, text: "Queen Size Bed" },
      { icon: Wifi, text: "High-Speed WiFi" },
      { icon: Coffee, text: "Coffee Maker" },
      { icon: Bath, text: "Modern Bathroom" },
      { icon: Tv, text: "43\" Smart TV" },
      { icon: Users, text: "Up to 3 Guests" },
    ],
    longDescription: `Our Standard Room offers the perfect balance of comfort and value. Featuring a queen-size bed, 
    modern amenities, and a city view, this room is ideal for both business and leisure travelers. Enjoy the convenience 
    of high-speed WiFi, a smart TV, and a well-appointed bathroom.`,
  },
  3: {
    name: "Classic Room",
    type: "classic_room",
    description: "Cozy room with essential amenities and garden view",
    price: 150,
    images: [
      { src: "/room3.jpg", alt: "Regular Room Main" },
      { src: "/three.jpg", alt: "Regular Room Alt 1" },
      { src: "/four.jpg", alt: "Regular Room Alt 2" },
    ],
    features: [
      { icon: Bed, text: "Double Bed" },
      { icon: Wifi, text: "Free WiFi" },
      { icon: Coffee, text: "Tea/Coffee" },
      { icon: Bath, text: "Private Bathroom" },
      { icon: Tv, text: "32\" TV" },
      { icon: Users, text: "Up to 2 Guests" },
    ],
    longDescription: `The Regular Room provides a comfortable and affordable stay with all essential amenities. 
    Enjoy a peaceful garden view, a cozy double bed, and a private bathroom. Perfect for budget-conscious travelers 
    who don't want to compromise on comfort.`,
  },
}

export default function RoomPage() {
  const params = useParams()
  const roomId = Number(params.id)
  const room = rooms[roomId as keyof typeof rooms]

  // Carousel state
  const [currentIndex, setCurrentIndex] = useState(0)

  // Check Availability modal state
  const [open, setOpen] = useState(false)
  const [checkIn, setCheckIn] = useState<Date | undefined>()
  const [checkOut, setCheckOut] = useState<Date | undefined>()
  const [guests, setGuests] = useState(1)
  const [checked, setChecked] = useState(false)
  const [error, setError] = useState("")

  // Auto-rotate images
  useEffect(() => {
    setCurrentIndex(0)
  }, [roomId])
  useEffect(() => {
    if (!room || !room.images || room.images.length === 0) return
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % room.images.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [room])

  const handlePrev = () => {
    if (!room || !room.images || room.images.length === 0) return
    setCurrentIndex((prev) => (prev - 1 + room.images.length) % room.images.length)
  }
  const handleNext = () => {
    if (!room || !room.images || room.images.length === 0) return
    setCurrentIndex((prev) => (prev + 1) % room.images.length)
  }

  // Reset modal state on close
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      setCheckIn(undefined)
      setCheckOut(undefined)
      setGuests(1)
      setChecked(false)
      setError("")
    }
  }

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!checkIn || !checkOut) {
      setError("Please select both check-in and check-out dates.")
      return
    }
    if (checkIn >= checkOut) {
      setError("Check-out date must be after check-in date.")
      return
    }
    if (guests < 1) {
      setError("Number of guests must be at least 1.")
      return
    }
    
    try {
      // Import the bookings API
      const { bookingsAPI } = await import('@/lib/api')
      
      // Check room availability
      const availability = await bookingsAPI.checkRoomAvailability(
        room.type, // Use room type as room ID
        checkIn.toISOString().split('T')[0],
        checkOut.toISOString().split('T')[0]
      )
      
      if (!availability.available) {
        setError(`${room.name} is fully booked for your selected dates. Please try different dates or contact us for assistance.`)
        return
      } else {
        console.log('✅ Room available:', availability);
      }
      
      setChecked(true)
    } catch (error) {
      console.error('Error checking availability:', error)
      setError('Unable to check availability. Please try again.')
    }
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Room not found</h1>
          <p className="text-slate-600 mb-8">The room you're looking for doesn't exist.</p>
          <Link href="/rooms">
            <Button className="bg-slate-900 hover:bg-slate-800 text-white">Back to Rooms</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="container px-4 py-16">
        <div className="mb-8">
          <Link href="/rooms">
            <Button variant="ghost" className="mb-4 hover:bg-slate-100">
              ← Back to Rooms
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div>
            <div className="relative h-[500px] rounded-2xl overflow-hidden bg-slate-100">
              <Image
                src={room.images[currentIndex].src}
                alt={room.images[currentIndex].alt}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg hover-transition"
                onClick={handlePrev}
                type="button"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6 text-slate-700" />
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg hover-transition"
                onClick={handleNext}
                type="button"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6 text-slate-700" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                {room.images.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 w-2 rounded-full transition-all duration-300 ${
                      idx === currentIndex ? "bg-white w-4" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Room Details */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-4">{room.name}</h1>
              <p className="text-lg text-slate-600 leading-relaxed">{room.longDescription}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {room.features.map((feature, index) => (
                <Card key={index} className="bg-white/50 backdrop-blur-sm border-0 shadow-sm hover:shadow-md hover-transition">
                  <CardContent className="flex items-center space-x-3 p-4">
                    <feature.icon className="h-5 w-5 text-slate-900" />
                    <span className="text-sm font-medium text-slate-900">{feature.text}</span>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                asChild 
                size="lg" 
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white"
              >
                <Link href={`/booking?roomType=${room.type}&roomId=${roomId}&roomName=${encodeURIComponent(room.name)}&price=${room.price}`}>Book Now</Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto border-slate-200 hover:bg-slate-50"
                onClick={() => setOpen(true)}
              >
                Check Availability
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Check Availability Modal */}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass-morphism border-2 border-[#C49B66]/20">
          <DialogHeader className="text-center pb-2">
            <DialogTitle className="text-2xl font-display font-bold text-slate-900">Check Availability</DialogTitle>
            <p className="text-slate-800 mt-1">Select your preferred dates and number of guests</p>
          </DialogHeader>
          {checked ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-green-600 text-xl font-bold mb-3">Room Available!</p>
              <p className="text-slate-600 mb-8">This room is available for your selected dates. Ready to book?</p>
              <div className="flex gap-4 justify-center">
                <Button 
                  className="gradient-gold hover:shadow-glow text-white font-bold px-8 py-3 rounded-2xl transition-all duration-300 transform hover:scale-105"
                  onClick={() => handleOpenChange(false)}
                >
                  Book Now
                </Button>
                <Button 
                  variant="outline"
                  className="border-2 border-slate-200 hover:border-[#C49B66] px-8 py-3 rounded-2xl"
                  onClick={() => handleOpenChange(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCheck} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="block text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">Check-in Date</label>
                  <div className="bg-white rounded-3xl p-0 border-2 border-[#C49B66]/30 shadow-2xl">
                    <Calendar 
                      selected={checkIn} 
                      onSelect={setCheckIn} 
                      mode="single" 
                      required 
                      initialFocus 
                      className="w-full rounded-3xl"
                      disabled={(date) => date < new Date()}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="block text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">Check-out Date</label>
                  <div className="bg-white rounded-3xl p-0 border-2 border-[#C49B66]/30 shadow-2xl">
                    <Calendar 
                      selected={checkOut} 
                      onSelect={setCheckOut} 
                      mode="single" 
                      required 
                      initialFocus 
                      className="w-full rounded-3xl"
                      disabled={(date) => {
                        const today = new Date()
                        return date < today || (checkIn ? date <= checkIn : false)
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <label className="block text-lg font-semibold text-slate-900">Number of Guests</label>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={guests}
                  onChange={e => setGuests(Number(e.target.value))}
                  className="w-full h-14 border-2 border-slate-200 rounded-2xl px-6 text-lg focus:outline-none focus:ring-2 focus:ring-[#C49B66]/20 focus:border-[#C49B66] transition-all duration-300"
                  required
                />
              </div>
              {error && (
                <div className="text-red-600 bg-red-50 border border-red-200 p-4 rounded-2xl">
                  {error}
                </div>
              )}
              <Button 
                type="submit" 
                size="lg"
                className="w-full h-14 gradient-gold hover:shadow-glow text-white font-bold text-lg rounded-2xl transition-all duration-300 transform hover:scale-105"
              >
                Check Availability
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </main>
  )
}