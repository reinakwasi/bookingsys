"use client"

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EventBookingForm from "@/components/EventBookingForm";
import { Calendar, Users, ArrowRight, Sparkles, Award, Star, Zap, PartyPopper, Building2 } from "lucide-react";

// Event space options - generic spaces that require custom event type input
const mainEvents = [
  {
    _id: 'outdoor-space',
    name: 'Outdoor Event Space',
    description: 'Perfect for large gatherings and celebrations. Our spacious outdoor area can accommodate various events with comprehensive setup and professional equipment.',
    type: '',
    image: '/cont.jpg',
    features: ['Outdoor Space', 'Professional Chairs', 'Professional Speakers', 'Event Tent', 'Parking', 'Sound System'],
    category: 'Outdoor Events'
  },
  {
    _id: 'conference-space',
    name: 'Conference Event Space',
    description: 'Professional conference settings perfect for business meetings, presentations, and corporate gatherings. Equipped with state-of-the-art facilities and comfortable arrangements.',
    type: '',
    image: '/backimg2.jpg',
    features: ['AV Equipment', 'Projectors', 'Whiteboards'],
    category: 'Conference Events'
  }
];

export default function EventsPage() {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleBookEvent = (event: any) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
  };

  const handleBookingSuccess = () => {
    setIsDialogOpen(false);
    setSelectedEvent(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black relative overflow-hidden">
      {/* Dynamic background pattern */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-amber-500/10 to-yellow-500/10"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-400/5 via-transparent to-yellow-400/5"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-amber-400/15 to-yellow-400/15 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-yellow-400/15 to-orange-400/15 rounded-full blur-3xl animate-float-slow" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-amber-300/8 to-yellow-300/8 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="container-responsive py-12 sm:py-16 lg:py-24 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16 sm:mb-20 lg:mb-24 animate-fade-in-up">
          <div className="relative inline-block mb-6 sm:mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full blur-xl opacity-60 animate-glow"></div>
            <div className="relative bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-full border border-amber-300/30 backdrop-blur-sm shadow-2xl">
              <div className="flex items-center gap-2 sm:gap-3">
                <PartyPopper className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 animate-bounce" />
                <span className="font-bold text-sm sm:text-base lg:text-lg">Elite Event Experiences</span>
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 animate-bounce" style={{animationDelay: '0.5s'}} />
              </div>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-6 sm:mb-8 bg-gradient-to-r from-amber-100 via-yellow-100 to-white bg-clip-text text-transparent leading-tight drop-shadow-2xl px-4">
            Unforgettable Event Spaces
          </h1>
          <div className="max-w-4xl mx-auto mb-8 sm:mb-12">
            <p className="text-responsive-base text-amber-50 leading-relaxed mb-4 sm:mb-6 drop-shadow-lg">
              Transform your vision into reality with our spectacular event venues
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 lg:gap-8 text-amber-200">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 fill-yellow-400" />
                <span className="font-semibold text-sm sm:text-base">Premium Quality</span>
              </div>
              <div className="hidden sm:block w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                <span className="font-semibold text-sm sm:text-base">Expert Planning</span>
              </div>
              <div className="hidden sm:block w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                <span className="font-semibold text-sm sm:text-base">Full Service</span>
              </div>
            </div>
          </div>
        </div>

        {/* Events Grid - Unique Card Design */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16">
          {mainEvents.map((event, index) => (
            <div key={event._id} className="group animate-fade-in-up" style={{animationDelay: `${index * 0.3}s`}}>
              <div className="relative">
                {/* Glowing border effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 rounded-2xl sm:rounded-3xl blur-xl opacity-40 group-hover:opacity-70 hover-transition animate-glow"></div>
                
                <div className="relative bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl overflow-hidden border border-amber-400/20 shadow-2xl hover-transition hover:scale-[1.02] hover:shadow-amber-500/20">
                  {/* Header with icon and category */}
                  <div className="relative p-4 sm:p-6 bg-gradient-to-r from-amber-500/25 to-yellow-500/25 border-b border-amber-400/20">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <div className="flex items-center gap-3">
                        {event.type === 'Compound' ? (
                          <PartyPopper className="h-6 w-6 sm:h-8 sm:w-8 text-amber-400" />
                        ) : (
                          <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-amber-400" />
                        )}
                        <div className="flex-1">
                          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white drop-shadow-lg">{event.name}</h3>
                          <p className="text-amber-200 text-xs sm:text-sm font-medium">{event.category}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Image section with overlay */}
                  <div className="relative h-48 sm:h-56 lg:h-64 overflow-hidden">
                    <Image
                      src={event.image || '/cont.jpg'}
                      alt={event.name}
                      fill
                      className="object-cover hover-transition group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-slate-900/40 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-400/25 via-transparent to-yellow-400/25 opacity-0 group-hover:opacity-100 hover-transition" />
                  
                    {/* Event Info */}
                    <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4">
                      <div className="bg-black/70 backdrop-blur-md rounded-lg sm:rounded-xl p-2 sm:p-3 border border-amber-400/30 shadow-lg">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-white">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
                            <span className="font-semibold text-sm sm:text-base">Expert Planning</span>
                          </div>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-yellow-400" />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                
                  {/* Content section */}
                  <div className="p-4 sm:p-6">
                    <p className="text-slate-300 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">{event.description}</p>
                  
                    {/* Features with modern styling */}
                    {event.features && (
                      <div className="mb-4 sm:mb-6">
                        <h4 className="text-xs sm:text-sm font-bold text-amber-200 mb-3 sm:mb-4 uppercase tracking-wider flex items-center gap-2">
                          <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                          What's Included
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                          {event.features.map((feature: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 p-2 sm:p-3 bg-gradient-to-r from-amber-400/15 to-yellow-400/15 rounded-lg border border-amber-400/30 hover:border-amber-400/50 hover-transition hover:bg-amber-400/20">
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full animate-pulse flex-shrink-0"></div>
                              <span className="text-xs sm:text-sm text-slate-200 font-medium">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  
                    {/* Action button */}
                    <div className="pt-3 sm:pt-4 border-t border-white/10">
                      <Button 
                        size="lg" 
                        className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-900 font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl hover-transition hover:scale-105 hover:shadow-xl hover:shadow-amber-500/30 border border-amber-300/50 shadow-lg text-sm sm:text-base"
                        onClick={() => handleBookEvent(event)}
                      >
                        <Calendar className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" />
                        Book Event Space
                        <ArrowRight className="ml-2 sm:ml-3 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action - Futuristic Design */}
        <div className="text-center mt-24 animate-fade-in-up">
          <div className="relative max-w-5xl mx-auto">
            {/* Glowing background */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400/25 via-yellow-400/25 to-orange-400/25 rounded-3xl blur-2xl"></div>
            
            <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-3xl p-12 border border-amber-400/20 shadow-2xl">
              <div className="flex items-center justify-center mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full blur-xl opacity-70 animate-glow"></div>
                  <div className="relative bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full p-6 border border-amber-300/30 shadow-xl">
                    <Award className="h-12 w-12 text-white" />
                  </div>
                </div>
              </div>
              
              <h3 className="text-4xl font-black mb-6 bg-gradient-to-r from-amber-100 via-yellow-100 to-white bg-clip-text text-transparent drop-shadow-lg">
                Need Custom Planning?
              </h3>
              <p className="text-xl text-amber-50 leading-relaxed mb-10 max-w-3xl mx-auto drop-shadow-md">
                Our expert event coordinators are standing by to bring your vision to life. 
                Get personalized consultation and tailored packages for your special occasion.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <a href="/contact">
                  <Button size="lg" className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-900 font-bold px-10 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-amber-500/30 border border-amber-300/50 shadow-lg">
                    <Calendar className="mr-3 h-6 w-6" />
                    Get Expert Consultation
                  </Button>
                </a>
                <a href="/facilities">
                  <Button size="lg" className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white border-2 border-slate-500/60 hover:border-slate-400 font-bold px-10 py-4 rounded-xl transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-slate-500/30">
                    <Sparkles className="mr-3 h-6 w-6" />
                    Explore All Facilities
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Dialog - Dark Theme */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900/95 backdrop-blur-xl border border-amber-400/40 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-amber-300 to-yellow-300 bg-clip-text text-transparent drop-shadow-lg">
              Request Event Booking
            </DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <EventBookingForm
              eventId={selectedEvent._id}
              eventType={selectedEvent.type}
              onSuccess={handleBookingSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
