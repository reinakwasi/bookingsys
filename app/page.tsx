import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import DynamicHeader from "@/components/dynamic-header"
import { Phone, Mail } from "lucide-react"

const featuredRooms = [
  {
    id: 1,
    name: "Expensive Room",
    description: "Luxurious suite with ocean view and premium amenities",
    price: 300,
    image: "/room1.jpg",
  },
  {
    id: 2,
    name: "Standard Room",
    description: "Comfortable room with modern amenities and city view",
    price: 250,
    image: "/room2.jpg",
  },
  {
    id: 3,
    name: "Regular Room",
    description: "Cozy room with essential amenities and garden view",
    price: 200,
    image: "/room3.jpg",
  },
]
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col"> 
      <DynamicHeader />
      
      <section className="py-16 bg-slate-50">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-slate-900">Featured Rooms</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Experience luxury and comfort in our carefully curated selection of rooms and suites.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredRooms.map((room) => (
              <Card key={room.id} className="overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={room.image}
                    alt={room.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-slate-900">{room.name}</CardTitle>
                  <CardDescription className="text-slate-600">{room.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-slate-900">GHS {room.price}/night</p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/rooms/${room.id}`}>View Details</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-900 text-white">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Us</h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Discover the perfect blend of luxury, comfort, and exceptional service at our hotel.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-slate-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌟</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Luxury Experience</h3>
              <p className="text-slate-300">
                Indulge in premium amenities and world-class service.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-slate-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏊</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Premium Facilities</h3>
              <p className="text-slate-300">
                Enjoy our state-of-the-art facilities and recreational areas.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-slate-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">24/7 Security</h3>
              <p className="text-slate-300">
                Your safety is our priority with round-the-clock security and surveillance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Compound & Conference Facilities */}
      <section className="py-16 bg-slate-50">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Compound & Conference Facilities</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Host your events in our state-of-the-art facilities, perfect for business meetings, conferences, and special occasions.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="overflow-hidden">
              <div className="relative h-64">
                <Image
                  src="/view.jpg"
                  alt="Conference Hall"
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-slate-900">Conference Hall</CardTitle>
                <CardDescription className="text-slate-600">
                  Modern conference hall equipped with advanced audio-visual technology, perfect for business meetings and corporate events.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-slate-600">
                  <li>• Capacity for up to 200 people</li>
                  <li>• High-speed WiFi and presentation equipment</li>
                  <li>• Professional catering services available</li>
                  <li>• Flexible seating arrangements</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/events?type=conference">Book Conference Hall</Link>
                </Button>
              </CardFooter>
            </Card>
            <Card className="overflow-hidden">
              <div className="relative h-64">
                <Image
                  src="/poolview1.jpg"
                  alt="Outdoor Compound"
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-slate-900">Outdoor Compound</CardTitle>
                <CardDescription className="text-slate-600">
                  Spacious outdoor area perfect for weddings, social gatherings, and team-building events.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-slate-600">
                  <li>• Beautiful landscaped gardens</li>
                  <li>• Covered pavilion for all weather events</li>
                  <li>• Outdoor lighting and sound system</li>
                  <li>• Dedicated event planning support</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/events?type=compound">Book Outdoor Space</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>
    </main>
  )
}
