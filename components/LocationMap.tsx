"use client"

import { useState, useEffect } from "react"
import { MapPin, ExternalLink, Navigation } from "lucide-react"

interface LocationMapProps {
  className?: string
}

export default function LocationMap({ className = "" }: LocationMapProps) {
  const [mapError, setMapError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Hotel 734 coordinates in New Edubiase, Ghana
  const latitude = 6.0295145
  const longitude = -1.3337516
  const locationName = "Hotel 734, New Edubiase, Ashanti Region, Ghana"

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleMapError = () => {
    setMapError(true)
    setIsLoading(false)
  }

  const openInGoogleMaps = () => {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
      '_blank'
    )
  }

  const openInAppleMaps = () => {
    window.open(
      `http://maps.apple.com/?q=${latitude},${longitude}`,
      '_blank'
    )
  }

  const openInOpenStreetMap = () => {
    window.open(
      `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=15`,
      '_blank'
    )
  }

  const getDirections = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude
          const userLng = position.coords.longitude
          window.open(
            `https://www.google.com/maps/dir/${userLat},${userLng}/${latitude},${longitude}`,
            '_blank'
          )
        },
        () => {
          // Fallback if geolocation fails
          window.open(
            `https://www.google.com/maps/dir//${latitude},${longitude}`,
            '_blank'
          )
        }
      )
    } else {
      // Fallback if geolocation is not supported
      window.open(
        `https://www.google.com/maps/dir//${latitude},${longitude}`,
        '_blank'
      )
    }
  }

  if (isLoading) {
    return (
      <div className={`w-full h-[400px] bg-gradient-to-br from-amber-50 to-yellow-50 rounded-3xl flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading map...</p>
        </div>
      </div>
    )
  }

  if (mapError) {
    return (
      <div className={`w-full h-[400px] bg-gradient-to-br from-amber-50 to-yellow-50 rounded-3xl flex items-center justify-center p-8 ${className}`}>
        <div className="text-center max-w-md">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-8 w-8 text-white" />
            </div>
            <h4 className="text-xl font-bold text-slate-800 mb-4">Hotel 734 Location</h4>
            <p className="text-slate-600 mb-4">
              <strong>Address:</strong><br />
              New Edubiase<br />
              Ashanti Region, Ghana
            </p>
            <p className="text-slate-600 mb-6">
              <strong>Coordinates:</strong><br />
              {latitude}°N, {Math.abs(longitude)}°W
            </p>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={openInGoogleMaps}
                className="inline-flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Open in Google Maps
                <ExternalLink className="h-4 w-4 ml-2" />
              </button>
              <button
                onClick={getDirections}
                className="inline-flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Get Directions
                <ExternalLink className="h-4 w-4 ml-2" />
              </button>
              <button
                onClick={openInOpenStreetMap}
                className="inline-flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Open in OpenStreetMap
                <ExternalLink className="h-4 w-4 ml-2" />
              </button>
              <button
                onClick={openInAppleMaps}
                className="inline-flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg hover:from-gray-800 hover:to-gray-900 transition-all duration-300 transform hover:scale-105"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Open in Apple Maps
                <ExternalLink className="h-4 w-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full h-[400px] rounded-3xl overflow-hidden shadow-luxury ${className}`}>
      {/* Try multiple embed approaches */}
      <div className="relative w-full h-full">
        <iframe
          title="Hotel 734 Location - New Edubiase, Ashanti Region, Ghana"
          src={`https://maps.google.com/maps?width=100%25&height=400&hl=en&q=${encodeURIComponent(locationName)}&t=&z=15&ie=UTF8&iwloc=B&output=embed`}
          width="100%"
          height="400"
          style={{ border: 0 }}
          allowFullScreen={true}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          onError={handleMapError}
          onLoad={() => setIsLoading(false)}
        />
        
        {/* Overlay with direct map links if iframe is blocked */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-yellow-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 text-center">
            <p className="text-sm text-slate-600 mb-3">Click to open in your preferred map app:</p>
            <div className="flex gap-2">
              <button
                onClick={openInGoogleMaps}
                className="px-3 py-2 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors"
              >
                Google Maps
              </button>
              <button
                onClick={getDirections}
                className="px-3 py-2 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors"
              >
                Directions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
