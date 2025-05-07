import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Gallery images data
const galleryImages = {
  rooms: [
    {
      id: 1,
      title: "Expensive Suite",
      src: "/room1.jpg",
      alt: "Expensive Suite",
    },
    {
      id: 2,
      title: "Expensive Suite Bathroom",
      src: "/room2.jpg",
      alt: "Expensive Suite Bathroom",
    },
    {
      id: 3,
      title: "Standard Room",
      src: "/room3.jpg",
      alt: "Standard Room",
    },
    {
      id: 4,
      title: "Standard Room View",
      src: "/view.jpg",
      alt: "Standard Room View",
    },
    {
      id: 5,
      title: "Regular Room",
      src: "/one.jpg",
      alt: "Regular Room",
    },
    {
      id: 6,
      title: "Regular Room Interior",
      src: "/two.jpg",
      alt: "Regular Room Interior",
    },
  ],
  facilities: [
    {
      id: 1,
      title: "Swimming Pool",
      src: "/pool.jpg",
      alt: "Swimming Pool",
    },
    {
      id: 2,
      title: "Restaurant",
      src: "/cont.jpg",
      alt: "Restaurant",
    },
    {
      id: 3,
      title: "Spa",
      src: "/three.jpg",
      alt: "Spa",
    },
    {
      id: 4,
      title: "Gym",
      src: "/four.jpg",
      alt: "Gym",
    },
    {
      id: 5,
      title: "Bar",
      src: "/backimg2.jpg",
      alt: "Bar",
    },
    {
      id: 6,
      title: "Conference Room",
      src: "/outline.jpg",
      alt: "Conference Room",
    },
  ],
  events: [
    {
      id: 1,
      title: "Wedding Reception",
      src: "/poolview1.jpg",
      alt: "Wedding Reception",
    },
    {
      id: 2,
      title: "Corporate Event",
      src: "/poolview2.jpg",
      alt: "Corporate Event",
    },
    {
      id: 3,
      title: "Birthday Party",
      src: "/one.jpg",
      alt: "Birthday Party",
    },
    {
      id: 4,
      title: "Outdoor Event",
      src: "/two.jpg",
      alt: "Outdoor Event",
    },
    {
      id: 5,
      title: "Gala Dinner",
      src: "/three.jpg",
      alt: "Gala Dinner",
    },
    {
      id: 6,
      title: "Conference Setup",
      src: "/four.jpg",
      alt: "Conference Setup",
    },
  ],
}

export default function GalleryPage() {
  return (
    <div className="container py-12 md:py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Photo Gallery</h1>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          Explore our luxury hotel through our collection of stunning images.
        </p>
      </div>

      <Tabs defaultValue="rooms" className="w-full">
        <div className="flex justify-center mb-8">
          <TabsList>
            <TabsTrigger value="rooms">Rooms</TabsTrigger>
            <TabsTrigger value="facilities">Facilities</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="rooms">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryImages.rooms.map((image) => (
              <Card key={image.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative aspect-[4/3] w-full">
                    <Image
                      src={image.src || "/placeholder.svg"}
                      alt={image.alt}
                      fill
                      className="object-cover transition-all hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <p className="font-medium">{image.title}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="facilities">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryImages.facilities.map((image) => (
              <Card key={image.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative aspect-[4/3] w-full">
                    <Image
                      src={image.src || "/placeholder.svg"}
                      alt={image.alt}
                      fill
                      className="object-cover transition-all hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <p className="font-medium">{image.title}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="events">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryImages.events.map((image) => (
              <Card key={image.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative aspect-[4/3] w-full">
                    <Image
                      src={image.src || "/placeholder.svg"}
                      alt={image.alt}
                      fill
                      className="object-cover transition-all hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <p className="font-medium">{image.title}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
