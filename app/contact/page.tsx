import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact Us - Get In Touch with Hotel 734",
  description: "Contact Hotel 734 for reservations, inquiries, and support. Reach out to our friendly team for assistance with bookings, events, and any questions about our luxury hotel services.",
  keywords: ["contact hotel", "hotel reservations", "customer service", "Hotel 734 contact", "hotel inquiries", "booking assistance"],
  openGraph: {
    title: "Contact Us - Hotel 734",
    description: "Contact Hotel 734 for reservations, inquiries, and support. Reach out to our friendly team for assistance with bookings and events.",
    url: "https://hotel734.com/contact",
    images: [
      {
        url: "/contact-og.jpg",
        width: 1200,
        height: 630,
        alt: "Contact Hotel 734",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us - Hotel 734",
    description: "Contact Hotel 734 for reservations, inquiries, and support. Reach out to our friendly team for assistance.",
    images: ["/contact-og.jpg"],
  },
}

"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, MapPin, Phone, Mail } from "lucide-react"
import { Label } from "@/components/ui/label"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  subject: z.string().min(5, {
    message: "Subject must be at least 5 characters.",
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
})

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    setError(null)
    
    try {
      console.log('📧 Submitting contact form:', values)
      const { messagesAPI } = await import("@/lib/messagesAPI");
      const result = await messagesAPI.create(values);
      console.log('✅ Message sent successfully:', result)
      setIsSubmitted(true);
      form.reset();
    } catch (err: any) {
      console.error('❌ Contact form error:', err)
      setError(err.message || "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 relative overflow-hidden">
      {/* Hero Section with Background Image */}
      <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/cont.jpg" 
            alt="Hotel 734 Contact" 
            className="w-full h-full object-cover"
          />
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/50"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 md:px-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white mb-8 animate-fade-in-up">
            <Mail className="h-5 w-5 animate-pulse" />
            <span className="font-medium text-lg">Get In Touch</span>
            <Phone className="h-5 w-5 animate-pulse" />
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            Contact <span className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 bg-clip-text text-transparent">Hotel 734</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto animate-fade-in-up" style={{animationDelay: '0.4s'}}>
            We're here to make your stay unforgettable. Reach out to us anytime.
          </p>
          
          
          {/* Scroll Down Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
        
        {/* Floating Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-amber-200/20 to-yellow-200/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-yellow-200/10 to-amber-200/10 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
      </section>
      
      {/* Main Content Section */}
      <section className="w-full py-24 md:py-32 relative z-10 bg-gradient-to-br from-amber-50 via-white to-yellow-50">
        <div className="container px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-3 lg:gap-16">
            {/* Contact Info Card */}
            <div className="col-span-1 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
              <div className="glass-morphism rounded-3xl p-8 shadow-luxury hover:shadow-glow transition-all duration-500 h-full">
                <div className="text-center mb-8">
                  <div className="bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Phone className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">Contact Information</h3>
                  <p className="text-slate-600">We'd love to hear from you!</p>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4 p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors">
                    <div className="bg-amber-500 rounded-full p-3">
                      <Phone className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">Phone</p>
                      <p className="text-amber-600 font-medium">0244093821</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors">
                    <div className="bg-amber-500 rounded-full p-3">
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">Email</p>
                      <p className="text-amber-600 font-medium">info@hotel734@gmail.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors">
                    <div className="bg-amber-500 rounded-full p-3">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">Address</p>
                      <p className="text-amber-600 font-medium">Bronikrom, New Edubiase, Ashanti Region, Ghana</p>
                    </div>
                  </div>
                </div>
                
                {/* Social Media */}
                <div className="mt-8 pt-6 border-t border-amber-200">
                  <h4 className="font-bold text-slate-800 mb-4 text-center">Connect with us</h4>
                  <div className="flex justify-center space-x-6">
                    <a href="https://www.facebook.com/hotel734?mibextid=ZbWKwL" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="bg-blue-500 hover:bg-blue-600 p-3 rounded-full transition-all duration-300 transform hover:scale-110">
                      <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    </a>
                    <a href="https://www.instagram.com/hotel.734?igsh=MWw2NXBxZ3R5a3V3YQ==" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 p-3 rounded-full transition-all duration-300 transform hover:scale-110">
                      <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                    </a>
                    <a href="https://www.tiktok.com/@hotel.734" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="bg-black hover:bg-gray-800 p-3 rounded-full transition-all duration-300 transform hover:scale-110">
                      <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            {/* Contact Form Card */}
            <div className="col-span-1 lg:col-span-2 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <div className="glass-morphism rounded-3xl p-8 shadow-luxury hover:shadow-glow transition-all duration-500">
                <div className="text-center mb-8">
                  <div className="bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">Send us a message</h3>
                  <p className="text-slate-600">Fill out the form below and we'll get back to you as soon as possible.</p>
                </div>
                {isSubmitted ? (
                  <div className="text-center py-12">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="h-10 w-10 text-white" />
                    </div>
                    <h4 className="text-2xl font-bold text-slate-800 mb-4">Message Sent Successfully!</h4>
                    <p className="text-slate-600 mb-6">
                      Thank you for contacting us. We'll respond to your message within 24 hours.
                    </p>
                    <Button 
                      onClick={() => setIsSubmitted(false)}
                      className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold px-8 py-3 rounded-xl"
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="Enter your email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter subject" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Enter your message" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {error && (
                        <Alert className="border-red-200 bg-red-50">
                          <AlertTitle className="text-red-800">Error</AlertTitle>
                          <AlertDescription className="text-red-700">
                            {error}
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Sending...
                          </>
                        ) : (
                          <>
                            <Mail className="mr-2 h-5 w-5" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                )}
              </div>
            </div>
          </div>
          {/* Map Section */}
          <div className="mt-16 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-slate-800 mb-4">Find Us</h3>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Located in the heart of New Edubiase, Hotel 734 is easily accessible and surrounded by beautiful scenery.
              </p>
            </div>
            
            <div className="glass-morphism rounded-3xl overflow-hidden shadow-luxury">
              <iframe
                title="Hotel 734 Location - New Edubiase, Ghana"
                width="100%"
                height="400"
                style={{ border: 0 }}
                src="https://maps.google.com/maps?q=Hotel+734,+New+Edubiase,+Ghana&t=&z=15&ie=UTF8&iwloc=&output=embed"
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                onLoad={() => console.log('Google Maps loaded successfully')}
                onError={(e) => {
                  console.error('Google Maps failed to load, trying fallback:', e);
                  // Try New Edubiase if Hotel 734 not found
                  const iframe = e.target as HTMLIFrameElement;
                  iframe.src = "https://maps.google.com/maps?q=New+Edubiase,+Ashanti+Region,+Ghana&t=&z=15&ie=UTF8&iwloc=&output=embed";
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
