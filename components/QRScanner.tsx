'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, CameraOff, RotateCcw, Zap } from 'lucide-react'
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
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const startScanning = async () => {
    try {
      setError('')
      console.log('Starting camera...')
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
        setIsScanning(true)
        
        // Start scanning when video is ready
        videoRef.current.onloadedmetadata = () => {
          console.log('Video ready, starting scan loop')
          startScanLoop()
        }
      }
      
    } catch (err) {
      console.error('Camera error:', err)
      const errorMsg = 'Camera access denied or not available'
      setError(errorMsg)
      onError?.(errorMsg)
    }
  }

  const stopScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    
    setIsScanning(false)
    setError('')
  }
  
  const scanForQR = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    
    if (!video || !canvas || !isScanning) return
    if (video.readyState !== video.HAVE_ENOUGH_DATA) return
    
    const context = canvas.getContext('2d')
    if (!context) return
    
    // Set canvas size and draw video frame
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    // Get image data and try to decode QR
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height)
    
    if (code && code.data) {
      console.log('QR Code detected:', code.data)
      onScan(code.data)
      stopScanning()
    }
  }
  
  const startScanLoop = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
    }
    
    scanIntervalRef.current = setInterval(scanForQR, 100) // Scan every 100ms
  }


  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [])
  
  // Add CSS for scan line animation
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes scan-line {
        0% { top: 10%; }
        50% { top: 50%; }
        100% { top: 90%; }
      }
    `
    document.head.appendChild(style)
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style)
      }
    }
  }, [])

  return (
    <div className="space-y-4">
      <div className="relative bg-gradient-to-br from-emerald-900 to-teal-900 rounded-xl overflow-hidden shadow-2xl border border-emerald-200">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-80 object-cover"
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
          <div className="w-full h-80 bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
            <div className="text-center text-emerald-700">
              <div className="bg-emerald-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Camera className="h-10 w-10 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">QR Code Scanner</h3>
              <p className="text-sm text-emerald-600">Click start to activate camera</p>
            </div>
          </div>
        )}
        
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Animated scanning overlay */}
            <div className="absolute inset-6 border-2 border-emerald-400 rounded-lg animate-pulse">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-lg"></div>
            </div>
            
            {/* Scanning line animation */}
            <div className="absolute inset-6 overflow-hidden rounded-lg">
              <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-bounce" style={{
                top: '50%',
                animation: 'scan-line 2s ease-in-out infinite'
              }}></div>
            </div>
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-emerald-600/90 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 animate-pulse" />
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
      
      {isScanning && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-emerald-600 text-sm font-medium">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
            Scanning for QR codes...
          </div>
        </div>
      )}

      <div className="flex gap-3">
        {!isScanning ? (
          <Button 
            onClick={startScanning}
            className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Camera className="h-5 w-5 mr-2" />
            Start QR Scanner
          </Button>
        ) : (
          <Button 
            onClick={stopScanning}
            variant="outline"
            className="flex-1 border-2 border-red-300 text-red-600 hover:bg-red-50 font-semibold py-3 px-6 rounded-xl transition-all duration-300"
          >
            <CameraOff className="h-5 w-5 mr-2" />
            Stop Scanner
          </Button>
        )}
        
        {isScanning && (
          <Button 
            onClick={() => {
              stopScanning()
              setTimeout(startScanning, 500)
            }}
            variant="outline"
            className="border-2 border-emerald-300 text-emerald-600 hover:bg-emerald-50 px-4 rounded-xl transition-all duration-300"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  )
}
