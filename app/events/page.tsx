"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2 } from "lucide-react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(10, {
    message: "Phone number must be at least 10 digits.",
  }),
  date: z.date({
    required_error: "Event date is required.",
  }),
  eventType: z.string({
    required_error: "Please select an event type.",
  }),
  guests: z.string().min(1, {
    message: "Please enter the number of guests.",
  }),
})

// Event types data
const eventTypes = {
  compound: {
    title: "Compound Events",
    description: "Perfect for outdoor gatherings, parties, and celebrations.",
    capacity: "Up to 200 guests",
    price: "Starting from 5000 GHS",
    features: ["Spacious outdoor area", "Catering services", "Sound system", "Decorations", "Event coordination"],
    images: [
      { src: "/poolview1.jpg", alt: "Compound Event Space 1" },
      { src: "/poolview2.jpg", alt: "Compound Event Space 2" },
      { src: "/pool.jpg", alt: "Compound Event Space 3" },
    ],
  },
  conference: {
    title: "Conference Events",
    description: "Ideal for business meetings, seminars, and corporate events.",
    capacity: "Up to 150 guests",
    price: "Starting from 3500 GHS",
    features: [
      "Modern conference rooms",
      "Audiovisual equipment",
      "High-speed internet",
      "Catering options",
      "Business services",
    ],
    images: [
      { src: "/outline.jpg", alt: "Conference Room 1" },
      { src: "/view.jpg", alt: "Conference Room 2" },
      { src: "/four.jpg", alt: "Conference Room 3" },
    ],
  },
}

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState("compound")
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Carousel state
  const [currentIndexes, setCurrentIndexes] = useState({ compound: 0, conference: 0 })

  // Auto-rotate images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndexes((prev) => {
        const key = activeTab as "compound" | "conference"
        const images = eventTypes[key].images
        return {
          ...prev,
          [key]: (prev[key] + 1) % images.length,
        }
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [activeTab])

  // Manual navigation
  const handlePrev = (type: "compound" | "conference") => {
    setCurrentIndexes((prev) => {
      const images = eventTypes[type].images
      return {
        ...prev,
        [type]: (prev[type] - 1 + images.length) % images.length,
      }
    })
  }
  const handleNext = (type: "compound" | "conference") => {
    setCurrentIndexes((prev) => {
      const images = eventTypes[type].images
      return {
        ...prev,
        [type]: (prev[type] + 1) % images.length,
      }
    })
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      eventType: activeTab,
      guests: "50",
    },
  })

  // Update form when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    form.setValue("eventType", value)
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <div className="container py-12 md:py-16 max-w-md mx-auto">
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Event Booking Successful!</AlertTitle>
          <AlertDescription className="text-green-700">
            Your event reservation has been confirmed. We've sent a confirmation email with all the details.
          </AlertDescription>
        </Alert>
        <div className="mt-6 text-center">
          <Button onClick={() => setIsSubmitted(false)}>Book Another Event</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12 md:py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Event Spaces</h1>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          Host your special events at our luxury hotel with dedicated spaces and professional services.
        </p>
      </div>

      <Tabs defaultValue="compound" value={activeTab} onValueChange={handleTabChange}>
        <div className="flex justify-center mb-8">
          <TabsList>
            <TabsTrigger value="compound">Compound Events</TabsTrigger>
            <TabsTrigger value="conference">Conference Events</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="compound" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="relative h-64 md:h-full rounded-lg overflow-hidden flex items-center justify-center bg-slate-100">
              <button
                className="absolute left-2 z-10 bg-white/80 hover:bg-white rounded-full p-1"
                onClick={() => handlePrev("compound")}
                type="button"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6 text-slate-700" />
              </button>
              <Image
                src={eventTypes.compound.images[currentIndexes.compound].src}
                alt={eventTypes.compound.images[currentIndexes.compound].alt}
                fill
                className="object-cover"
                priority
              />
              <button
                className="absolute right-2 z-10 bg-white/80 hover:bg-white rounded-full p-1"
                onClick={() => handleNext("compound")}
                type="button"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6 text-slate-700" />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                {eventTypes.compound.images.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 w-3 rounded-full transition-all ${idx === currentIndexes.compound ? "bg-slate-700" : "bg-slate-300"}`}
                  />
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold">{eventTypes.compound.title}</h2>
              <p className="mt-2 text-muted-foreground">{eventTypes.compound.description}</p>
              <div className="mt-4 space-y-2">
                <p>
                  <strong>Capacity:</strong> {eventTypes.compound.capacity}
                </p>
                <p>
                  <strong>Pricing:</strong> {eventTypes.compound.price}
                </p>
              </div>
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Features:</h3>
                <ul className="space-y-1">
                  {eventTypes.compound.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <span className="mr-2 text-primary">•</span> {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="conference" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="relative h-64 md:h-full rounded-lg overflow-hidden flex items-center justify-center bg-slate-100">
              <button
                className="absolute left-2 z-10 bg-white/80 hover:bg-white rounded-full p-1"
                onClick={() => handlePrev("conference")}
                type="button"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6 text-slate-700" />
              </button>
              <Image
                src={eventTypes.conference.images[currentIndexes.conference].src}
                alt={eventTypes.conference.images[currentIndexes.conference].alt}
                fill
                className="object-cover"
                priority
              />
              <button
                className="absolute right-2 z-10 bg-white/80 hover:bg-white rounded-full p-1"
                onClick={() => handleNext("conference")}
                type="button"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6 text-slate-700" />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                {eventTypes.conference.images.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 w-3 rounded-full transition-all ${idx === currentIndexes.conference ? "bg-slate-700" : "bg-slate-300"}`}
                  />
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold">{eventTypes.conference.title}</h2>
              <p className="mt-2 text-muted-foreground">{eventTypes.conference.description}</p>
              <div className="mt-4 space-y-2">
                <p>
                  <strong>Capacity:</strong> {eventTypes.conference.capacity}
                </p>
                <p>
                  <strong>Pricing:</strong> {eventTypes.conference.price}
                </p>
              </div>
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Features:</h3>
                <ul className="space-y-1">
                  {eventTypes.conference.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <span className="mr-2 text-primary">•</span> {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>Event Reservation Form</CardTitle>
            <CardDescription>Please provide your details to book your event.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
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
                          <Input placeholder="john.doe@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+233 123 456 789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="guests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Guests</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Event Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                              >
                                {field.value ? format(field.value, "PPP") : <span>Select date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="eventType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an event type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="compound">Compound Event</SelectItem>
                            <SelectItem value="conference">Conference Event</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Select the type of event you would like to host.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Reserve Event Space
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
