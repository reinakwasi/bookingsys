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
    try {
      const { messagesAPI } = await import("@/lib/messagesAPI");
      await messagesAPI.create(values);
      setIsSubmitted(true);
    } catch (err) {
      alert("Failed to send message. Please try again.");
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-amber-200/30 to-yellow-200/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-yellow-200/20 to-amber-200/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-amber-200/20 to-orange-200/20 rounded-full blur-3xl animate-float" style={{animationDelay: '4s'}}></div>
      </div>
      
      <section className="w-full py-24 md:py-32 lg:py-40 relative z-10">
        <div className="container px-4 md:px-6">
          {/* Header Section */}
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass-morphism text-amber-600 mb-8 animate-glow">
              <Mail className="h-5 w-5 animate-pulse" />
              <span className="font-medium">Get In Touch</span>
              <Phone className="h-5 w-5 animate-pulse" />
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-bold mb-8 bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 bg-clip-text text-transparent">
              Contact Hotel 734
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Ready to create unforgettable memories? Our dedicated team is here to assist you with bookings, 
              event planning, and any questions you may have.
            </p>
          </div>
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
                      <p className="text-amber-600 font-medium">New Edubiase, Ashanti Region, Ghana</p>
                    </div>
                  </div>
                </div>
                
                {/* Social Media */}
                <div className="mt-8 pt-6 border-t border-amber-200">
                  <h4 className="font-bold text-slate-800 mb-4 text-center">Connect with us</h4>
                  <div className="flex justify-center space-x-6">
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="bg-blue-500 hover:bg-blue-600 p-3 rounded-full transition-all duration-300 transform hover:scale-110">
                      <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.406.595 24 1.326 24h11.495v-9.294H9.691v-3.622h3.13V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.406 24 22.674V1.326C24 .592 23.406 0 22.675 0"/></svg>
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="bg-pink-500 hover:bg-pink-600 p-3 rounded-full transition-all duration-300 transform hover:scale-110">
                      <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.069 1.646.069 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.069-4.85.069s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608C4.515 2.497 5.782 2.225 7.148 2.163 8.414 2.105 8.794 2.094 12 2.094zm0-2.163C8.741 0 8.332.012 7.052.07 5.771.128 4.635.4 3.661 1.374c-.974.974-1.246 2.241-1.308 3.608C2.175 8.414 2.163 8.794 2.163 12s.012 3.584.07 4.85c.062 1.366.334 2.633 1.308 3.608.974.974 2.241 1.246 3.608 1.308 1.266.058 1.646.069 4.85.069s3.584-.012 4.85-.07c1.366-.062 2.633-.334 3.608-1.308.974-.974 1.246-2.241 1.308-3.608.058-1.266.069-1.646.069-4.85s-.012-3.584-.07-4.85c-.062-1.366-.334-2.633-1.308-3.608-.974-.974-2.241-1.246-3.608-1.308C15.647 2.175 15.267 2.163 12 2.163z"/><circle cx="12" cy="12" r="3.5"/><circle cx="18.406" cy="5.594" r="1.44"/></svg>
                    </a>
                    <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="bg-black hover:bg-gray-800 p-3 rounded-full transition-all duration-300 transform hover:scale-110">
                      <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12.75 2v12.75a3.25 3.25 0 1 1-3.25-3.25h1.5a1.75 1.75 0 1 0 1.75 1.75V2h2.25a5.75 5.75 0 0 0 5.75 5.75v2.25A8 8 0 0 1 12.75 2z"/></svg>
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
                        <div className="space-y-2">
                          <Label htmlFor="name">Name</Label>
                          <Input id="name" placeholder="Enter your name" {...form.register("name")} />
                          <FormMessage />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" placeholder="Enter your email" {...form.register("email")} />
                          <FormMessage />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input id="subject" placeholder="Enter subject" {...form.register("subject")} />
                        <FormMessage />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea id="message" placeholder="Enter your message" {...form.register("message")} />
                        <FormMessage />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-amber-500/25"
                      >
                        <Mail className="mr-2 h-5 w-5" />
                        Send Message
                      </Button>
                    </form>
                  </Form>
                )}
              </div>
            </div>
          </div>
          {/* Google Map Section */}
          <div className="mt-16 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-slate-800 mb-4">Find Us</h3>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Located in the heart of New Edubiase, Hotel 734 is easily accessible and surrounded by beautiful scenery.
              </p>
            </div>
            <div className="glass-morphism rounded-3xl overflow-hidden shadow-luxury">
              <iframe
                title="Hotel Location"
                src="https://www.google.com/maps?q=6.066667,-1.399999&z=15&output=embed"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
