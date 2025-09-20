'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, CameraOff, RotateCcw } from 'lucide-react'
import jsQR from 'jsqr'

interface QRScannerProps {
  onScan: (result: string) => void
  onError?: (error: string) => void
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string>('')
  const [debugInfo, setDebugInfo] = useState<string>('')
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const startScanning = async () => {
    try {
      setError('')
      setDebugInfo('Requesting camera access...')
      console.log('Starting camera...')
      
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported in this browser')
      }
      
      // Request camera access
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Try to use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      
      setDebugInfo('Camera access granted, setting up video...')
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
        setIsScanning(true)
        
        // Wait for video to be ready and start scanning
        videoRef.current.onloadedmetadata = () => {
          console.log('Video loaded, starting QR scan loop')
          setDebugInfo(`Video ready: ${videoRef.current?.videoWidth}x${videoRef.current?.videoHeight}`)
          startScanLoop()
        }
        
        // Add error handler for video
        videoRef.current.onerror = (e) => {
          console.error('Video error:', e)
          setError('Video playback failed')
          setIsScanning(false)
        }
      }
      
    } catch (err) {
      console.error('Camera access error:', err)
      const errorMsg = err instanceof Error ? err.message : 'Camera access denied or not available'
      setError(errorMsg)
      setDebugInfo(`Error: ${errorMsg}`)
      onError?.(errorMsg)
      setIsScanning(false)
    }
  }

  const stopScanning = () => {
    console.log('Stopping camera...')
    
    // Stop scan loop
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
    
    // Stop camera stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    
    setIsScanning(false)
    setError('')
    setDebugInfo('')
  }
  
  const startScanLoop = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
    }
    
    scanIntervalRef.current = setInterval(() => {
      scanForQR()
    }, 100) // Scan every 100ms
  }
  
  const scanForQR = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    
    if (!video || !canvas || !isScanning) return
    
    // Check if video is ready
    if (video.readyState !== video.HAVE_ENOUGH_DATA) return
    
    const context = canvas.getContext('2d')
    if (!context) return
    
    // Set canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    // Get image data
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    
    // Try to decode QR code
    const code = jsQR(imageData.data, imageData.width, imageData.height)
    
    if (code) {
      console.log('QR Code detected:', code.data)
      onScan(code.data)
      stopScanning()
    }
  }


  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [])

  return (
    <div className="space-y-4">
      <div className="relative bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-64 object-cover"
          style={{ 
            display: isScanning ? 'block' : 'none',
            backgroundColor: '#000'
          }}
        />
        
        {/* Hidden canvas for QR processing */}
        <canvas
          ref={canvasRef}
          className="hidden"
        />
        
        {!isScanning && (
          <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Camera className="h-12 w-12 mx-auto mb-2" />
              <p>Camera not active</p>
            </div>
          </div>
        )}
        
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-4 border-2 border-emerald-500 rounded-lg">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-500"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-500"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-500"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-500"></div>
            </div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded text-sm">
              Position QR code within the frame
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}
      
      {debugInfo && (
        <div className="text-blue-600 text-sm bg-blue-50 p-3 rounded-lg">
          Debug: {debugInfo}
        </div>
      )}

      <div className="flex gap-2">
        {!isScanning ? (
          <Button 
            onClick={startScanning}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
          >
            <Camera className="h-4 w-4 mr-2" />
            Start Camera
          </Button>
        ) : (
          <Button 
            onClick={stopScanning}
            variant="outline"
            className="flex-1"
          >
            <CameraOff className="h-4 w-4 mr-2" />
            Stop Camera
          </Button>
        )}
        
        {isScanning && (
          <Button 
            onClick={() => {
              stopScanning()
              setTimeout(startScanning, 100)
            }}
            variant="outline"
            size="icon"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
