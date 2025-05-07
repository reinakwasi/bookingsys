import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Utensils, Music, Waves, Dumbbell, Bed, Wine, Wifi, Car } from "lucide-react"

// Facilities data
const facilities = [
  {
    id: 1,
    name: "Restaurant",
    description: "Experience fine dining with our world-class chefs serving international and local cuisine.",
    icon: Utensils,
    image: "/cont.jpg",
  },
  {
    id: 2,
    name: "Night Club",
    description: "Dance the night away at our exclusive night club featuring top DJs and premium drinks.",
    icon: Music,
    image: "/backimg2.jpg",
  },
  {
    id: 3,
    name: "Pool Party",
    description: "Enjoy our weekly pool parties with music, drinks, and a vibrant atmosphere.",
    icon: Waves,
    image: "/pool.jpg",
  },
  {
    id: 4,
    name: "Spa",
    description: "Relax and rejuvenate with our range of spa treatments and therapies.",
    icon: Bed,
    image: "/three.jpg",
  },
  {
    id: 5,
    name: "Gym",
    description: "Stay fit during your stay with our state-of-the-art fitness center and personal trainers.",
    icon: Dumbbell,
    image: "/four.jpg",
  },
  {
    id: 6,
    name: "Restaurant",
    description:
      "Indulge in culinary delights at our restaurant offering a diverse menu of local and international dishes.",
    icon: Utensils,
    image: "/cont.jpg",
  },
  {
    id: 7,
    name: "Lounge",
    description: "Unwind in our elegant lounge area with comfortable seating and a relaxed atmosphere.",
    icon: Wine,
    image: "/backimg2.jpg",
  },
  {
    id: 8,
    name: "Free WiFi",
    description: "Stay connected with high-speed internet access available throughout the hotel.",
    icon: Wifi,
    image: "/outline.jpg",
  },
  {
    id: 9,
    name: "Parking",
    description: "Secure parking facilities available for all guests with 24/7 surveillance.",
    icon: Car,
    image: "/view.jpg",
  },
]

export default function FacilitiesPage() {
  return (
    <div className="container py-12 md:py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Our Facilities</h1>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          Explore our premium facilities designed to make your stay memorable and comfortable.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {facilities.map((facility) => (
          <Card key={facility.id} className="overflow-hidden">
            <div className="relative h-48">
              <Image src={facility.image || "/placeholder.svg"} alt={facility.name} fill className="object-cover" />
            </div>
            <CardHeader className="flex flex-row items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <facility.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>{facility.name}</CardTitle>
                <CardDescription>Available for all guests</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{facility.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
