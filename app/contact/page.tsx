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

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    setIsSubmitted(true)
  }

  return (
    <main className="flex-1">
      <section className="w-full py-12 md:py-24 lg:py-32 bg-slate-50">
        <div className="container px-4 md:px-6">
          <div className="grid gap-10 lg:grid-cols-3 lg:gap-12">
            {/* Contact Info Card */}
            <Card className="col-span-1 flex flex-col justify-between h-full shadow-md">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>We'd love to hear from you!</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Phone className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-slate-500">0244093821</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Mail className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-slate-500">info@hotel734@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <MapPin className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="text-sm font-medium">Address</p>
                    <p className="text-sm text-slate-500">New Edubiase, Ashanti Region, Ghana</p>
                  </div>
                </div>
                {/* Social Media */}
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Connect with us</h3>
                  <div className="flex space-x-4">
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                      <svg className="h-6 w-6 text-blue-600 hover:text-blue-800" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.406.595 24 1.326 24h11.495v-9.294H9.691v-3.622h3.13V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.406 24 22.674V1.326C24 .592 23.406 0 22.675 0"/></svg>
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                      <svg className="h-6 w-6 text-pink-500 hover:text-pink-700" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.069 1.646.069 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.069-4.85.069s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608C4.515 2.497 5.782 2.225 7.148 2.163 8.414 2.105 8.794 2.094 12 2.094zm0-2.163C8.741 0 8.332.012 7.052.07 5.771.128 4.635.4 3.661 1.374c-.974.974-1.246 2.241-1.308 3.608C2.175 8.414 2.163 8.794 2.163 12s.012 3.584.07 4.85c.062 1.366.334 2.633 1.308 3.608.974.974 2.241 1.246 3.608 1.308 1.266.058 1.646.069 4.85.069s3.584-.012 4.85-.07c1.366-.062 2.633-.334 3.608-1.308.974-.974 1.246-2.241 1.308-3.608.058-1.266.069-1.646.069-4.85s-.012-3.584-.07-4.85c-.062-1.366-.334-2.633-1.308-3.608-.974-.974-2.241-1.246-3.608-1.308C15.647 2.175 15.267 2.163 12 2.163z"/><circle cx="12" cy="12" r="3.5"/><circle cx="18.406" cy="5.594" r="1.44"/></svg>
                    </a>
                    <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                      <svg className="h-6 w-6 text-black hover:text-gray-700" fill="currentColor" viewBox="0 0 24 24"><path d="M12.75 2v12.75a3.25 3.25 0 1 1-3.25-3.25h1.5a1.75 1.75 0 1 0 1.75 1.75V2h2.25a5.75 5.75 0 0 0 5.75 5.75v2.25A8 8 0 0 1 12.75 2z"/></svg>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Contact Form Card */}
            <Card className="col-span-1 lg:col-span-2 shadow-md">
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
                <CardDescription>Fill out the form below and we'll get back to you as soon as possible.</CardDescription>
              </CardHeader>
              <CardContent>
                {isSubmitted ? (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">Message Sent!</AlertTitle>
                    <AlertDescription className="text-green-700">
                      Thank you for contacting us. We'll respond to your message shortly.
                    </AlertDescription>
                  </Alert>
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
                      <Button type="submit" className="w-full">
                        Send Message
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </div>
          {/* Google Map Section */}
          <div className="mt-12 rounded-lg overflow-hidden shadow-md">
            <iframe
              title="Hotel Location"
              src="https://www.google.com/maps?q=6.066667,-1.399999&z=15&output=embed"
              width="100%"
              height="350"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>
    </main>
  )
}
