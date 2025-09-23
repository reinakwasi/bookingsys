"use client"

import Link from "next/link"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import DynamicHeader from "@/components/dynamic-header"
import { useState, useEffect } from "react"
import { ticketsAPI } from "@/lib/api"
import { ArrowRight, Star, Sparkles, Calendar, MapPin, Wifi, Car, Coffee, Dumbbell, Waves, Shield, Clock, Award, Users, Heart, Camera, CalendarDays, ExternalLink, AlertCircle, Ticket, DollarSign } from "lucide-react"

const featuredRooms = [
  {
    id: 1,
    name: "Classic Room",
    description: "Spacious room with modern amenities and city views",
    price: 150,
    image: "/one.jpg",
    link: "/rooms/1"
  },
  {
    id: 2,
    name: "Superior Room",
    description: "Luxurious suite with separate living area and premium services",
    price: 250,
    image: "/two.jpg",
    link: "/rooms/2"
  },
  {
    id: 3,
    name: "Royal Suite",
    description: "Ultimate luxury with panoramic views and exclusive amenities",
    price: 500,
    image: "/three.jpg",
    link: "/rooms/3"
  }
]

const featuredEvents = [
  {
    id: 1,
    name: "Compound Events",
    description: "Perfect for large gatherings and celebrations",
    price: 1000,
    image: "/cont.jpg",
    link: "/events"
  },
  {
    id: 2,
    name: "Conference Events",
    description: "Professional settings for business meetings and conferences",
    price: 800,
    image: "/backimg2.jpg",
    link: "/events"
  }
]

// Events come from admin/API - no hardcoded events
const upcomingEvents: any[] = []

// Set to empty array to test "no events" state
// const upcomingEvents = []

// Test single event - uncomment to test single event layout
// const upcomingEvents = [
//   {
//     id: 1,
//     title: "New Year Gala 2025",
//     description: "Join us for an unforgettable New Year celebration with live music, gourmet dining, and spectacular fireworks.",
//     date: "2025-12-31",
//     time: "19:00",
//     venue: "Hotel 734",
//     ticketPrice: 150,
//     image: "/poolview1.jpg",
//     category: "Celebration",
//     availableTickets: 250,
//     totalTickets: 300
//   }
// ]

