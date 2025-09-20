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
  const debugCanvasRef = useRef<HTMLCanvasElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string>('')
  const [debugInfo, setDebugInfo] = useState<string>('')
  const [scanCount, setScanCount] = useState(0)
  const [showDebugCanvas, setShowDebugCanvas] = useState(false)
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
      const videoWidth = video.videoWidth
      const videoHeight = video.videoHeight
      
      if (videoWidth === 0 || videoHeight === 0) {
        setDebugInfo('Invalid video dimensions')
        return
      }
      
      canvas.width = videoWidth
      canvas.height = videoHeight
      
      // Clear canvas and draw video frame
      context.clearRect(0, 0, canvas.width, canvas.height)
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      // Update debug canvas if enabled
      if (showDebugCanvas && debugCanvasRef.current) {
        const debugCanvas = debugCanvasRef.current
        const debugContext = debugCanvas.getContext('2d')
        if (debugContext) {
          debugCanvas.width = Math.min(canvas.width, 400)
          debugCanvas.height = Math.min(canvas.height, 300)
          debugContext.drawImage(canvas, 0, 0, debugCanvas.width, debugCanvas.height)
        }
      }
      
      // Update scan count
      const currentScanCount = scanCount + 1
      setScanCount(currentScanCount)
      setDebugInfo(`🔍 Scanning... (${currentScanCount} attempts) - ${canvas.width}x${canvas.height}`)
      
      // Get image data for the entire canvas
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      
      // Try to decode QR code with jsQR
      let code = null
      
      // Method 1: Standard detection
      code = jsQR(imageData.data, imageData.width, imageData.height)
      
      // Method 2: Try with different scan regions if no code found
      if (!code) {
        // Try scanning different regions of the image
        const regions = [
          // Full image
          { x: 0, y: 0, w: canvas.width, h: canvas.height },
          // Center 80%
          { 
            x: Math.floor(canvas.width * 0.1), 
            y: Math.floor(canvas.height * 0.1), 
            w: Math.floor(canvas.width * 0.8), 
            h: Math.floor(canvas.height * 0.8) 
          },
          // Center 60%
          { 
            x: Math.floor(canvas.width * 0.2), 
            y: Math.floor(canvas.height * 0.2), 
            w: Math.floor(canvas.width * 0.6), 
            h: Math.floor(canvas.height * 0.6) 
          }
        ]
        
        for (const region of regions) {
          if (region.w > 50 && region.h > 50) { // Minimum size check
            const regionImageData = context.getImageData(region.x, region.y, region.w, region.h)
            code = jsQR(regionImageData.data, regionImageData.width, regionImageData.height)
            if (code) {
              console.log(`QR found in region: ${region.x},${region.y} ${region.w}x${region.h}`)
              break
            }
          }
        }
      }
      
      // Method 3: Try with image preprocessing if still no code
      if (!code) {
        // Enhance contrast
        const enhancedImageData = enhanceImageContrast(imageData)
        code = jsQR(enhancedImageData.data, enhancedImageData.width, enhancedImageData.height)
      }
      
      if (code && code.data && code.data.trim()) {
        console.log('🎉 QR Code detected:', code.data)
        console.log('QR Code location:', code.location)
        setDebugInfo(`✅ QR Code found: ${code.data.substring(0, 30)}...`)
        
        // Prevent duplicate scans
        const now = Date.now()
        if (now - lastScanTime.current > 300) {
          lastScanTime.current = now
          onScan(code.data.trim())
          stopScanning()
        }
      } else {
        // Show debug info every 30 scans
        if (currentScanCount % 30 === 0) {
          console.log(`QR scan attempt ${currentScanCount}: No QR code found in ${canvas.width}x${canvas.height} image`)
          
          // Log a sample of the image data to verify we're getting video frames
          const sampleData = imageData.data.slice(0, 100)
          const hasVariation = new Set(sampleData).size > 10
          console.log('Image data variation:', hasVariation ? 'Good' : 'Poor (static image?)')
        }
      }
    } catch (error) {
      console.error('Scan error:', error)
      setDebugInfo(`Scan error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }, [isScanning, scanCount, onScan])
  
  // Helper function to enhance image contrast
  const enhanceImageContrast = (imageData: ImageData): ImageData => {
    const data = new Uint8ClampedArray(imageData.data)
    const factor = 1.5 // Contrast factor
    
    for (let i = 0; i < data.length; i += 4) {
      // Convert to grayscale and enhance contrast
      const gray = (data[i] + data[i + 1] + data[i + 2]) / 3
      const enhanced = Math.min(255, Math.max(0, (gray - 128) * factor + 128))
      
      data[i] = enhanced     // R
      data[i + 1] = enhanced // G
      data[i + 2] = enhanced // B
      // Alpha stays the same
    }
    
    return new ImageData(data, imageData.width, imageData.height)
  }
  
  const startScanLoop = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
    }
    
    setScanCount(0)
    
    scanIntervalRef.current = setInterval(() => {
      scanForQR()
    }, 200) // Scan every 200ms to reduce CPU load while maintaining responsiveness
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
        
        {/* Debug canvas for troubleshooting */}
        {showDebugCanvas && (
          <canvas
            ref={debugCanvasRef}
            className="absolute top-2 right-2 border-2 border-yellow-400 bg-black/80 rounded"
            style={{ width: '120px', height: '90px' }}
          />
        )}
        
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
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 text-emerald-600 text-sm font-medium">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
            Scanning for QR codes... ({scanCount} attempts)
          </div>
          <Button
            onClick={() => setShowDebugCanvas(!showDebugCanvas)}
            variant="outline"
            size="sm"
            className="text-xs border-yellow-300 text-yellow-700 hover:bg-yellow-50"
          >
            {showDebugCanvas ? 'Hide' : 'Show'} Debug View
          </Button>
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
