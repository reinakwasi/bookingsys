"use client"

import Link from "next/link"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import DynamicHeader from "@/components/dynamic-header"
import { ArrowRight, Star, Sparkles, Calendar } from "lucide-react"

const featuredRooms = [
  {
    id: 1,
    name: "Deluxe Room",
    description: "Spacious room with modern amenities and city views",
    price: 150,
    image: "/one.jpg",
    link: "/rooms/deluxe"
  },
  {
    id: 2,
    name: "Executive Suite",
    description: "Luxurious suite with separate living area and premium services",
    price: 250,
    image: "/two.jpg",
    link: "/rooms/executive"
  },
  {
    id: 3,
    name: "Presidential Suite",
    description: "Ultimate luxury with panoramic views and exclusive amenities",
    price: 500,
    image: "/three.jpg",
    link: "/rooms/presidential"
  }
]

const featuredEvents = [
  {
    id: 1,
    name: "Compound Events",
    description: "Perfect for large gatherings and celebrations",
    price: 1000,
    image: "/cont.jpg",
    link: "/events/compound"
  },
  {
    id: 2,
    name: "Conference Events",
    description: "Professional settings for business meetings and conferences",
    price: 800,
    image: "/backimg2.jpg",
    link: "/events/conference"
  }
]

export default function Home() {
  return (
    <main className="min-h-screen">
      <DynamicHeader />
      
      {/* Welcome to Hotel 734 Section */}
      <section className="py-20 bg-white text-center">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-12">
            <h2 className="text-7xl font-serif text-[#C49B66] mb-6 tracking-wide">
              Discover Hotel 734
            </h2>
            <div className="flex items-center justify-center mb-8">
              <div className="h-px w-24 bg-[#C49B66]" />
              <div className="w-3 h-3 border border-[#C49B66] mx-2" />
              <div className="h-px w-24 bg-[#C49B66]" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-8 text-left text-sm text-slate-700 leading-normal">
            <div>
              <p className="mb-4">
                Hotel 734 sets the standard for lavish rooms and suites, exquisite dining, and 5-star events. Experience stately elegance and exceptional service at our renowned hotel. Our luxurious establishment offers convenient access to various local attractions, ensuring a memorable stay.
              </p>
              <p>
                Hotel 734 is located in New Edubiase off Bronikrom road.
              </p>
            </div>
            <div>
              <p>
                Sample 5-star dishes in restaurants noted for such creations as Hotel 734 Salad and Veal Oscar, and share romantic after-dinner cocktails in the lounge, as the local music tinkles the ivories. Our Accommodation, Restaurant, and Bars, Conference, Fitness Centre and Swimming Pool facilities have all been structured to give you a feel of home and quality. Its business but yet homely and friendly ambiance is run by a highly trained staff. At Hotel 734 we welcome our guests to reliable and efficient services with our eager staff always prepared for your satisfaction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Luxury Accommodations Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/20 text-amber-600 mb-4">
              <Star className="h-4 w-4" />
              <span className="text-sm font-medium">Luxury Accommodations</span>
            </div>
            <h2 className="text-4xl font-bold mb-4">Experience Unparalleled Comfort</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Discover our carefully curated selection of rooms and suites, each designed to provide the perfect blend of luxury and comfort.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredRooms.map((room) => (
              <Card key={room.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={room.image}
                    alt={room.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg inline-block">
                      <span className="text-2xl font-bold text-slate-900">${room.price}</span>
                      <span className="text-slate-600">/night</span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-amber-600 transition-colors">
                    {room.name}
                  </h3>
                  <p className="text-slate-600 mb-4">{room.description}</p>
                  <Link href={room.link}>
                    <Button className="w-full group-hover:bg-amber-600 transition-colors">
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Event Celebrations Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/20 text-amber-600 mb-4">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">Event Celebrations</span>
            </div>
            <h2 className="text-4xl font-bold mb-4">Create Unforgettable Moments</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              From intimate gatherings to grand celebrations, our versatile event spaces are designed to make your special occasions truly memorable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredEvents.map((event) => (
              <Card key={event.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="relative h-80 overflow-hidden">
                  <Image
                    src={event.image}
                    alt={event.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg inline-block">
                      <span className="text-2xl font-bold text-slate-900">${event.price}</span>
                      <span className="text-slate-600">/event</span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-amber-600 transition-colors">
                    {event.name}
                  </h3>
                  <p className="text-slate-600 mb-4">{event.description}</p>
                  <Link href={event.link}>
                    <Button className="w-full group-hover:bg-amber-600 transition-colors">
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Excellence Section */}
      <section className="py-20 bg-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-50/50 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/20 text-amber-600 mb-4">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Excellence</span>
            </div>
            <h2 className="text-4xl font-bold mb-4">Why Choose Hotel 734?</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Experience the perfect blend of luxury, comfort, and exceptional service that sets us apart.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "🌟",
                title: "Luxury Experience",
                description: "Indulge in premium amenities and world-class service that exceeds expectations.",
                features: [
                  "Premium bedding and linens",
                  "High-end toiletries and amenities",
                  "24/7 room service",
                  "Personal concierge",
                  "In-room dining",
                  "Turn-down service",
                  "Laundry and dry cleaning",
                  "Complimentary Wi-Fi"
                ]
              },
              {
                icon: "🏊",
                title: "Premium Facilities",
                description: "Enjoy our state-of-the-art facilities and recreational areas designed for your comfort.",
                features: [
                  "Infinity swimming pool",
                  "Modern fitness center",
                  "Luxury spa and wellness",
                  "Fine dining restaurant",
                  "Rooftop bar and lounge",
                  "Business center",
                  "Conference facilities",
                  "Garden and terrace"
                ]
              },
              {
                icon: "🛡️",
                title: "24/7 Security",
                description: "Your safety is our priority with round-the-clock security and surveillance systems.",
                features: [
                  "CCTV surveillance system",
                  "Professional security personnel",
                  "Secure underground parking",
                  "In-room safe deposit",
                  "Electronic key card access",
                  "Fire safety systems",
                  "Emergency response team",
                  "Secure luggage storage"
                ]
              }
            ].map((feature, index) => (
              <Card key={index} className="p-8 text-center hover:shadow-xl transition-all duration-300 group bg-white/80 backdrop-blur-sm border-0">
                <div className="bg-amber-400/10 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-amber-400/20 transition-colors duration-300 transform group-hover:scale-110 transition-transform duration-300">
                  <span className="text-4xl">{feature.icon}</span>
                </div>
                <h3 className="text-2xl font-semibold mb-4 group-hover:text-amber-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-600 mb-6">{feature.description}</p>
                <ul className="space-y-3 text-left">
                  {feature.features.map((item, idx) => (
                    <li key={idx} className="flex items-center text-slate-600 group/item">
                      <span className="mr-3 text-amber-600 group-hover/item:text-amber-500 transition-colors">•</span>
                      <span className="group-hover/item:text-slate-900 transition-colors">{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
