"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight } from "lucide-react"
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
    <div className="container py-12 md:py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Photo Gallery</h1>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          Explore our luxury hotel through our collection of stunning images.
        </p>
      </div>

      <Tabs defaultValue="rooms" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-center mb-8">
          <TabsList className="bg-slate-100 p-1">
            <TabsTrigger value="rooms" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Rooms
            </TabsTrigger>
            <TabsTrigger value="facilities" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Facilities
            </TabsTrigger>
            <TabsTrigger value="events" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Events
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="rooms" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryImages.rooms.map((image) => (
              <Card 
                key={image.id} 
                className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300"
                onClick={() => setSelectedImage(image)}
              >
                <CardContent className="p-0">
                  <div className="relative aspect-[4/3] w-full">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="p-4">
                    <p className="font-medium text-slate-900">{image.title}</p>
                    <p className="text-sm text-slate-500 mt-1">{image.category}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="facilities" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryImages.facilities.map((image) => (
              <Card 
                key={image.id} 
                className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300"
                onClick={() => setSelectedImage(image)}
              >
                <CardContent className="p-0">
                  <div className="relative aspect-[4/3] w-full">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="p-4">
                    <p className="font-medium text-slate-900">{image.title}</p>
                    <p className="text-sm text-slate-500 mt-1">{image.category}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="events" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryImages.events.map((event) => {
              const currentImageIndex = currentImageIndexes[event.id] || 0;
              const currentImage = event.images[currentImageIndex];
              
              return (
                <Card 
                  key={event.id} 
                  className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300"
                  onClick={() => setSelectedImage({ ...event, src: currentImage.src, alt: currentImage.alt })}
                >
                  <CardContent className="p-0">
                    <div className="relative aspect-[4/3] w-full">
                      <Image
                        src={currentImage.src}
                        alt={currentImage.alt}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Navigation buttons */}
                      <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full bg-white/80 hover:bg-white text-slate-900"
                          onClick={(e) => handlePreviousImage(event.id, e)}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full bg-white/80 hover:bg-white text-slate-900"
                          onClick={(e) => handleNextImage(event.id, e)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Image indicators */}
                      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 space-x-1.5">
                        {event.images.map((_, index) => (
                          <div
                            key={index}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              index === currentImageIndex
                                ? "w-4 bg-white"
                                : "w-1.5 bg-white/50"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-slate-900">{event.title}</h3>
                      <p className="text-sm text-slate-500 mt-1">{event.category}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          {selectedImage && (
            <div className="space-y-4">
              <div className="relative aspect-[16/9] w-full">
                <Image
                  src={selectedImage.images ? selectedImage.images[currentImageIndexes[selectedImage.id] || 0].src : selectedImage.src}
                  alt={selectedImage.images ? selectedImage.images[currentImageIndexes[selectedImage.id] || 0].alt : selectedImage.alt}
                  fill
                  className="object-cover rounded-lg"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900">{selectedImage.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{selectedImage.category}</p>
                <p className="text-slate-600 mt-2">{selectedImage.description}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
