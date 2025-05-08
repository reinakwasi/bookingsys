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
    name: "Expensive Room",
    description: "Luxurious suite with ocean view and premium amenities",
    price: 300,
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
    longDescription: `Experience unparalleled luxury in our Expensive Room. This spacious suite features a king-size bed, 
    premium amenities, and breathtaking ocean views. Enjoy the comfort of a private balcony, a luxurious bathroom with 
    a jacuzzi, and 24/7 room service. Perfect for those seeking the ultimate luxury experience.`,
  },
  2: {
    name: "Standard Room",
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
      { icon: Users, text: "Up to 2 Guests" },
    ],
    longDescription: `Our Standard Room offers the perfect balance of comfort and value. Featuring a queen-size bed, 
    modern amenities, and a city view, this room is ideal for both business and leisure travelers. Enjoy the convenience 
    of high-speed WiFi, a smart TV, and a well-appointed bathroom.`,
  },
  3: {
    name: "Regular Room",
    description: "Cozy room with essential amenities and garden view",
    price: 200,
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
      <div className="container px-4 py-16">
        <h1 className="text-2xl font-bold text-slate-900">Room not found</h1>
        <p className="mt-4 text-slate-600">The room you're looking for doesn't exist.</p>
        <Link href="/rooms">
          <Button className="mt-4">Back to Rooms</Button>
        </Link>
      </div>
    )
  }

  return (
    <main className="container px-4 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="relative h-[400px] lg:h-[600px] rounded-lg overflow-hidden flex items-center justify-center bg-slate-100">
          <button
            className="absolute left-2 z-10 bg-white/80 hover:bg-white rounded-full p-1"
            onClick={handlePrev}
            type="button"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6 text-slate-700" />
          </button>
          <Image
            src={room.images[currentIndex].src}
            alt={room.images[currentIndex].alt}
            fill
            className="object-cover"
            priority
          />
          <button
            className="absolute right-2 z-10 bg-white/80 hover:bg-white rounded-full p-1"
            onClick={handleNext}
            type="button"
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6 text-slate-700" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
            {room.images.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 w-3 rounded-full transition-all ${idx === currentIndex ? "bg-slate-700" : "bg-slate-300"}`}
              />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{room.name}</h1>
            <p className="text-2xl font-bold text-slate-900 mt-2">{room.price} GHS/night</p>
          </div>
          <p className="text-slate-600">{room.longDescription}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {room.features.map((feature, index) => (
              <Card key={index} className="bg-slate-50">
                <CardContent className="flex items-center space-x-2 p-4">
                  <feature.icon className="h-5 w-5 text-slate-900" />
                  <span className="text-sm text-slate-900">{feature.text}</span>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/booking">Book Now</Link>
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto" onClick={() => setOpen(true)}>
              Check Availability
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/rooms">Back to Rooms</Link>
            </Button>
          </div>
        </div>
      </div>
      {/* Check Availability Modal */}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Check Availability</DialogTitle>
          </DialogHeader>
          {checked ? (
            <div className="text-center py-8">
              <p className="text-green-600 text-lg font-semibold mb-2">Available!</p>
              <p className="text-slate-600">This room is available for your selected dates.</p>
              <Button className="mt-4 w-full" onClick={() => handleOpenChange(false)}>
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handleCheck} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Check-in Date</label>
                  <Calendar selected={checkIn} onSelect={setCheckIn} mode="single" required initialFocus />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Check-out Date</label>
                  <Calendar selected={checkOut} onSelect={setCheckOut} mode="single" required initialFocus />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Guests</label>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={guests}
                  onChange={e => setGuests(Number(e.target.value))}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
              <Button type="submit" className="w-full">Check</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </main>
  )
} 