"use client"

import Link from "next/link"
import Image from "next/image"
import Head from "next/head"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import DynamicHeader from "@/components/dynamic-header"
import SEOMetadata, { seoConfigs } from "@/components/SEOMetadata"
import StructuredData, { BreadcrumbStructuredData } from "@/components/StructuredData"
import { useState, useEffect } from "react"
import { ticketsAPI } from "@/lib/api"
import { ArrowRight, Star, Sparkles, Calendar, MapPin, Wifi, Car, Coffee, Dumbbell, Waves, Shield, Clock, Award, Users, Heart, Camera, CalendarDays, ExternalLink, AlertCircle, Ticket, DollarSign } from "lucide-react"

const featuredRooms = [
  {
    id: 1,
    name: "Classic Room",
    description: "Spacious room with modern amenities and city views",
    price: 250,
    image: "/one.jpg",
    link: "/rooms/1"
  },
  {
    id: 2,
    name: "Superior Room",
    description: "Luxurious suite with separate living area and premium services",
    price: 300,
    image: "/two.jpg",
    link: "/rooms/2"
  },
  {
    id: 3,
    name: "Royal Suite",
    description: "Ultimate luxury with panoramic views and exclusive amenities",
    price: 350,
    image: "/three.jpg",
    link: "/rooms/3"
  }
]

