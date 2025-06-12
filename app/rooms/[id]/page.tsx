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
    name: "Luxury Suite",
    description: "Luxurious suite with ocean view and premium amenities",
    price: 300,
    images: [
      { src: "/room1.jpg", alt: "Luxury Suite Main" },
      { src: "/view.jpg", alt: "Luxury Suite View" },
      { src: "/poolview1.jpg", alt: "Luxury Suite Pool View" },
    ],
    features: [
      { icon: Bed, text: "King Size Bed" },
      { icon: Wifi, text: "High-Speed WiFi" },
      { icon: Coffee, text: "Coffee Maker" },
      { icon: Bath, text: "Jacuzzi Bath" },
      { icon: Tv, text: "55\" Smart TV" },
      { icon: Users, text: "Up to 4 Guests" },
    ],
    longDescription: `Experience unparalleled luxury in our Luxury Suite. This spacious suite features a king-size bed, 
    premium amenities, and breathtaking ocean views. Enjoy the comfort of a private balcony, a luxurious bathroom with 
    a jacuzzi, and 24/7 room service. Perfect for those seeking the ultimate luxury experience.`,
  },
  2: {
    name: "Deluxe Room",
    description: "Comfortable room with modern amenities and city view",
    price: 250,
    images: [
      { src: "/room2.jpg", alt: "Deluxe Room Main" },
      { src: "/one.jpg", alt: "Deluxe Room Alt 1" },
      { src: "/two.jpg", alt: "Deluxe Room Alt 2" },
    ],
    features: [
      { icon: Bed, text: "Queen Size Bed" },
      { icon: Wifi, text: "High-Speed WiFi" },
      { icon: Coffee, text: "Coffee Maker" },
      { icon: Bath, text: "Modern Bathroom" },
      { icon: Tv, text: "43\" Smart TV" },
      { icon: Users, text: "Up to 2 Guests" },
    ],
    longDescription: `Our Deluxe Room offers the perfect balance of comfort and value. Featuring a queen-size bed, 
    modern amenities, and a city view, this room is ideal for both business and leisure travelers. Enjoy the convenience 
    of high-speed WiFi, a smart TV, and a well-appointed bathroom.`,
  },
  3: {
    name: "Executive Suite",
    description: "Cozy room with essential amenities and garden view",
    price: 200,
    images: [
      { src: "/room3.jpg", alt: "Executive Suite Main" },
      { src: "/three.jpg", alt: "Executive Suite Alt 1" },
      { src: "/four.jpg", alt: "Executive Suite Alt 2" },
    ],
    features: [
      { icon: Bed, text: "Double Bed" },
      { icon: Wifi, text: "Free WiFi" },
      { icon: Coffee, text: "Tea/Coffee" },
      { icon: Bath, text: "Private Bathroom" },
      { icon: Tv, text: "32\" TV" },
      { icon: Users, text: "Up to 2 Guests" },
    ],
    longDescription: `The Executive Suite provides a comfortable and affordable stay with all essential amenities. 
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
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % room.images.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [room])

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + room.images.length) % room.images.length)
  }
  const handleNext = () => {
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

  const handleCheck = (e: React.FormEvent) => {
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
    setChecked(true)
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
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-300"
                onClick={handlePrev}
                type="button"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6 text-slate-700" />
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-300"
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
                <Card key={index} className="bg-white/50 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-all duration-300">
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
                <Link href="/booking">Book Now</Link>
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900">Check Availability</DialogTitle>
          </DialogHeader>
          {checked ? (
            <div className="text-center py-8">
              <p className="text-green-600 text-lg font-semibold mb-2">Available!</p>
              <p className="text-slate-600">This room is available for your selected dates.</p>
              <Button 
                className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white"
                onClick={() => handleOpenChange(false)}
              >
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handleCheck} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Check-in Date</label>
                  <Calendar 
                    selected={checkIn} 
                    onSelect={setCheckIn} 
                    mode="single" 
                    required 
                    initialFocus 
                    className="rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Check-out Date</label>
                  <Calendar 
                    selected={checkOut} 
                    onSelect={setCheckOut} 
                    mode="single" 
                    required 
                    initialFocus 
                    className="rounded-lg border border-slate-200"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Number of Guests</label>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={guests}
                  onChange={e => setGuests(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  required
                />
              </div>
              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}
              <Button 
                type="submit" 
                className="w-full bg-slate-900 hover:bg-slate-800 text-white"
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