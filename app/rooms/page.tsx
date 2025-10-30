"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Check, Wifi, Car, Coffee, Dumbbell, Waves, Users, Bed } from "lucide-react"

const rooms = [
  {
    id: 1,
    name: "Royal Suite",
    description: "Comfortable room with modern amenities and extra-large bed size for maximum sleeping comfort.",
    image: "/three.jpg",
    type: "expensive",
    rating: 5.0,
    price: 352,
    maxGuests: 4,
    features: [
      "Satellite TV Channels", 
      "Air Conditioned Room",
      "Mini Fridge",
      "Table and Chairs",
      "Daily Laundry / Dry Cleaning",
      "24h Room Service"
    ]
  },
  {
    id: 2,
    name: "Superior Room",
    description: "Comfortable room with modern amenities and larger bed size for enhanced sleeping space.",
    image: "/two.jpg",
    type: "standard",
    rating: 4.8,
    price: 300,
    maxGuests: 3,
    features: [
      "Satellite TV Channels",
      "Air Conditioned Room",
      "Mini Fridge",
      "Table and Chairs",
      "Daily Laundry / Dry Cleaning",
      "24h Room Service"
    ]
  },
  {
    id: 3,
    name: "Classic Room",
    description: "Comfortable room with modern amenities and standard bed size.",
    image: "/one.jpg",
    type: "regular",
    rating: 4.5,
    price: 250,
    maxGuests: 2,
    features: [
      "Satellite TV Channels",
      "Air Conditioned Room",
      "Mini Fridge",
      "Table and Chairs",
      "Daily Laundry / Dry Cleaning",
      "24h Room Service"
    ]
  },
]

export default function RoomsPage() {
  return (
    <main className="bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden" style={{ minHeight: 'calc(100vh - 200px)' }}>
      {/* Floating background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-[#C49B66]/20 to-[#F4E4BC]/20 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-float-slow" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-[#C49B66]/10 to-amber-200/20 rounded-full blur-3xl animate-float-slow" style={{animationDelay: '4s'}}></div>
      </div>
      
      <div className="container-responsive py-12 sm:py-16 lg:py-24 relative z-10">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-full glass-morphism text-[#C49B66] mb-6 sm:mb-8 animate-glow">
            <Bed className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" />
            <span className="font-medium text-sm sm:text-base">Quality Accommodations</span>
            <Star className="h-4 w-4 sm:h-5 sm:w-5 animate-spin-slow" />
          </div>
          <h1 className="text-responsive-4xl font-display font-bold mb-6 sm:mb-8 text-gradient">Our Exquisite Rooms</h1>
          <p className="text-responsive-base text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Choose from our selection of quality rooms, each designed to provide the perfect blend of comfort and excellent service.
          </p>
        </div>

        <div className="space-y-8 sm:space-y-12 lg:space-y-16">
          {rooms.map((room, index) => (
            <div key={room.id} className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-stretch animate-fade-in-up" style={{animationDelay: `${index * 0.2}s`}}>
              {/* Room Image */}
              <div className="relative group">
                <div className="relative h-[300px] sm:h-[400px] lg:h-[600px] overflow-hidden rounded-2xl sm:rounded-3xl shadow-luxury hover:shadow-glow hover-transition hover:-translate-y-1 hover:scale-[1.02]">
                  <Image
                    src={room.image}
                    alt={room.name}
                    fill
                    className="object-cover hover-transition group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#C49B66]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 hover-transition" />
                  
                  
                  {/* Price Badge */}
                  <div className="absolute bottom-3 left-3 sm:bottom-6 sm:left-6">
                    <div className="gradient-price-tag text-white font-bold text-lg sm:text-2xl px-3 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl shadow-luxury animate-float border border-white/20">
                      GH₵{room.price}
                      <span className="text-xs sm:text-sm font-medium ml-1">/night</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Room Details */}
              <div className="space-y-6 sm:space-y-8 flex flex-col justify-center">
                <div className="glass-morphism rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-luxury">
                  <h2 className="text-responsive-2xl font-display font-bold mb-3 sm:mb-4 text-slate-800">{room.name}</h2>
                  <p className="text-responsive-base text-slate-600 leading-relaxed mb-6 sm:mb-8">
                    {room.description}
                  </p>
                  
                  {/* Features List */}
                  <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                    {room.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center group/item hover:bg-[#C49B66]/5 rounded-xl p-2 sm:p-3 transition-colors">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#C49B66] flex items-center justify-center mr-3 sm:mr-4 group-hover/item:animate-pulse flex-shrink-0">
                          <Check className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                        </div>
                        <span className="text-slate-600 group-hover/item:text-slate-800 transition-colors font-medium text-sm sm:text-base">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Action Button */}
                  <Link href={`/rooms/${room.id}`}>
                    <Button size="lg" className="w-full sm:w-auto gradient-gold hover:shadow-glow text-white font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl hover-transition hover:scale-105 text-sm sm:text-base">
                      <Bed className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      More Details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
