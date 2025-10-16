'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, CameraOff, RotateCcw, Zap, AlertCircle, Smartphone } from 'lucide-react'

interface FallbackQRScannerProps {
  onScan: (result: string) => void
  onError?: (error: string) => void
}

export function FallbackQRScanner({ onScan, onError }: FallbackQRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string>('')
  const [debugInfo, setDebugInfo] = useState<string>('')
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([])
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Import jsQR dynamically
  const [jsQR, setJsQR] = useState<any>(null)
  const [isLibraryLoaded, setIsLibraryLoaded] = useState(false)

  useEffect(() => {
    import('jsqr').then((module) => {
      setJsQR(module.default)
      setIsLibraryLoaded(true)
    }).catch((error) => {
      console.error('Failed to load jsQR:', error)
      setError('QR scanner library failed to load')
      setIsLibraryLoaded(false)
    })
  }, [])

  // Get available cameras
  const getCameras = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      setCameras(videoDevices)
      return videoDevices
    } catch (error) {
      console.error('Error getting cameras:', error)
      return []
    }
  }, [])

  // Start camera stream
  const startCamera = useCallback(async () => {
    try {
      setError('')
      setDebugInfo('🔄 Starting camera...')

      // Stop existing stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }

      const availableCameras = await getCameras()
      
      if (availableCameras.length === 0) {
        throw new Error('No cameras found')
      }

      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: availableCameras[currentCameraIndex]?.deviceId,
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: availableCameras.length > 1 ? 'environment' : undefined
        }
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(mediaStream)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.play()
      }

      setDebugInfo(`📹 Camera active (${availableCameras[currentCameraIndex]?.label || 'Camera'})`)
      return mediaStream
    } catch (error) {
      console.error('Camera error:', error)
      const errorMsg = error instanceof Error ? error.message : 'Camera access failed'
      setError(errorMsg)
      setDebugInfo(`❌ ${errorMsg}`)
      onError?.(errorMsg)
      throw error
    }
  }, [stream, currentCameraIndex, getCameras, onError])

  // Scan QR code from video
  const scanQRCode = useCallback(() => {
    if (!jsQR || !isLibraryLoaded || !videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    })

    if (code) {
      console.log('🎉 QR Code detected:', code.data)
      setDebugInfo(`✅ QR detected: ${code.data}`)
      onScan(code.data)
      stopScanning()
    }
  }, [jsQR, isLibraryLoaded, onScan])

  // Start scanning
  const startScanning = useCallback(async () => {
    try {
      setIsScanning(true)
      await startCamera()
      
      // Start scanning loop
      scanIntervalRef.current = setInterval(scanQRCode, 100)
      setDebugInfo('📹 Scanning for QR codes...')
    } catch (error) {
      setIsScanning(false)
    }
  }, [startCamera, scanQRCode])

  // Stop scanning
  const stopScanning = useCallback(() => {
    setIsScanning(false)
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    
    setError('')
    setDebugInfo('')
  }, [stream])

  // Switch camera
  const switchCamera = useCallback(() => {
    if (cameras.length <= 1) return
    
    const nextIndex = (currentCameraIndex + 1) % cameras.length
    setCurrentCameraIndex(nextIndex)
    
    if (isScanning) {
      stopScanning()
      setTimeout(startScanning, 500)
    }
  }, [cameras.length, currentCameraIndex, isScanning, stopScanning, startScanning])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [stopScanning])

  return (
    <div className="space-y-4">
      {/* Scanner Container */}
      <div className="relative bg-gradient-to-br from-[#1a233b] to-[#2a3441] rounded-xl overflow-hidden shadow-2xl border-2 border-[#FFD700]">
        {/* Video Element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-80 object-cover ${isScanning ? 'block' : 'hidden'}`}
        />
        
        {/* Hidden Canvas for QR Processing */}
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Placeholder when not scanning */}
        {!isScanning && (
          <div className="w-full h-80 bg-gradient-to-br from-[#F4E4BC] to-[#E6D7A3] flex items-center justify-center">
            <div className="text-center text-[#1a233b]">
              <div className="bg-[#FFD700] rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Camera className="h-10 w-10 text-[#1a233b]" />
              </div>
              <h3 className="font-bold text-lg mb-2">QR Code Scanner</h3>
              <p className="text-sm text-[#2a3441] mb-4">
                {cameras.length === 0 
                  ? 'Detecting cameras...'
                  : `Ready to scan (${cameras.length} camera${cameras.length > 1 ? 's' : ''} available)`
                }
              </p>
            </div>
          </div>
        )}
        
        {/* Scanning Overlay */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Scanning frame */}
            <div className="absolute inset-6 border-2 border-[#FFD700] rounded-lg animate-pulse">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#FFD700] rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#FFD700] rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#FFD700] rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#FFD700] rounded-br-lg"></div>
            </div>
            
            {/* Status indicator */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-[#FFD700]/90 text-[#1a233b] px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
              <Zap className="h-4 w-4 animate-pulse" />
              Position QR code within the frame
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-red-900 mb-1">Scanner Error</h4>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}
      
      {/* Debug Info */}
      {debugInfo && !error && (
        <div className="bg-[#F4E4BC] border border-[#FFD700] rounded-lg p-3 flex items-center gap-2">
          <div className="w-2 h-2 bg-[#FFD700] rounded-full animate-pulse"></div>
          <span className="font-medium text-[#1a233b]">Status:</span> 
          <span className="text-[#2a3441]">{debugInfo}</span>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Main Action Button */}
        {!isScanning ? (
          <Button 
            onClick={startScanning}
            disabled={!jsQR || !isLibraryLoaded}
            className="flex-1 bg-gradient-to-r from-[#FFD700] to-[#C49B66] hover:from-[#C49B66] hover:to-[#FFD700] text-[#1a233b] font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Camera className="h-5 w-5 mr-2" />
            {!jsQR || !isLibraryLoaded ? 'Loading Scanner...' : 'Start QR Scanner'}
          </Button>
        ) : (
          <Button 
            onClick={stopScanning}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <CameraOff className="h-5 w-5 mr-2" />
            Stop Scanner
          </Button>
        )}
        
        {/* Camera Switch Button */}
        {cameras.length > 1 && (
          <Button 
            onClick={switchCamera}
            variant="outline"
            className="border-2 border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700] hover:text-[#1a233b] px-4 rounded-xl transition-all duration-300 flex items-center gap-2"
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
