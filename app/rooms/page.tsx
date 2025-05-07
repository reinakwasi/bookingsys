import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const rooms = [
  {
    id: 1,
    name: "Expensive Room",
    description: "Luxurious suite with ocean view and premium amenities",
    price: 500,
    image: "/room1.jpg",
  },
  {
    id: 2,
    name: "Standard Room",
    description: "Comfortable room with modern amenities and city view",
    price: 300,
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

export default function RoomsPage() {
  return (
    <main className="container px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Our Rooms</h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Choose from our selection of luxurious rooms and suites, each designed to provide the perfect blend of comfort and style.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {rooms.map((room) => (
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
              <p className="text-2xl font-bold text-slate-900">${room.price}/night</p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/rooms/${room.id}`}>View Details</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  )
}