const featuredEvents = [
  {
    id: 1,
    name: "Outdoor Event Space",
    description: "Perfect for large gatherings and celebrations with comprehensive setup",
    image: "/cont.jpg",
    link: "/events"
  },
  {
    id: 2,
    name: "Conference Event Space",
    description: "Professional settings for business meetings and corporate gatherings",
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
    <>
      <SEOMetadata {...seoConfigs.home} />
      <StructuredData type="hotel" />
      <BreadcrumbStructuredData items={[
        { name: "Home", url: "/" }
      ]} />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
      {/* Floating background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-[#C49B66]/20 to-[#F4E4BC]/20 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-float-slow" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-[#C49B66]/10 to-amber-200/20 rounded-full blur-3xl animate-float-slow" style={{animationDelay: '4s'}}></div>
      </div>
      
      <DynamicHeader />

      {/* Dynamic Ticket Advertisement Banner */}
      {featuredTickets.length > 0 && (
        <section className="relative overflow-hidden bg-gradient-to-r from-[#1a233b] via-[#2a3441] to-[#1a233b] py-6 sm:py-8 border-y-4 border-[#FFD700] shadow-2xl">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-r from-[#FFD700]/30 to-[#C49B66]/30 rounded-full blur-3xl animate-float-slow"></div>
            <div className="absolute -top-5 right-20 w-32 h-32 bg-gradient-to-r from-[#C49B66]/25 to-[#FFD700]/25 rounded-full blur-2xl animate-float-slow" style={{animationDelay: '1s'}}></div>
            <div className="absolute bottom-0 left-1/3 w-36 h-36 bg-gradient-to-r from-[#FFD700]/20 to-[#F4E4BC]/20 rounded-full blur-3xl animate-float-slow" style={{animationDelay: '2s'}}></div>
            
            {/* Sparkle Effects */}
            <div className="absolute top-4 left-1/4 w-3 h-3 bg-[#FFD700] rounded-full animate-ping shadow-lg"></div>
            <div className="absolute top-8 right-1/3 w-2 h-2 bg-[#C49B66] rounded-full animate-ping shadow-lg" style={{animationDelay: '0.5s'}}></div>
            <div className="absolute bottom-6 left-1/2 w-3 h-3 bg-[#FFD700] rounded-full animate-ping shadow-lg" style={{animationDelay: '1.5s'}}></div>
            <div className="absolute top-1/2 left-1/5 w-2 h-2 bg-white rounded-full animate-ping shadow-lg" style={{animationDelay: '2s'}}></div>
            <div className="absolute bottom-4 right-1/4 w-2.5 h-2.5 bg-[#C49B66] rounded-full animate-ping shadow-lg" style={{animationDelay: '2.5s'}}></div>
          </div>

          {/* Luxury Pattern Overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFD700]/20 to-transparent animate-pulse"></div>
          </div>

          <div className="container-responsive relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-6">
              {/* Left Content */}
              <div className="flex-1 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-2 sm:mb-3">
                  <div className="flex items-center gap-1">
                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-[#FFD700] animate-spin-slow" />
                    <Ticket className="h-5 w-5 sm:h-6 sm:w-6 text-[#FFD700] animate-bounce" />
                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-[#C49B66] animate-spin-slow" />
                  </div>
                  <span className="text-[#FFD700] font-bold text-xs sm:text-sm uppercase tracking-wider animate-pulse shadow-lg">
                    ✨ EXCLUSIVE EVENTS AVAILABLE ✨
                  </span>
                </div>
                
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-white mb-2 sm:mb-3 animate-fade-in-up drop-shadow-lg">
                  <span className="bg-gradient-to-r from-[#FFD700] via-white to-[#C49B66] bg-clip-text text-transparent animate-glow">
                    Premium Experiences Await You!
                  </span>
                </h3>
                
                <p className="text-[#F4E4BC] text-sm sm:text-base lg:text-lg animate-fade-in-up font-medium drop-shadow-md" style={{animationDelay: '0.2s'}}>
                  🎫 {featuredTickets.length} premium event{featuredTickets.length > 1 ? 's' : ''} • Starting from <span className="text-[#FFD700] font-bold">GH₵{Math.min(...featuredTickets.map(t => t.price))}</span>
                </p>
              </div>

              {/* Right Action */}
              <div className="flex-shrink-0 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                <Link href="/tickets">
                  <Button 
                    size="lg" 
                    className="group relative overflow-hidden bg-gradient-to-r from-[#FFD700] via-[#C49B66] to-[#FFD700] hover:from-[#FFF700] hover:via-[#D4A574] hover:to-[#FFF700] text-[#1a233b] font-bold px-8 sm:px-12 py-4 sm:py-5 rounded-2xl shadow-2xl hover:shadow-[#FFD700]/50 transition-all duration-500 transform hover:scale-110 hover:-translate-y-2 border-2 border-white/20"
                  >
                    {/* Animated Background Shine */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    
                    {/* Button Content */}
                    <div className="relative flex items-center gap-3">
                      <Ticket className="h-6 w-6 sm:h-7 sm:w-7 animate-ticket-bounce group-hover:animate-spin transition-transform text-[#1a233b]" />
                      <span className="text-base sm:text-lg font-bold font-display">
                        EXPLORE EVENTS
                      </span>
                      <div className="flex items-center">
                        <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-1 transition-transform text-[#1a233b]" />
                        <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 ml-1 animate-sparkle-dance group-hover:animate-spin transition-transform text-[#1a233b]" />
                      </div>
                    </div>
                    
                    {/* Glowing Border Effect */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-[#FFD700] animate-pulse shadow-lg"></div>
                    
                    {/* Inner Glow */}
                    <div className="absolute inset-1 rounded-xl bg-gradient-to-r from-white/10 to-transparent opacity-50"></div>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Ticket Preview Cards (Mobile Carousel) */}
            <div className="mt-4 sm:mt-6 lg:hidden">
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {featuredTickets.slice(0, 3).map((ticket, idx) => (
                  <div 
                    key={ticket.id} 
                    className="flex-shrink-0 w-72 bg-gradient-to-br from-[#FFD700]/20 to-[#C49B66]/20 backdrop-blur-sm rounded-2xl p-5 border-2 border-[#FFD700]/30 animate-fade-in-up shadow-xl hover:shadow-[#FFD700]/20 transition-all duration-300 hover:scale-105"
                    style={{animationDelay: `${0.6 + idx * 0.1}s`}}
                  >
                    <div className="flex items-center gap-4">
                      {ticket.image_url && (
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-[#FFD700]/50">
                          <Image 
                            src={ticket.image_url} 
                            alt={ticket.title}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#1a233b]/60 to-transparent"></div>
                          <div className="absolute bottom-1 right-1">
                            <Ticket className="h-3 w-3 text-[#FFD700]" />
                          </div>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-bold text-sm truncate mb-1 drop-shadow-md">{ticket.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-[#F4E4BC] mb-1">
                          <Calendar className="h-3 w-3 text-[#FFD700]" />
                          <span>{new Date(ticket.event_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <DollarSign className="h-3 w-3 text-[#FFD700]" />
                          <span className="text-[#FFD700] font-bold">GH₵{ticket.price}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop Ticket Preview */}
            <div className="hidden lg:block mt-8">
              <div className="grid grid-cols-3 gap-6">
                {featuredTickets.slice(0, 3).map((ticket, idx) => (
                  <div 
                    key={ticket.id}
                    className="group bg-gradient-to-br from-[#FFD700]/15 to-[#C49B66]/15 backdrop-blur-sm rounded-2xl p-6 border-2 border-[#FFD700]/30 hover:border-[#FFD700]/60 transition-all duration-300 hover:scale-105 animate-fade-in-up shadow-xl hover:shadow-[#FFD700]/20"
                    style={{animationDelay: `${0.6 + idx * 0.1}s`}}
                  >
                    <div className="flex items-start gap-5">
                      {ticket.image_url && (
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 border-[#FFD700]/50">
                          <Image 
                            src={ticket.image_url} 
                            alt={ticket.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#1a233b]/60 to-transparent"></div>
                          <div className="absolute bottom-1 right-1">
                            <Ticket className="h-4 w-4 text-[#FFD700] drop-shadow-lg" />
                          </div>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-display font-bold text-lg mb-3 line-clamp-1 group-hover:text-[#FFD700] transition-colors drop-shadow-md">
                          {ticket.title}
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-[#F4E4BC]">
                            <Calendar className="h-4 w-4 text-[#FFD700]" />
                            <span className="font-medium">{new Date(ticket.event_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="h-4 w-4 text-[#FFD700]" />
                            <span className="font-bold text-[#FFD700] text-base">GH₵{ticket.price}</span>
                          </div>
                          {ticket.venue && (
                            <div className="flex items-center gap-2 text-xs text-[#C49B66]">
                              <MapPin className="h-3 w-3 text-[#FFD700]" />
                              <span className="truncate font-medium">{ticket.venue}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Luxury Accent */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-[#FFD700] via-[#C49B66] to-[#FFD700] animate-pulse shadow-lg"></div>
          
          {/* Corner Decorative Elements */}
          <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-[#FFD700]/50 rounded-tl-lg"></div>
          <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-[#FFD700]/50 rounded-tr-lg"></div>
          <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-[#FFD700]/50 rounded-bl-lg"></div>
          <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-[#FFD700]/50 rounded-br-lg"></div>
        </section>
      )}

      {/* Welcome Hero Section (Ultra Modern) */}
      <section className="relative section-responsive overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50" />
        <div className="container-responsive relative z-10">
          <div className="text-center mb-8 sm:mb-12 md:mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-full glass-morphism text-[#C49B66] mb-6 sm:mb-8 animate-glow">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base font-medium">New Edubiase, Ghana</span>
            </div>
            <h1 className="text-responsive-4xl font-display font-bold mb-6 sm:mb-8 text-gradient-bold animate-slide-up">
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
                  Hotel 734 is a premier hospitality destination nestled in the serene town of New Edubiase, Adansi South District. Located in the heart of Ghana's Ashanti Region, we offer a perfect blend of modern luxury and authentic Ghanaian hospitality, providing our guests with an unforgettable experience in a tranquil setting.
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
                    <Button size="lg" className="w-full gradient-gold hover:shadow-glow text-white font-bold px-4 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl hover-transition text-sm sm:text-base">
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
                  Discover our exceptional accommodations featuring elegantly appointed rooms and suites, each designed with comfort and style in mind. Our hotel serves as the perfect gateway to explore the rich cultural heritage of the Ashanti Region while enjoying world-class amenities, personalized service, and authentic Ghanaian cuisine that celebrates local flavors and traditions.
                </p>
                <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  <div className="glass-dark rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center group hover:scale-105 transition-transform">
                    <Award className="h-6 w-6 sm:h-8 sm:w-8 text-[#C49B66] mx-auto mb-2 sm:mb-3 group-hover:animate-spin-slow" />
                    <div className="text-2xl sm:text-3xl font-bold text-[#C49B66] mb-1">24/7</div>
                    <div className="text-xs sm:text-sm text-slate-600 font-medium">Service</div>
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
            <h2 className="text-responsive-3xl font-display font-bold mb-6 sm:mb-8 text-dark-gold">Experience Unparalleled Comfort</h2>
            <p className="text-responsive-base text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Discover our carefully curated selection of rooms and suites, each designed to provide the perfect blend of comfort and quality.
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
                      <div className="gradient-price-tag text-white font-bold text-lg px-6 py-3 rounded-2xl shadow-luxury animate-float border border-white/20">
                        GH₵{room.price}/night
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
            <h2 className="text-responsive-3xl font-display font-bold mb-6 sm:mb-8 text-dark-gold">What Our Guests Say</h2>
            <p className="text-responsive-base text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Discover why thousands of guests choose Hotel 734 for their most memorable experiences.
            </p>
          </div>
          
          <div className="grid grid-responsive-3 gap-6 sm:gap-8">
            {[
              {
                name: "Kwame Osei",
                text: "Me and my wife came here for our 10th anniversary last month. Honestly, the place is nice ooo. The staff treated us well and the banku with tilapia was fresh. My wife said the room was clean and she liked how quiet it was. We will come back again.",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
                rating: 4,
                location: "Teacher, Kumasi"
              },
              {
                name: "Akosua Mensah",
                text: "I brought my 3 children here during Christmas holidays. The kids loved the swimming pool and the rooms were okay. Not too expensive and the location is good if you want to visit family around New Edubiase. The jollof rice was tasty too.",
                image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
                rating: 4,
                location: "Nurse, Accra"
              },
              {
                name: "James Appiah",
                text: "We used their conference hall for our company workshop. The room was fine and they helped us set up the projector. The lunch they served was good - rice and chicken with some vegetables. Fair price for what we got. I can recommend it.",
                image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
                rating: 4,
                location: "Business Owner, Obuasi"
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
                  <div className="text-slate-600 leading-relaxed text-base group-hover:text-slate-700 transition-colors">
                    {testimonial.text}
                  </div>
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
            <h2 className="text-responsive-3xl font-display font-bold mb-6 sm:mb-8 text-dark-gold">Gallery Preview</h2>
            <p className="text-responsive-base text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Explore our stunning spaces and premium amenities through our curated gallery.
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
            <h2 className="text-responsive-3xl font-display font-bold mb-6 sm:mb-8 text-dark-gold">Create Unforgettable Moments</h2>
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
            <h2 className="text-responsive-3xl font-display font-bold mb-6 sm:mb-8 text-dark-gold">Why Choose Hotel 734?</h2>
            <p className="text-responsive-base text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Experience the perfect blend of comfort, quality, and exceptional service that sets us apart.
            </p>
          </div>
          <div className="grid grid-responsive-3 gap-6 sm:gap-8">
            {[
              {
                icon: Star,
                title: "Premium Experience",
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
            <h2 className="text-responsive-3xl font-display font-bold mb-6 sm:mb-8 text-dark-gold">Ready for Your Perfect Stay?</h2>
            <p className="text-responsive-base text-slate-600 max-w-3xl mx-auto leading-relaxed mb-8 sm:mb-12">
              Don't wait to experience exceptional comfort and quality service. Book your stay at Hotel 734 today and create memories that will last a lifetime.
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
                <Button size="lg" className="w-full gradient-gold hover:shadow-glow text-white font-bold px-4 sm:px-12 py-3 sm:py-4 rounded-xl sm:rounded-2xl hover-transition text-sm sm:text-base">
                  <Users className="mr-1 sm:mr-2 h-4 w-4 sm:h-6 sm:w-6" />
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  )
}
