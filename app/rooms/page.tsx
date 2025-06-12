"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"

const rooms = [
  {
    id: 1,
    name: "Luxury Suite",
    description: "Luxurious suite with ocean view and premium amenities",
    image: "/room1.jpg",
    type: "suite",
    rating: 4.8,
  },
  {
    id: 2,
    name: "Deluxe Room",
    description: "Comfortable room with modern amenities and city view",
    image: "/room2.jpg",
    type: "deluxe",
    rating: 4.5,
  },
  {
    id: 3,
    name: "Executive Suite",
    description: "Cozy room with essential amenities and garden view",
    image: "/room3.jpg",
    type: "standard",
    rating: 4.2,
  },
]

export default function RoomsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="container px-4 py-24">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-slate-900 mb-6 tracking-tight">Our Rooms</h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed">
            Choose from our selection of luxurious rooms and suites, each designed to provide the perfect blend of comfort and style.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {rooms.map((room) => (
            <Card key={room.id} className="overflow-hidden group hover:shadow-2xl transition-all duration-500 border-0 bg-white">
              <div className="relative h-80">
                <Image
                  src={room.image}
                  alt={room.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-medium">{room.rating}</span>
                </div>
                <Badge 
                  variant="secondary" 
                  className="absolute bottom-4 left-4 capitalize bg-white/90 backdrop-blur-sm text-slate-900 hover:bg-white/90"
                >
                  {room.type}
                </Badge>
              </div>
              <CardHeader className="px-6 pt-6">
                <CardTitle className="text-2xl font-bold text-slate-900 mb-2">{room.name}</CardTitle>
                <CardDescription className="text-slate-600 text-base leading-relaxed">
                  {room.description}
                </CardDescription>
              </CardHeader>
              <CardFooter className="px-6 pb-6">
                <Button 
                  asChild 
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white group-hover:bg-amber-600 group-hover:text-white transition-all duration-300 h-12 text-base font-medium"
                >
                  <Link href={`/rooms/${room.id}`}>View Details</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )
}
