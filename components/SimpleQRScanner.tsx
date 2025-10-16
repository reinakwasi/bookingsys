'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, CameraOff, RotateCcw, Zap, AlertCircle, Smartphone } from 'lucide-react'

interface SimpleQRScannerProps {
  onScan: (result: string) => void
  onError?: (error: string) => void
}

export function SimpleQRScanner({ onScan, onError }: SimpleQRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string>('')
  const [debugInfo, setDebugInfo] = useState<string>('')
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([])
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0)
  const [jsQR, setJsQR] = useState<any>(null)
  const [isLibraryLoaded, setIsLibraryLoaded] = useState(false)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Load jsQR library
  useEffect(() => {
    const loadLibrary = async () => {
      try {
        const module = await import('jsqr')
        setJsQR(module.default)
        setIsLibraryLoaded(true)
        console.log('✅ jsQR library loaded successfully')
      } catch (error) {
        console.error('Failed to load jsQR:', error)
        setError('QR scanner library failed to load')
        setIsLibraryLoaded(false)
        onError?.('QR scanner library failed to load')
      }
    }
    
    loadLibrary()
  }, [onError])
  }, [])

  // Start camera - no permission checks
  const startCamera = async () => {
    try {
      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }

      // Simple constraints
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      streamRef.current = mediaStream

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        await videoRef.current.play()
      }

      return mediaStream
    } catch (error) {
      console.error('Camera error:', error)
      throw error
    }
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
        {/* Video Element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-80 object-cover"
        />
        
        {/* Hidden Canvas */}
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Scanning Overlay */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-6 border-2 border-green-400 rounded-lg">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400"></div>
            </div>
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded text-sm font-bold">
              Scanning for QR codes...
            </div>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex gap-3">
        {!isScanning ? (
          <Button 
            onClick={startScanning}
            disabled={!isLibraryLoaded}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl"
          >
            <Camera className="h-5 w-5 mr-2" />
            Start Scanner
          </Button>
        ) : (
          <Button 
            onClick={stopScanning}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl"
          >
            <CameraOff className="h-5 w-5 mr-2" />
            Stop Scanner
          </Button>
        )}
          >
            <Smartphone className="h-5 w-5" />
            <span className="hidden sm:inline">Switch Camera</span>
          </Button>
        )}
        
        {/* Restart Button */}
        {isScanning && (
          <Button 
            onClick={() => {
              stopScanning()
              setTimeout(startScanning, 500)
            }}
            variant="outline"
            className="border-2 border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700] hover:text-[#1a233b] px-4 rounded-xl transition-all duration-300"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Camera Info */}
      {cameras.length > 0 && (
        <div className="text-center text-sm text-gray-600">
          <p>
            Using: {cameras[currentCameraIndex]?.label || `Camera ${currentCameraIndex + 1}`}
            {cameras.length > 1 && ` (${currentCameraIndex + 1} of ${cameras.length})`}
          </p>
        </div>
      )}
    </div>
  )
}
