"use client"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import { ArrowRight, ChevronDown, Star, Sparkles } from "lucide-react"

const headerImages = [
  "/view.jpg",
  "/reception.jpg",
  "/two.jpg",
  "/darkclub7.jpg",
  "/one.jpg",
  "/stairs.jpg",
  "/poolagyare.jpg",
  "/pool5.jpg",
  "/light1.jpg",
  "/pool.jpg",
  "/room7.jpg",
  "/summer.jpg",
  "/conference.jpg"
]

export default function DynamicHeader() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      // On mobile, always auto-advance. On desktop, pause on hover
      if (isMobile || !isHovering) {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % headerImages.length)
      }
    }, isMobile ? 4000 : 5000) // Faster transitions on mobile

    return () => clearInterval(interval)
  }, [isHovering, isMobile])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only apply mouse effects on desktop
    if (!isMobile && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      setMousePosition({ x, y })
    }
  }

  const handleTouchStart = () => {
    if (isMobile) {
      setIsHovering(true)
    }
  }

  const handleTouchEnd = () => {
    if (isMobile) {
      setTimeout(() => setIsHovering(false), 2000) // Resume auto-advance after 2 seconds
    }
  }

  return (
    <div 
      ref={containerRef}
      className="relative h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-[90vh] w-full overflow-hidden bg-black"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => !isMobile && setIsHovering(true)}
      onMouseLeave={() => !isMobile && setIsHovering(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="absolute inset-0">
        {headerImages.map((image, index) => (
          <div
            key={image}
            className={`absolute inset-0 transition-opacity duration-1500 ease-in-out ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={image}
              alt="Hotel 734 View"
              fill
              className="object-cover object-center"
              priority={index === 0}
              style={{
                transform: isMobile 
                  ? 'scale(1.02)' 
                  : `scale(1.1) translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`,
                transition: isMobile 
                  ? 'transform 2s ease-in-out' 
                  : 'transform 0.3s ease-out'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
          </div>
        ))}
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-amber-400/20 backdrop-blur-sm text-amber-300 mb-4 sm:mb-6 animate-fade-in">
            <Star className="h-3 w-3 sm:h-4 sm:w-4 animate-pulse" />
            <span className="text-xs sm:text-sm font-medium">Welcome to Luxury</span>
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 animate-pulse" />
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 tracking-tight animate-slide-up">
            Welcome to <span className="text-amber-400 relative inline-block group">
              Hotel 734
              <span className="absolute -bottom-1 sm:-bottom-2 left-0 w-full h-0.5 sm:h-1 bg-amber-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            </span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 lg:mb-10 font-light tracking-wide text-slate-200 animate-slide-up-delay-1">
            Excellence Pays It All
          </p>
          
          <div className="flex flex-row gap-3 sm:gap-4 justify-center animate-slide-up-delay-2 max-w-md mx-auto sm:max-w-none">
            <a
              href="/booking"
              className="flex-1 sm:w-auto inline-flex items-center justify-center gap-1 sm:gap-2 bg-amber-400 text-slate-900 px-4 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-amber-300 hover-transition hover:scale-105 shadow-lg relative overflow-hidden group text-sm sm:text-base"
            >
              <span className="relative z-10">Book Your Stay</span>
              <ArrowRight className="h-3 w-3 sm:h-5 sm:w-5 relative z-10 transition-transform group-hover:translate-x-1" />
              <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
            </a>
            <a
              href="/rooms"
              className="flex-1 sm:w-auto inline-flex items-center justify-center gap-1 sm:gap-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 px-4 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-white/20 hover-transition hover:scale-105 relative overflow-hidden group text-sm sm:text-base"
            >
              <span className="relative z-10">Explore Rooms</span>
              <div className="absolute inset-0 bg-white/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
            </a>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in-delay-3">
        <div className="text-white/80 text-xs sm:text-sm animate-bounce">
          Scroll to explore
        </div>
        <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6 text-white/60 animate-bounce" />
      </div>

      {/* Image Navigation Dots */}
      <div className="absolute bottom-6 sm:bottom-8 right-4 sm:right-8 flex gap-2">
        {headerImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentImageIndex 
                ? 'bg-amber-400 w-4' 
                : 'bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`View image ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
        <div 
          className="h-full bg-amber-400 transition-all duration-1000 ease-linear"
          style={{ width: `${((currentImageIndex + 1) / headerImages.length) * 100}%` }}
        />
      </div>
    </div>
  )
} 