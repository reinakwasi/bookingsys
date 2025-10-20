import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Hotel Facilities - Luxury Amenities & Services",
  description: "Explore Hotel 734's world-class facilities including swimming pool, fitness center, spa, restaurant, and premium amenities. Experience luxury and comfort at every turn.",
  keywords: ["hotel facilities", "luxury amenities", "swimming pool", "fitness center", "spa services", "hotel restaurant", "Hotel 734 amenities"],
  openGraph: {
    title: "Hotel Facilities - Hotel 734",
    description: "Explore Hotel 734's world-class facilities including swimming pool, fitness center, spa, restaurant, and premium amenities.",
    url: "https://hotel734.com/facilities",
    images: [
      {
        url: "/facilities-og.jpg",
        width: 1200,
        height: 630,
        alt: "Hotel 734 - Luxury Facilities",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hotel Facilities - Hotel 734",
    description: "Explore Hotel 734's world-class facilities including swimming pool, fitness center, spa, and premium amenities.",
    images: ["/facilities-og.jpg"],
  },
}

"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Utensils, Music, Waves, Dumbbell, Bed, Wine, Wifi, Car, Star, MapPin, Clock, ChevronLeft, ChevronRight, Home, Snowflake, Users } from "lucide-react"

// Facilities data with multiple images for rotation
const facilities = [
  {
    id: 1,
    name: "Club House",
    description: "Exclusive club house featuring quality amenities, social spaces, and entertainment facilities for our distinguished guests.",
    icon: Home,
    images: [
      { src: "/backimg2.jpg", alt: "Club House Main Lounge" },
      { src: "/cont.jpg", alt: "Club House Social Area" },
      { src: "/outline.jpg", alt: "Club House Entertainment Room" },
    ],
  },
  {
    id: 2,
    name: "Swimming Pool",
    description: "Stunning infinity pool with breathtaking views, poolside service, and comfortable deck areas for ultimate relaxation.",
    icon: Waves,
    images: [
      { src: "/pool.jpg", alt: "Main Pool Area" },
      { src: "/poolview1.jpg", alt: "Pool Deck View" },
      { src: "/poolview2.jpg", alt: "Evening Pool Ambiance" },
    ],
  },
  {
    id: 3,
    name: "Bar",
    description: "Sophisticated bar offering premium cocktails, fine wines, and spirits in an elegant atmosphere with live entertainment.",
    icon: Wine,
    images: [
      { src: "/backimg2.jpg", alt: "Main Bar Area" },
      { src: "/cont.jpg", alt: "Bar Counter" },
      { src: "/pool.jpg", alt: "Outdoor Bar Terrace" },
    ],
  },
  {
    id: 4,
    name: "Gym",
    description: "State-of-the-art fitness center equipped with modern equipment, personal trainers, and wellness programs.",
    icon: Dumbbell,
    images: [
      { src: "/four.jpg", alt: "Main Gym Floor" },
      { src: "/three.jpg", alt: "Cardio Section" },
      { src: "/outline.jpg", alt: "Weight Training Area" },
    ],
  },
  {
    id: 5,
    name: "Restaurant",
    description: "Fine dining restaurant featuring world-class cuisine, international dishes, and exceptional culinary experiences.",
    icon: Utensils,
    images: [
      { src: "/cont.jpg", alt: "Restaurant Main Dining" },
      { src: "/outline.jpg", alt: "Private Dining Room" },
      { src: "/view.jpg", alt: "Restaurant Terrace" },
    ],
  },
  {
    id: 6,
    name: "Parking",
    description: "Secure parking facilities with 24/7 surveillance, valet service, and covered parking spaces for guest convenience.",
    icon: Car,
    images: [
      { src: "/view.jpg", alt: "Main Parking Area" },
      { src: "/outline.jpg", alt: "Covered Parking" },
      { src: "/poolview1.jpg", alt: "Valet Service Area" },
    ],
  },
  {
    id: 7,
    name: "Conference Room",
    description: "Modern conference facilities equipped with advanced technology, perfect for business meetings and corporate events.",
    icon: Users,
    images: [
      { src: "/outline.jpg", alt: "Main Conference Room" },
      { src: "/view.jpg", alt: "Boardroom Setup" },
      { src: "/four.jpg", alt: "Presentation Area" },
    ],
  },
  {
    id: 8,
    name: "Cold Room",
    description: "Chilled relaxation space with comfortable seating, ambient lighting, music, and refreshments where guests can unwind and socialize in a cool, comfortable environment.",
    icon: Snowflake,
    images: [
      { src: "/three.jpg", alt: "Walk-in Cold Room" },
      { src: "/four.jpg", alt: "Professional Food Storage" },
      { src: "/view.jpg", alt: "Temperature-Controlled Environment" },
    ],
  },
]

export default function FacilitiesPage() {
  const [currentImageIndexes, setCurrentImageIndexes] = useState<{ [key: number]: number }>({})

  // Initialize current image indexes
  useEffect(() => {
    const initialIndexes: { [key: number]: number } = {}
    facilities.forEach((facility) => {
      initialIndexes[facility.id] = 0
    })
    setCurrentImageIndexes(initialIndexes)
  }, [])

  // Auto-rotate images every 6 seconds (reduced frequency)
  useEffect(() => {
    const interval = setInterval(() => {
      facilities.forEach((facility) => {
        setCurrentImageIndexes((prev) => ({
          ...prev,
          [facility.id]: (prev[facility.id] + 1) % facility.images.length,
        }))
      })
    }, 6000)

    return () => clearInterval(interval)
  }, [])

  const handlePreviousImage = (facilityId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const facility = facilities.find(f => f.id === facilityId)!
    setCurrentImageIndexes((prev) => ({
      ...prev,
      [facilityId]: (prev[facilityId] - 1 + facility.images.length) % facility.images.length
    }))
  }

  const handleNextImage = (facilityId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const facility = facilities.find(f => f.id === facilityId)!
    setCurrentImageIndexes((prev) => ({
      ...prev,
      [facilityId]: (prev[facilityId] + 1) % facility.images.length
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30 relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-200/20 to-orange-300/20 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-slate-200/20 to-gray-300/20 rounded-full blur-3xl animate-float-slow" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-amber-100/10 to-orange-200/10 rounded-full blur-2xl animate-pulse-slow"></div>
      </div>

      <div className="container-responsive py-8 sm:py-12 lg:py-16 relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/60 backdrop-blur-sm border border-white/20 rounded-full text-xs sm:text-sm text-amber-700 mb-4 sm:mb-6 animate-slide-up">
            <Star className="w-3 w-3 sm:w-4 sm:h-4" />
            <span className="font-medium">Quality Amenities</span>
          </div>
          <h1 className="text-responsive-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-amber-900 bg-clip-text text-transparent mb-4 sm:mb-6 animate-slide-up font-serif">
            Hotel Facilities
          </h1>
          <p className="text-responsive-base text-slate-600 max-w-3xl mx-auto leading-relaxed animate-fade-in">
            Indulge in world-class amenities and services designed to elevate your experience at Hotel 734
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-6 sm:mt-8 animate-fade-in">
            <div className="flex items-center gap-2 text-amber-600">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm font-medium">On-Site Access</span>
            </div>

          </div>
        </div>

        <div className="space-y-8 sm:space-y-12 lg:space-y-16">
          {facilities.map((facility, index) => {
            const currentImageIndex = currentImageIndexes[facility.id] || 0;
            const currentImage = facility.images[currentImageIndex];
            
            return (
              <Card 
                key={facility.id} 
                className="overflow-hidden group cursor-pointer bg-white/80 backdrop-blur-lg border border-white/30 shadow-2xl hover:shadow-3xl hover-transition hover:scale-[1.01] animate-fade-in rounded-2xl sm:rounded-3xl"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="relative h-[300px] sm:h-[400px] md:h-[550px] lg:h-[650px] overflow-hidden rounded-2xl sm:rounded-3xl">
                  <Image 
                    src={currentImage.src} 
                    alt={currentImage.alt} 
                    fill 
                    className="object-cover hover-transition group-hover:scale-105" 
                    priority={index < 3}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 hover-transition" />
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-600/20 opacity-0 group-hover:opacity-100 hover-transition" />
                  
                  {/* Navigation buttons */}
                  <div className="absolute inset-0 flex items-center justify-between px-4 sm:px-8 opacity-0 group-hover:opacity-100 hover-transition">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 sm:h-14 sm:w-14 rounded-full bg-white/95 backdrop-blur-md hover:bg-white text-slate-900 shadow-xl border border-white/40 hover:scale-110 hover-transition"
                      onClick={(e) => handlePreviousImage(facility.id, e)}
                    >
                      <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 sm:h-14 sm:w-14 rounded-full bg-white/95 backdrop-blur-md hover:bg-white text-slate-900 shadow-xl border border-white/40 hover:scale-110 hover-transition"
                      onClick={(e) => handleNextImage(facility.id, e)}
                    >
                      <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6" />
                    </Button>
                  </div>

                  {/* Image indicators - mobile optimized position */}
                  <div className="absolute bottom-16 sm:bottom-32 left-1/2 flex -translate-x-1/2 space-x-2 sm:space-x-3 bg-black/40 backdrop-blur-sm rounded-full px-2 sm:px-4 py-1 sm:py-2">
                    {facility.images.map((_, imgIndex) => (
                      <div
                        key={imgIndex}
                        className={`h-1.5 sm:h-3 rounded-full transition-all duration-500 ${
                          imgIndex === currentImageIndex
                            ? "w-4 sm:w-8 bg-white shadow-lg"
                            : "w-1.5 sm:w-3 bg-white/50 hover:bg-white/70"
                        }`}
                      />
                    ))}
                  </div>
                  
                  {/* Floating category badge */}
                  <div className="absolute top-4 left-4 sm:top-8 sm:left-8">
                    <div className="flex items-center gap-2 sm:gap-3 bg-white/95 backdrop-blur-md rounded-full px-3 sm:px-6 py-2 sm:py-3 shadow-xl border border-white/40">
                      <facility.icon className="h-4 w-4 sm:h-6 sm:w-6 text-amber-600" />
                      <span className="text-slate-900 font-semibold text-xs sm:text-sm">Premium Facility</span>
                    </div>
                  </div>


                  {/* Large facility name overlay - mobile optimized */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-3 sm:p-6 md:p-10 lg:p-12">
                    <div className="max-w-6xl mx-auto">
                      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-2 sm:gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-6">
                            <div className="h-8 w-8 sm:h-16 sm:w-16 lg:h-20 lg:w-20 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-md flex items-center justify-center shadow-2xl border border-white/30 flex-shrink-0">
                              <facility.icon className="h-4 w-4 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-1 sm:mb-3 font-serif leading-tight">{facility.name}</h2>
                              <div className="flex flex-wrap items-center gap-1 sm:gap-3">
                                <span className="px-2 sm:px-4 lg:px-5 py-1 sm:py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs sm:text-sm font-semibold rounded-full shadow-xl">
                                  Premium Experience
                                </span>
                                {facility.name === "Parking" && (
                                  <span className="px-2 sm:px-4 py-1 sm:py-2 bg-white/20 backdrop-blur-sm text-white text-xs sm:text-sm font-medium rounded-full border border-white/30">
                                    24/7 Access
                                  </span>
                                )}
                              </div>
                            </div>
                            {/* Mobile facility number indicator - moved inline */}
                            <div className="flex-shrink-0 sm:hidden">
                              <div className="text-right">
                                <div className="text-2xl font-bold text-white/30 font-serif leading-none">
                                  {String(index + 1).padStart(2, '0')}
                                </div>
                                <div className="text-white/50 text-xs font-medium">
                                  of 8 facilities
                                </div>
                              </div>
                            </div>
                          </div>
                          <p className="text-white/90 text-xs sm:text-base md:text-lg lg:text-xl xl:text-2xl leading-relaxed font-light max-w-4xl line-clamp-2 sm:line-clamp-none">{facility.description}</p>
                        </div>
                        
                        {/* Desktop facility number indicator */}
                        <div className="hidden sm:flex flex-shrink-0 self-end">
                          <div className="text-right">
                            <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white/20 font-serif leading-none">
                              {String(index + 1).padStart(2, '0')}
                            </div>
                            <div className="text-white/60 text-xs sm:text-sm font-medium mt-1 sm:mt-2">
                              of 8 facilities
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Call to Action Section */}
        <div className="mt-12 sm:mt-16 lg:mt-20 text-center">
          <div className="bg-white/70 backdrop-blur-md border border-white/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 shadow-2xl animate-fade-in">
            <h2 className="text-responsive-2xl font-bold bg-gradient-to-r from-slate-900 to-amber-900 bg-clip-text text-transparent mb-3 sm:mb-4 font-serif">
              Experience Comfort Like Never Before
            </h2>
            <p className="text-responsive-base text-slate-600 max-w-2xl mx-auto mb-6 sm:mb-8">
              Every facility at Hotel 734 is designed with your comfort and satisfaction in mind. 
              Discover the perfect blend of comfort, convenience, and exceptional service.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600" />
                <span className="text-xs sm:text-sm font-medium text-amber-700">Prime Location</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
