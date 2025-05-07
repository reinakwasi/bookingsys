"use client"

import { useParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Bed, Wifi, Coffee, Bath, Tv, Users } from "lucide-react"
import Link from "next/link"

// This would typically come from your API or database
const rooms = {
  1: {
    name: "Expensive Room",
    description: "Luxurious suite with ocean view and premium amenities",
    price: 500,
    image: "/room1.jpg",
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
    price: 300,
    image: "/room2.jpg",
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
    image: "/room3.jpg",
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
        <div className="relative h-[400px] lg:h-[600px] rounded-lg overflow-hidden">
          <Image
            src={room.image}
            alt={room.name}
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{room.name}</h1>
            <p className="text-2xl font-bold text-slate-900 mt-2">${room.price}/night</p>
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
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/rooms">Back to Rooms</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
} 