export default function Home() {
  const [featuredTickets, setFeaturedTickets] = useState<any[]>([]);

  useEffect(() => {
    loadFeaturedTickets();
  }, []);

  const loadFeaturedTickets = async () => {
    try {
      const tickets = await ticketsAPI.getActive();
      // Show only first 3 tickets for homepage
      setFeaturedTickets(tickets.slice(0, 3));
    } catch (error) {
      console.error('Failed to load featured tickets:', error);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
      {/* Floating background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-[#C49B66]/20 to-[#F4E4BC]/20 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-float-slow" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-[#C49B66]/10 to-amber-200/20 rounded-full blur-3xl animate-float-slow" style={{animationDelay: '4s'}}></div>
      </div>
      
      <DynamicHeader />


      {/* Welcome Hero Section (Ultra Modern) */}
      <section className="relative section-responsive overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50" />
        <div className="container-responsive relative z-10">
          <div className="text-center mb-8 sm:mb-12 md:mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-full glass-morphism text-[#C49B66] mb-6 sm:mb-8 animate-glow">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base font-medium">New Edubiase, Ghana</span>
            </div>
            <h1 className="text-responsive-4xl font-display font-bold mb-6 sm:mb-8 text-gradient animate-slide-up">
              Hotel 734
            </h1>
            <div className="flex items-center justify-center mb-12 animate-fade-in">
              <div className="h-px w-32 bg-gradient-to-r from-transparent via-[#C49B66] to-transparent" />
              <div className="mx-4 flex gap-2">
                <div className="w-2 h-2 rounded-full bg-[#C49B66] animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-[#C49B66] animate-pulse" style={{animationDelay: '0.5s'}} />
                <div className="w-2 h-2 rounded-full bg-[#C49B66] animate-pulse" style={{animationDelay: '1s'}} />
              </div>
              <div className="h-px w-32 bg-gradient-to-r from-transparent via-[#C49B66] to-transparent" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            <div className="space-y-6 sm:space-y-8 animate-slide-up-delay-1">
              <div className="glass-morphism rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-luxury">
                <h2 className="text-responsive-2xl font-display font-bold mb-4 sm:mb-6 text-slate-800">Excellence Pays It All</h2>
                <p className="text-responsive-base text-slate-600 leading-relaxed mb-4 sm:mb-6">
                  Hotel 734 sets the standard for lavish accommodations, exquisite dining, and world-class events. Experience unparalleled elegance and exceptional service in our renowned establishment.
                </p>
                <div className="flex items-center gap-4 text-slate-600 mb-6">
                  <MapPin className="h-5 w-5 text-[#C49B66]" />
                  <span>New Edubiase off Bronikrom road</span>
                </div>
                <div className="flex flex-row gap-3 sm:gap-4">
                  <Link href="/facilities" className="flex-1 sm:w-auto">
                    <Button size="lg" className="w-full gradient-gold hover:shadow-glow text-white font-bold px-4 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base">
                      <Sparkles className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="hidden xs:inline">Explore </span>Amenities
                    </Button>
                  </Link>
                  <Link href="/contact" className="flex-1 sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full glass-morphism border-[#C49B66]/30 text-[#C49B66] hover:bg-[#C49B66] hover:text-white font-bold px-4 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-300 text-sm sm:text-base">
                      <MapPin className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="hidden xs:inline">Get </span>Directions
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="animate-slide-up-delay-2">
              <div className="glass-morphism rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-luxury">
                <p className="text-responsive-base text-slate-600 leading-relaxed mb-6 sm:mb-8">
                  Indulge in our signature dining experiences, from the renowned Hotel 734 Salad to our exquisite Veal Oscar. Enjoy romantic evenings in our sophisticated lounge while live music creates the perfect ambiance.
                </p>
                <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center group hover:scale-105 transition-transform">
                    <Award className="h-6 w-6 sm:h-8 sm:w-8 text-[#C49B66] mx-auto mb-2 sm:mb-3 group-hover:animate-spin-slow" />
                    <div className="text-2xl sm:text-3xl font-bold text-[#C49B66] mb-1">5★</div>
                    <div className="text-xs sm:text-sm text-slate-600 font-medium">Luxury Rating</div>
                  </div>
                  <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center group hover:scale-105 transition-transform">
                    <Users className="h-6 w-6 sm:h-8 sm:w-8 text-[#C49B66] mx-auto mb-2 sm:mb-3 group-hover:animate-pulse" />
                    <div className="text-2xl sm:text-3xl font-bold text-[#C49B66] mb-1">1000+</div>
                    <div className="text-xs sm:text-sm text-slate-600 font-medium">Happy Guests</div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3 sm:gap-4">
                  {[Wifi, Car, Coffee, Dumbbell].map((Icon, idx) => (
                    <div key={idx} className="glass-morphism rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-center justify-center group hover:bg-[#C49B66]/10 transition-colors">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-[#C49B66] group-hover:scale-110 transition-transform" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Luxury Accommodations Section (Ultra Modern Cards) */}
      <section className="section-responsive relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/30 to-slate-50" />
        <div className="container-responsive relative z-10">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-full glass-morphism text-[#C49B66] mb-6 sm:mb-8 animate-glow">
              <Star className="h-4 w-4 sm:h-5 sm:w-5 animate-spin-slow" />
              <span className="text-sm sm:text-base font-medium">Luxury Accommodations</span>
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" />
            </div>
            <h2 className="text-responsive-3xl font-display font-bold mb-6 sm:mb-8 text-gradient">Experience Unparalleled Comfort</h2>
            <p className="text-responsive-base text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Discover our carefully curated selection of rooms and suites, each designed to provide the perfect blend of luxury and comfort.
            </p>
          </div>

          <div className="grid grid-responsive-3 gap-6 sm:gap-8">
            {featuredRooms.map((room, i) => (
              <div key={room.id} className="group relative animate-fade-in-up" style={{animationDelay: `${i * 0.2}s`}}>
                <div className="glass-morphism rounded-3xl overflow-hidden shadow-luxury hover:shadow-glow hover-transition hover:-translate-y-2 hover:scale-[1.02]">
                  <div className="relative h-80 overflow-hidden">
                    <Image
                      src={room.image}
                      alt={room.name}
                      fill
                      className="object-cover hover-transition group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#C49B66]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 hover-transition" />
                    
                    {/* Floating price badge */}
                    <div className="absolute top-6 right-6 z-10">
                      <div className="gradient-gold text-white font-bold text-lg px-6 py-3 rounded-2xl shadow-luxury animate-float border border-white/20">
                        ${room.price}/night
                      </div>
                    </div>
                    
                    {/* Luxury badge */}
                    <div className="absolute bottom-6 left-6 flex items-center gap-3">
                      <div className="glass-morphism rounded-full p-3 shadow-lg">
                        <Star className="h-6 w-6 text-[#C49B66] animate-spin-slow" />
                      </div>
                      <span className="text-white font-bold text-lg drop-shadow-lg">Luxury</span>
                    </div>
                    
                    {/* Hover overlay with enhanced button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 backdrop-blur-sm hover-transition">
                      <Link href={room.link}>
                        <Button size="lg" className="gradient-gold hover:shadow-glow text-white font-bold px-8 py-4 rounded-2xl hover-transition hover:scale-105 animate-scale-in">
                          <Camera className="mr-2 h-5 w-5" />
                          View Details
                          <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                  
                  <div className="p-8">
                    <h3 className="text-2xl font-display font-bold mb-3 text-slate-800 group-hover:text-[#C49B66] transition-colors">
                      {room.name}
                    </h3>
                    <p className="text-slate-600 leading-relaxed mb-4">{room.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {[1,2,3,4,5].map((star) => (
                          <Star key={star} className="h-4 w-4 text-[#C49B66] fill-[#C49B66]" />
                        ))}
                      </div>
                      <span className="text-sm text-slate-500 font-medium">Premium Suite</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section (Ultra Modern) */}
      <section className="section-responsive relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-slate-50" />
        <div className="container-responsive max-w-6xl relative z-10">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-full glass-morphism text-[#C49B66] mb-6 sm:mb-8 animate-glow">
              <Heart className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" />
              <span className="text-sm sm:text-base font-medium">Guest Experiences</span>
              <Heart className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" />
            </div>
            <h2 className="text-responsive-3xl font-display font-bold mb-6 sm:mb-8 text-gradient">What Our Guests Say</h2>
            <p className="text-responsive-base text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Discover why thousands of guests choose Hotel 734 for their most memorable experiences.
            </p>
          </div>
          
          <div className="grid grid-responsive-3 gap-6 sm:gap-8">
            {[
              {
                name: "Ama Boateng",
                text: "Absolutely stunning! The rooms were spotless and the service was the best I've ever experienced. Every detail was perfect.",
                image: "/room3.jpg",
                rating: 5,
                location: "Accra, Ghana"
              },
              {
                name: "Kwame Mensah",
                text: "The event spaces are perfect for celebrations. Our wedding was magical thanks to Hotel 734's exceptional team!",
                image: "/poolview2.jpg",
                rating: 5,
                location: "Kumasi, Ghana"
              },
              {
                name: "Linda Osei",
                text: "Amazing food, friendly staff, and a beautiful pool. The luxury amenities exceeded all expectations!",
                image: "/view.jpg",
                rating: 5,
                location: "Takoradi, Ghana"
              },
            ].map((testimonial, idx) => (
              <div key={idx} className="group animate-fade-in-up" style={{animationDelay: `${idx * 0.2}s`}}>
                <div className="glass-morphism rounded-3xl p-8 shadow-luxury hover:shadow-glow hover-transition hover:-translate-y-1 hover:scale-[1.02]">
                  <div className="flex items-center mb-6">
                    <div className="relative">
                      <Image 
                        src={testimonial.image} 
                        alt={testimonial.name} 
                        width={80} 
                        height={80} 
                        className="rounded-full object-cover border-4 border-[#C49B66]/30 shadow-lg group-hover:border-[#C49B66] transition-colors" 
                      />
                      <div className="absolute -bottom-2 -right-2 glass-morphism rounded-full p-2">
                        <Star className="h-4 w-4 text-[#C49B66] fill-[#C49B66]" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-display font-bold text-lg text-slate-800 group-hover:text-[#C49B66] transition-colors">{testimonial.name}</h4>
                      <p className="text-sm text-slate-500">{testimonial.location}</p>
                      <div className="flex gap-1 mt-1">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-[#C49B66] fill-[#C49B66]" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <blockquote className="text-slate-600 leading-relaxed italic text-lg group-hover:text-slate-700 transition-colors">
                    "{testimonial.text}"
                  </blockquote>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Preview Section (Ultra Modern Grid) */}
      <section className="section-responsive relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/30 to-blue-50" />
        <div className="container-responsive relative z-10">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-full glass-morphism text-[#C49B66] mb-6 sm:mb-8 animate-glow">
              <Camera className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" />
              <span className="text-sm sm:text-base font-medium">Visual Experience</span>
              <Camera className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" />
            </div>
            <h2 className="text-responsive-3xl font-display font-bold mb-6 sm:mb-8 text-gradient">Gallery Preview</h2>
            <p className="text-responsive-base text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Explore our stunning spaces and luxurious amenities through our curated gallery.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {['/room1.jpg','/room2.jpg','/three.jpg','/poolview2.jpg'].map((img, idx) => (
              <div key={idx} className="group relative animate-fade-in-up" style={{animationDelay: `${idx * 0.1}s`}}>
                <div className="glass-morphism rounded-3xl overflow-hidden shadow-luxury hover:shadow-glow hover-transition hover:-translate-y-1 hover:scale-[1.02] cursor-pointer">
                  <div className="relative h-64 overflow-hidden">
                    <Image 
                      src={img} 
                      alt={`Gallery ${idx+1}`} 
                      fill
                      className="object-cover hover-transition group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 hover-transition" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 hover-transition">
                      <div className="glass-morphism rounded-2xl px-6 py-3 transform scale-90 group-hover:scale-100 hover-transition">
                        <span className="text-white font-bold flex items-center gap-2">
                          <Camera className="h-5 w-5" />
                          View
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center animate-fade-in-up">
            <Link href="/gallery">
              <Button size="lg" className="gradient-gold hover:shadow-glow text-white font-bold px-8 sm:px-12 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-105">
                <Camera className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                View Full Gallery
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>


      {/* Event Celebrations Section (Ultra Modern) */}
      <section className="section-responsive relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/30" />
        <div className="container-responsive relative z-10">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-full glass-morphism text-[#C49B66] mb-6 sm:mb-8 animate-glow">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 animate-spin-slow" />
              <span className="text-sm sm:text-base font-medium">Event Celebrations</span>
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" />
            </div>
            <h2 className="text-responsive-3xl font-display font-bold mb-6 sm:mb-8 text-gradient">Create Unforgettable Moments</h2>
            <p className="text-responsive-base text-slate-600 max-w-3xl mx-auto leading-relaxed">
              From intimate gatherings to grand celebrations, our versatile event spaces are designed to make your special occasions truly memorable.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
            {featuredEvents.map((event, i) => (
              <div key={event.id} className="group animate-fade-in-up" style={{animationDelay: `${i * 0.2}s`}}>
                <div className="glass-morphism rounded-3xl overflow-hidden shadow-luxury hover:shadow-glow hover-transition hover:-translate-y-2 hover:scale-[1.02]">
                  <div className="relative h-96 overflow-hidden">
                    <Image
                      src={event.image}
                      alt={event.name}
                      fill
                      className="object-cover hover-transition group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#C49B66]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 hover-transition" />
                    
                    {/* Floating price badge */}
                    <div className="absolute top-6 right-6 z-10">
                      <div className="gradient-gold text-white font-bold text-xl px-6 py-3 rounded-2xl shadow-luxury animate-float border border-white/20">
                        ${event.price}/event
                      </div>
                    </div>
                    
                    {/* Event type badge */}
                    <div className="absolute bottom-6 left-6 flex items-center gap-3">
                      <div className="glass-morphism rounded-full p-3 shadow-lg">
                        <Calendar className="h-6 w-6 text-[#C49B66] animate-spin-slow" />
                      </div>
                      <span className="text-white font-bold text-lg drop-shadow-lg">Premium Event</span>
                    </div>
                  </div>
                  
                  <div className="p-8">
                    <h3 className="text-3xl font-display font-bold mb-4 text-slate-800 group-hover:text-[#C49B66] transition-colors">
                      {event.name}
                    </h3>
                    <p className="text-slate-600 leading-relaxed mb-6 text-lg">{event.description}</p>
                    <Link href="/events">
                      <Button size="lg" className="w-full gradient-gold hover:shadow-glow text-white font-bold px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105">
                        <Calendar className="mr-2 h-5 w-5" />
                        View All Events
                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Excellence Section (Ultra Modern Cards) */}
      <section className="section-responsive relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/30 to-slate-50" />
        <div className="bg-radial-luxury absolute inset-0 pointer-events-none" />
        <div className="container-responsive relative z-10">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-full glass-morphism text-[#C49B66] mb-6 sm:mb-8 animate-glow">
              <Award className="h-4 w-4 sm:h-5 sm:w-5 animate-spin-slow" />
              <span className="text-sm sm:text-base font-medium">Excellence</span>
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" />
            </div>
            <h2 className="text-responsive-3xl font-display font-bold mb-6 sm:mb-8 text-gradient">Why Choose Hotel 734?</h2>
            <p className="text-responsive-base text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Experience the perfect blend of luxury, comfort, and exceptional service that sets us apart.
            </p>
          </div>
          <div className="grid grid-responsive-3 gap-6 sm:gap-8">
            {[
              {
                icon: Star,
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
                icon: Waves,
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
                icon: Shield,
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
            ].map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="group animate-fade-in-up" style={{animationDelay: `${index * 0.2}s`}}>
                  <div className="glass-morphism rounded-3xl p-10 shadow-luxury hover:shadow-glow transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 text-center">
                    <div className="gradient-gold rounded-3xl w-24 h-24 flex items-center justify-center mx-auto mb-8 group-hover:animate-glow transition-all duration-300 shadow-luxury">
                      <IconComponent className="h-12 w-12 text-white animate-float" />
                    </div>
                    <h3 className="text-2xl font-display font-bold mb-6 text-slate-800 group-hover:text-[#C49B66] transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed mb-8 text-lg">{feature.description}</p>
                    <div className="space-y-4 text-left">
                      {feature.features.map((item, idx) => (
                        <div key={idx} className="flex items-center group/item hover:bg-[#C49B66]/5 rounded-xl p-3 transition-colors">
                          <div className="w-2 h-2 rounded-full bg-[#C49B66] mr-4 group-hover/item:animate-pulse" />
                          <span className="text-slate-600 group-hover/item:text-slate-800 transition-colors font-medium">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* Call to Action Section */}
      <section className="section-responsive relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#C49B66]/10 via-white to-blue-50/30" />
        <div className="container-responsive relative z-10">
          <div className="glass-morphism rounded-2xl sm:rounded-3xl p-8 sm:p-12 lg:p-16 shadow-luxury text-center animate-fade-in-up">
            <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-full glass-dark text-[#C49B66] mb-6 sm:mb-8 animate-glow">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 animate-spin-slow" />
              <span className="text-sm sm:text-base font-medium">Book Now</span>
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 animate-spin-slow" />
            </div>
            <h2 className="text-responsive-3xl font-display font-bold mb-6 sm:mb-8 text-gradient">Ready for Your Luxury Experience?</h2>
            <p className="text-responsive-base text-slate-600 max-w-3xl mx-auto leading-relaxed mb-8 sm:mb-12">
              Don't wait to experience the pinnacle of luxury and comfort. Book your stay at Hotel 734 today and create memories that will last a lifetime.
            </p>
            <div className="flex flex-row gap-4 sm:gap-6 justify-center max-w-md mx-auto sm:max-w-none">
              <Link href="/booking" className="flex-1 sm:w-auto">
                <Button size="lg" className="w-full gradient-gold hover:shadow-glow text-white font-bold px-4 sm:px-12 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base">
                  <Calendar className="mr-1 sm:mr-2 h-4 w-4 sm:h-6 sm:w-6" />
                  <span className="hidden xs:inline">Book Your </span>Stay
                  <ArrowRight className="ml-1 sm:ml-2 h-4 w-4 sm:h-6 sm:w-6" />
                </Button>
              </Link>
              <Link href="/contact" className="flex-1 sm:w-auto">
                <Button size="lg" variant="outline" className="w-full glass-morphism border-[#C49B66]/30 text-[#C49B66] hover:bg-[#C49B66] hover:text-white font-bold px-4 sm:px-12 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-300 text-sm sm:text-base">
                  <Users className="mr-1 sm:mr-2 h-4 w-4 sm:h-6 sm:w-6" />
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
