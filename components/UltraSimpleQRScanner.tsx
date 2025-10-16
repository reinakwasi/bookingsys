'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, CameraOff, RotateCcw } from 'lucide-react'

interface UltraSimpleQRScannerProps {
  onScan: (result: string) => void
  onError?: (error: string) => void
}

export function UltraSimpleQRScanner({ onScan, onError }: UltraSimpleQRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const jsQRRef = useRef<any>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  const [isScanning, setIsScanning] = useState(false)
  const [isLibraryLoaded, setIsLibraryLoaded] = useState(false)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')

  // Load jsQR library only - NO camera detection
  useEffect(() => {
    const loadLibrary = async () => {
      try {
        const module = await import('jsqr')
        jsQRRef.current = module.default
        setIsLibraryLoaded(true)
        console.log('QR library loaded - ready for manual start')
      } catch (error) {
        console.error('Failed to load jsQR:', error)
      }
    }
    
    loadLibrary()
  }, [])

  // Start camera with specified facing mode
  const startCamera = async () => {
    // Stop existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    // Use facing mode constraint
    const constraints = {
      video: {
        facingMode: facingMode,
        width: { ideal: 640 },
        height: { ideal: 480 }
      }
    }

    console.log(`Starting camera with facing mode: ${facingMode}`)
    const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
    streamRef.current = mediaStream

    if (videoRef.current) {
      videoRef.current.srcObject = mediaStream
      await videoRef.current.play()
    }

    return mediaStream
  }

  // Scan QR code
  const scanQRCode = () => {
    if (!jsQRRef.current || !videoRef.current || !canvasRef.current) {
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    
    if (video.readyState !== video.HAVE_ENOUGH_DATA) return

    try {
      const context = canvas.getContext('2d')
      if (!context) return

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      
      const code = jsQRRef.current(imageData.data, imageData.width, imageData.height)

      if (code && code.data) {
        onScan(code.data.trim())
        stopScanning()
      }
    } catch (error) {
      // Silent error - continue scanning
    }
  }

  // Toggle camera (front/back)
  const toggleCamera = async () => {
    const newFacingMode = facingMode === 'environment' ? 'user' : 'environment'
    setFacingMode(newFacingMode)
    
    // If currently scanning, restart with new camera
    if (isScanning) {
      try {
        await startCamera()
      } catch (error) {
        console.error('Error switching camera:', error)
      }
    }
  }

  // Start scanning
  const startScanning = async () => {
    if (!jsQRRef.current || !isLibraryLoaded) {
      return
    }

    try {
      setIsScanning(true)
      await startCamera()
      
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current)
      }
      
      scanIntervalRef.current = setInterval(scanQRCode, 100)
    } catch (error) {
      setIsScanning(false)
      console.error('Error starting scanner:', error)
    }
  }

  // Stop scanning
  const stopScanning = () => {
    setIsScanning(false)
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [])

  return (
    <div className="space-y-4">
      {/* Scanner Container */}
      <div className="relative bg-black rounded-xl overflow-hidden">
        {/* Video Element - Always visible */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-80 object-cover"
        />
        
        {/* Hidden Canvas */}
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Simple Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-4 border-2 border-white/50 rounded">
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white"></div>
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white"></div>
          </div>
          
          {isScanning && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded text-sm">
              Scanning... ({facingMode === 'environment' ? 'Back' : 'Front'} Camera)
            </div>
          )}
          
          {!isScanning && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded text-sm">
              {facingMode === 'environment' ? 'Back Camera' : 'Front Camera'} Ready
            </div>
          )}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-3">
        <Button 
          onClick={isScanning ? stopScanning : startScanning}
          disabled={!isLibraryLoaded}
          className={`flex-1 font-bold py-3 px-6 rounded-xl ${
            isScanning 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isScanning ? (
            <>
              <CameraOff className="h-5 w-5 mr-2" />
              Stop
            </>
          ) : (
            <>
              <Camera className="h-5 w-5 mr-2" />
              {isLibraryLoaded ? 'Start Camera' : 'Loading...'}
            </>
          )}
        </Button>
        
        {/* Camera Toggle Button - Always show */}
        <Button 
          onClick={toggleCamera}
          disabled={!isLibraryLoaded}
          variant="outline"
          className="px-4 py-3 border-2 border-blue-500 text-blue-600 hover:bg-blue-50 rounded-xl font-bold"
        >
          <RotateCcw className="h-5 w-5 mr-2" />
          {facingMode === 'environment' ? 'Front' : 'Back'}
        </Button>
      </div>
      
      {/* Camera Info */}
      <div className="text-center text-sm text-gray-600">
        <p>
          Currently set to use {facingMode === 'environment' ? 'back' : 'front'} camera
        </p>
      </div>
    </div>
  )
}
