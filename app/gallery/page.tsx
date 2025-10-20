import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Photo Gallery - Hotel 734 Images & Virtual Tour",
  description: "Explore Hotel 734's stunning photo gallery featuring luxury rooms, facilities, amenities, and beautiful spaces. See why we're the premier choice for luxury accommodation.",
  keywords: ["hotel gallery", "Hotel 734 photos", "luxury hotel images", "room photos", "hotel facilities photos", "virtual tour"],
  openGraph: {
    title: "Photo Gallery - Hotel 734",
    description: "Explore Hotel 734's stunning photo gallery featuring luxury rooms, facilities, and beautiful spaces.",
    url: "https://hotel734.com/gallery",
    images: [
      {
        url: "/gallery-og.jpg",
        width: 1200,
        height: 630,
        alt: "Hotel 734 - Photo Gallery",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Photo Gallery - Hotel 734",
    description: "Explore Hotel 734's stunning photo gallery featuring luxury rooms, facilities, and beautiful spaces.",
    images: ["/gallery-og.jpg"],
  },
}

"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, Camera, Star, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"

// Gallery images data
const galleryImages = {
  rooms: [
    {
      id: 1,
      title: "Expensive Suite",
      description: "Luxurious suite with ocean view and premium amenities",
      src: "/room1.jpg",
      alt: "Expensive Suite",
      category: "Luxury",
    },
    {
      id: 2,
      title: "Expensive Suite Bathroom",
      description: "Spacious bathroom with jacuzzi and premium fixtures",
      src: "/room2.jpg",
      alt: "Expensive Suite Bathroom",
      category: "Luxury",
    },
    {
      id: 3,
      title: "Standard Room",
      description: "Comfortable room with modern amenities and city view",
      src: "/room3.jpg",
      alt: "Standard Room",
      category: "Standard",
    },
    {
      id: 4,
      title: "Standard Room View",
      description: "Panoramic city views from our standard rooms",
      src: "/view.jpg",
      alt: "Standard Room View",
      category: "Standard",
    },
    {
      id: 5,
      title: "Regular Room",
      description: "Cozy room with essential amenities and garden view",
      src: "/one.jpg",
      alt: "Regular Room",
      category: "Regular",
    },
    {
      id: 6,
      title: "Regular Room Interior",
      description: "Comfortable interior with modern furnishings",
      src: "/two.jpg",
      alt: "Regular Room Interior",
      category: "Regular",
    },
  ],
  facilities: [
    {
      id: 1,
      title: "Swimming Pool",
      description: "Infinity pool with stunning views",
      src: "/pool.jpg",
      alt: "Swimming Pool",
      category: "Recreation",
    },
    {
      id: 2,
      title: "Restaurant",
      description: "Fine dining experience with international cuisine",
      src: "/cont.jpg",
      alt: "Restaurant",
      category: "Dining",
    },
    {
      id: 3,
      title: "Spa",
      description: "Luxurious spa treatments and relaxation area",
      src: "/three.jpg",
      alt: "Spa",
      category: "Wellness",
    },
    {
      id: 4,
      title: "Gym",
      description: "State-of-the-art fitness center",
      src: "/four.jpg",
      alt: "Gym",
      category: "Fitness",
    },
    {
      id: 5,
      title: "Bar",
      description: "Elegant bar with signature cocktails",
      src: "/backimg2.jpg",
      alt: "Bar",
      category: "Entertainment",
    },
    {
      id: 6,
      title: "Conference Room",
      description: "Modern conference facilities for business events",
      src: "/outline.jpg",
      alt: "Conference Room",
      category: "Business",
    },
  ],
  events: [
    {
      id: 1,
      title: "Conference Hall",
      description: "State-of-the-art conference facilities for business events",
      category: "Business",
      images: [
        {
          src: "/outline.jpg",
          alt: "Conference Hall Main View",
        },
        {
          src: "/view.jpg",
          alt: "Conference Setup",
        },
        {
          src: "/four.jpg",
          alt: "Conference Breakout Area",
        },
      ],
    },
    {
      id: 2,
      title: "Compound Events",
      description: "Beautiful outdoor venue for weddings and special events",
      category: "Outdoor",
      images: [
        {
          src: "/poolview1.jpg",
          alt: "Outdoor Event Space",
        },
        {
          src: "/poolview2.jpg",
          alt: "Garden Area",
        },
        {
          src: "/pool.jpg",
          alt: "Event Setup",
        },
      ],
    },
    {
      id: 3,
      title: "Wedding Reception",
      description: "Elegant wedding celebrations in our outdoor venue",
      category: "Weddings",
      images: [
        {
          src: "/poolview1.jpg",
          alt: "Wedding Reception Setup",
        },
        {
          src: "/poolview2.jpg",
          alt: "Wedding Ceremony Area",
        },
        {
          src: "/pool.jpg",
          alt: "Wedding Celebration",
        },
      ],
    },
    {
      id: 4,
      title: "Corporate Event",
      description: "Professional business meetings and conferences",
      category: "Business",
      images: [
        {
          src: "/outline.jpg",
          alt: "Corporate Meeting Setup",
        },
        {
          src: "/view.jpg",
          alt: "Conference Room",
        },
        {
          src: "/four.jpg",
          alt: "Business Event",
        },
      ],
    },
  ],
}

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState<typeof galleryImages.rooms[0] | null>(null)
  const [activeTab, setActiveTab] = useState("rooms")
  const [currentImageIndexes, setCurrentImageIndexes] = useState<{ [key: number]: number }>({})

  // Initialize current image indexes
  useEffect(() => {
    const initialIndexes: { [key: number]: number } = {}
    galleryImages.events.forEach((event) => {
      initialIndexes[event.id] = 0
    })
    setCurrentImageIndexes(initialIndexes)
  }, [])

  // Auto-rotate images
  useEffect(() => {
    if (activeTab === "events") {
      const interval = setInterval(() => {
        galleryImages.events.forEach((event) => {
          setCurrentImageIndexes((prev) => ({
            ...prev,
            [event.id]: (prev[event.id] + 1) % event.images.length,
          }))
        })
      }, 5000) // Change image every 5 seconds

      return () => clearInterval(interval)
    }
  }, [activeTab])

  const handlePreviousImage = (eventId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const event = galleryImages.events.find(e => e.id === eventId)!
    setCurrentImageIndexes((prev) => ({
      ...prev,
      [eventId]: (prev[eventId] - 1 + event.images.length) % event.images.length
    }))
  }

  const handleNextImage = (eventId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const event = galleryImages.events.find(e => e.id === eventId)!
    setCurrentImageIndexes((prev) => ({
      ...prev,
      [eventId]: (prev[eventId] + 1) % event.images.length
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-500/10 to-orange-600/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-amber-400/5 to-orange-500/5 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-amber-300/5 to-orange-400/5 rounded-full blur-2xl animate-pulse"></div>
      </div>

      <div className="container px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-20 relative z-10">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-amber-300 mb-6 sm:mb-8 animate-slide-up">
            <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-semibold text-sm sm:text-base">Luxury Gallery</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-white via-amber-200 to-orange-300 bg-clip-text text-transparent mb-6 sm:mb-8 animate-slide-up font-serif leading-tight">
            Visual Journey
          </h1>
          <p className="text-base sm:text-xl md:text-2xl text-white/80 max-w-4xl mx-auto leading-relaxed animate-fade-in mb-8 sm:mb-12 px-4">
            Experience the unparalleled luxury of Hotel 734 through our exclusive collection of breathtaking imagery
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 animate-fade-in">
            <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-sm rounded-full border border-amber-400/30">
              <Star className="w-4 h-4 sm:w-6 sm:h-6 text-amber-400 fill-current" />
              <span className="text-white font-medium text-sm sm:text-base">Premium Collection</span>
            </div>
            <div className="w-6 h-px sm:w-px sm:h-6 bg-white/30"></div>
            <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <Eye className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              <span className="text-white font-medium text-sm sm:text-base">4K Resolution</span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="rooms" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-12 sm:mb-16 px-4">
            <TabsList className="bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl p-1 sm:p-2 rounded-2xl sm:rounded-3xl w-full max-w-2xl">
              <TabsTrigger 
                value="rooms" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-xl text-white/70 hover:text-white px-3 sm:px-8 py-2 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-xs sm:text-lg transition-all duration-500 flex-1"
              >
                <span className="hidden sm:inline">Luxury </span>Suites
              </TabsTrigger>
              <TabsTrigger 
                value="facilities" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-xl text-white/70 hover:text-white px-3 sm:px-8 py-2 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-xs sm:text-lg transition-all duration-500 flex-1"
              >
                <span className="hidden sm:inline">Premium </span>Amenities
              </TabsTrigger>
              <TabsTrigger 
                value="events" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-xl text-white/70 hover:text-white px-3 sm:px-8 py-2 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-xs sm:text-lg transition-all duration-500 flex-1"
              >
                <span className="hidden sm:inline">Exclusive </span>Events
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="rooms" className="mt-0 px-4 sm:px-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {galleryImages.rooms.map((image, index) => (
                <Card 
                  key={image.id} 
                  className="overflow-hidden group cursor-pointer bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 animate-fade-in rounded-2xl"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => setSelectedImage(image)}
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-600/20 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    
                    {/* Floating overlay content */}
                    <div className="absolute bottom-4 left-4 right-4 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 border border-white/30">
                        <h3 className="font-semibold text-slate-900 text-sm">{image.title}</h3>
                        <p className="text-xs text-slate-600 mt-1">{image.description}</p>
                      </div>
                    </div>
                    
                    {/* Category badge */}
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium rounded-full shadow-lg">
                        {image.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 sm:p-6 bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm">
                    <h3 className="font-semibold text-white text-base sm:text-lg mb-1">{image.title}</h3>
                    <p className="text-xs sm:text-sm text-amber-300 font-medium">{image.category} Collection</p>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="facilities" className="mt-0 px-4 sm:px-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {galleryImages.facilities.map((image, index) => (
                <Card 
                  key={image.id} 
                  className="overflow-hidden group cursor-pointer bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 animate-fade-in rounded-2xl"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => setSelectedImage(image)}
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-600/20 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    
                    {/* Floating overlay content */}
                    <div className="absolute bottom-4 left-4 right-4 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 border border-white/30">
                        <h3 className="font-semibold text-slate-900 text-sm">{image.title}</h3>
                        <p className="text-xs text-slate-600 mt-1">{image.description}</p>
                      </div>
                    </div>
                    
                    {/* Category badge */}
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium rounded-full shadow-lg">
                        {image.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 sm:p-6 bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm">
                    <h3 className="font-semibold text-white text-base sm:text-lg mb-1">{image.title}</h3>
                    <p className="text-xs sm:text-sm text-amber-300 font-medium">{image.category} Experience</p>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="events" className="mt-0 px-4 sm:px-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {galleryImages.events.map((event, index) => {
                const currentImageIndex = currentImageIndexes[event.id] || 0;
                const currentImage = event.images[currentImageIndex];
                
                return (
                  <Card 
                    key={event.id} 
                    className="overflow-hidden group cursor-pointer bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 animate-fade-in rounded-2xl"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => setSelectedImage({ ...event, src: currentImage.src, alt: currentImage.alt })}
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden">
                      <Image
                        src={currentImage.src}
                        alt={currentImage.alt}
                        fill
                        className="object-cover transition-all duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-600/20 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                      
                      {/* Navigation buttons */}
                      <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white text-slate-900 shadow-lg border border-white/20"
                          onClick={(e) => handlePreviousImage(event.id, e)}
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white text-slate-900 shadow-lg border border-white/20"
                          onClick={(e) => handleNextImage(event.id, e)}
                        >
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </div>

                      {/* Image indicators */}
                      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 space-x-2">
                        {event.images.map((_, imgIndex) => (
                          <div
                            key={imgIndex}
                            className={`h-2 rounded-full transition-all duration-300 ${
                              imgIndex === currentImageIndex
                                ? "w-6 bg-white shadow-lg"
                                : "w-2 bg-white/60"
                            }`}
                          />
                        ))}
                      </div>

                      {/* Category badge */}
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium rounded-full shadow-lg">
                          {event.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 sm:p-6 bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm">
                      <h3 className="font-semibold text-white text-base sm:text-lg mb-1">{event.title}</h3>
                      <p className="text-xs sm:text-sm text-amber-300 font-medium">{event.category} Events</p>
                      <p className="text-xs text-white/70 mt-2 line-clamp-2">{event.description}</p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Dialog */}
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-5xl mx-4 sm:mx-auto bg-white/95 backdrop-blur-md border border-white/20 shadow-2xl">
            <DialogTitle className="sr-only">
              {selectedImage?.title || "Gallery Image"}
            </DialogTitle>
            {selectedImage && (
              <div className="space-y-4 sm:space-y-6">
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl sm:rounded-2xl">
                  <Image
                    src={selectedImage.src}
                    alt={selectedImage.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">{selectedImage.title}</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                        <span className="inline-block px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium rounded-full w-fit">
                          {selectedImage.category}
                        </span>
                        <span className="text-sm text-slate-500">Premium Collection</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-600 text-base sm:text-lg leading-relaxed">{selectedImage.description}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
