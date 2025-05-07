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
                <span className="text-2xl">🍽️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fine Dining</h3>
              <p className="text-slate-300">
                Savor exquisite cuisine prepared by our expert chefs.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-slate-900">Special Offers</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Take advantage of our exclusive deals and packages for your stay.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-slate-900 text-white">
              <CardHeader>
                <CardTitle>Weekend Getaway</CardTitle>
                <CardDescription className="text-slate-300">
                  Enjoy a relaxing weekend with our special package
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-slate-300">
                  <li>• 2 nights accommodation</li>
                  <li>• Breakfast included</li>
                  <li>• Spa access</li>
                  <li>• 20% off on dining</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full text-white border-white hover:bg-white hover:text-slate-900">
                  Book Now
                </Button>
              </CardFooter>
            </Card>
            <Card className="bg-slate-900 text-white">
              <CardHeader>
                <CardTitle>Extended Stay</CardTitle>
                <CardDescription className="text-slate-300">
                  Perfect for longer vacations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-slate-300">
                  <li>• 7 nights accommodation</li>
                  <li>• All meals included</li>
                  <li>• Free airport transfer</li>
                  <li>• 30% off on activities</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full text-white border-white hover:bg-white hover:text-slate-900">
                  Book Now
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>
    </main>
  )
}
