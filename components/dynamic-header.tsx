"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

const headerImages = [
  "/background.webp",
  "/poolview1.jpg",
  "/poolview2.jpg",
  "/one.jpg",
  "/two.jpg",
  "/three.jpg",
  "/four.jpg",
  "/view.jpg",
  "/pool.jpg",
  "/cont.jpg",
  "/backimg2.jpg",
  "/outline.jpg"
]

export default function DynamicHeader() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % headerImages.length)
    }, 5000) // Change image every 5 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative h-[600px] w-full overflow-hidden">
      {headerImages.map((image, index) => (
        <div
          key={image}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentImageIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={image}
            alt="Hotel 734 View"
            fill
            className="object-cover"
            priority={index === 0}
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      ))}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to Hotel 734</h1>
          <p className="text-xl md:text-2xl mb-8">Experience Unparalleled Luxury and Comfort</p>
          <a
            href="/booking"
            className="inline-block bg-white text-slate-900 px-8 py-3 rounded-full font-semibold hover:bg-slate-100 transition-colors"
          >
            Book Your Stay
          </a>
        </div>
      </div>
    </div>
  )
} 