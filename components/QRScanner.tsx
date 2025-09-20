'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
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
  const [debugInfo, setDebugInfo] = useState<string>('')
  const [scanCount, setScanCount] = useState(0)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastScanTime = useRef<number>(0)

  const startScanning = async () => {
    try {
      setError('')
      setDebugInfo('Requesting camera access...')
      console.log('Starting camera...')
      
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported in this browser')
      }
      
      // Request camera access with multiple fallback options
      let mediaStream
      
      try {
        // Try high resolution with back camera first
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment',
            width: { ideal: 1920, min: 640 },
            height: { ideal: 1080, min: 480 }
          }
        })
      } catch (err) {
        console.log('High-res back camera failed, trying standard back camera:', err)
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { 
              facingMode: 'environment',
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          })
        } catch (err2) {
          console.log('Back camera failed, trying front camera:', err2)
          try {
            mediaStream = await navigator.mediaDevices.getUserMedia({
              video: { 
                facingMode: 'user',
                width: { ideal: 1280 },
                height: { ideal: 720 }
              }
            })
          } catch (err3) {
            console.log('Front camera failed, trying any camera:', err3)
            mediaStream = await navigator.mediaDevices.getUserMedia({
              video: true
            })
          }
        }
      }
      
      setDebugInfo('Camera access granted, setting up video...')
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
        setIsScanning(true)
        
        // Wait for video to be ready and start scanning
        videoRef.current.onloadedmetadata = () => {
          console.log('Video loaded, starting QR scan loop')
          setTimeout(() => {
            if (videoRef.current) {
              const width = videoRef.current.videoWidth
              const height = videoRef.current.videoHeight
              setDebugInfo(`📹 Camera ready: ${width}x${height}px`)
              console.log('Camera capabilities:', {
                width,
                height,
                readyState: videoRef.current.readyState
              })
              startScanLoop()
            }
          }, 1000) // Wait 1 second for video to fully initialize
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
  
  const scanForQR = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    
    if (!video || !canvas || !isScanning) return
    
    // Check if video is ready
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      setDebugInfo('Video not ready...')
      return
    }
    
    const context = canvas.getContext('2d')
    if (!context) return
    
    try {
      // Set canvas size to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      if (canvas.width === 0 || canvas.height === 0) {
        setDebugInfo('Invalid video dimensions')
        return
      }
      
      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      // Get image data
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      
      // Update scan count
      setScanCount(prev => prev + 1)
      setDebugInfo(`Scanning... (${scanCount} attempts) - ${canvas.width}x${canvas.height}`)
      
      // Try multiple QR detection approaches
      let code = null
      
      // Approach 1: Normal detection
      code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      })
      
      // Approach 2: Try with inversion if first attempt fails
      if (!code) {
        code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'onlyInvert'
        })
      }
      
      // Approach 3: Try with both inversion attempts
      if (!code) {
        code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth'
        })
      }
      
      // Approach 4: Try scanning a cropped center area (sometimes helps with focus)
      if (!code && canvas.width > 200 && canvas.height > 200) {
        const cropSize = Math.min(canvas.width, canvas.height) * 0.8
        const cropX = (canvas.width - cropSize) / 2
        const cropY = (canvas.height - cropSize) / 2
        
        const croppedImageData = context.getImageData(cropX, cropY, cropSize, cropSize)
        code = jsQR(croppedImageData.data, croppedImageData.width, croppedImageData.height, {
          inversionAttempts: 'attemptBoth'
        })
      }
      
      if (code && code.data && code.data.trim()) {
        console.log('🎉 QR Code detected:', code.data)
        console.log('QR Code location:', code.location)
        setDebugInfo(`✅ QR Code found: ${code.data.substring(0, 30)}...`)
        
        // Prevent duplicate scans
        const now = Date.now()
        if (now - lastScanTime.current > 500) { // Reduced to 500ms for faster response
          lastScanTime.current = now
          onScan(code.data.trim())
          stopScanning()
        }
      } else {
        // Show more detailed debug info
        if (scanCount % 20 === 0) { // Every 20 scans, show detailed info
          console.log('QR scan attempt:', scanCount, 'Canvas:', canvas.width + 'x' + canvas.height)
        }
      }
    } catch (error) {
      console.error('Scan error:', error)
      setDebugInfo(`Scan error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }, [isScanning, scanCount, onScan])
  
  const startScanLoop = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
    }
    
    setScanCount(0)
    
    scanIntervalRef.current = setInterval(() => {
      scanForQR()
    }, 100) // Scan every 100ms for faster detection
  }, [scanForQR])


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
      
      {debugInfo && (
        <div className="text-emerald-700 text-sm bg-emerald-50 p-3 rounded-lg border border-emerald-200 flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="font-medium">Status:</span> {debugInfo}
        </div>
      )}
      
      {isScanning && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-emerald-600 text-sm font-medium">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
            Scanning for QR codes... ({scanCount} attempts)
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
