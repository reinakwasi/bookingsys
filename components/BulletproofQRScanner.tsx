'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, CameraOff, RotateCcw, Zap, AlertCircle, Smartphone, Shield, RefreshCw } from 'lucide-react'

interface BulletproofQRScannerProps {
  onScan: (result: string) => void
  onError?: (error: string) => void
}

export function BulletproofQRScanner({ onScan, onError }: BulletproofQRScannerProps) {
  // Use refs instead of state for critical values to avoid hydration issues
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const jsQRRef = useRef<any>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const camerasRef = useRef<MediaDeviceInfo[]>([])
  const currentCameraIndexRef = useRef<number>(0)
  
  // Only UI state that's safe for hydration
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string>('')
  const [debugInfo, setDebugInfo] = useState<string>('')
  const [isLibraryLoaded, setIsLibraryLoaded] = useState(false)
  const [cameraCount, setCameraCount] = useState(0)
  const [currentCameraLabel, setCurrentCameraLabel] = useState('')
  const [isMounted, setIsMounted] = useState(false)
  const [permissionState, setPermissionState] = useState<'unknown' | 'granted' | 'denied' | 'prompt'>('unknown')
  const [isRequestingPermission, setIsRequestingPermission] = useState(false)

  // Ensure component is mounted and auto-start camera
  useEffect(() => {
    setIsMounted(true)
    
    // Auto-attempt camera access after component mounts
    const autoStartTimer = setTimeout(() => {
      if (isLibraryLoaded && jsQRRef.current) {
        console.log('🚀 Auto-attempting camera access...')
        startScanning()
      }
    }, 1000) // Give library time to load
    
    return () => clearTimeout(autoStartTimer)
  }, [isLibraryLoaded])

  // Load jsQR library safely
  useEffect(() => {
    if (!isMounted) return

    let mounted = true
    
    const loadLibrary = async () => {
      try {
        console.log('🔄 Loading jsQR library...')
        const module = await import('jsqr')
        
        if (mounted && module.default) {
          jsQRRef.current = module.default
          setIsLibraryLoaded(true)
          setDebugInfo('✅ QR scanner library loaded')
          console.log('✅ jsQR library loaded successfully')
        }
      } catch (error) {
        console.error('Failed to load jsQR:', error)
        if (mounted) {
          setError('QR scanner library failed to load')
          setIsLibraryLoaded(false)
          onError?.('QR scanner library failed to load')
        }
      }
    }
    
    loadLibrary()
    
    return () => {
      mounted = false
    }
  }, [isMounted, onError])

  // Bulletproof camera permission check
  const checkCameraPermission = async (): Promise<'granted' | 'denied' | 'prompt' | 'unknown'> => {
    try {
      // First check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.log('❌ MediaDevices API not supported')
        setError('Camera not supported in this browser')
        return 'denied'
      }

      // Try permissions API if available
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const permission = await navigator.permissions.query({ name: 'camera' as PermissionName })
          console.log('🔍 Permission API result:', permission.state)
          setPermissionState(permission.state)
          
          // Listen for permission changes
          permission.onchange = () => {
            console.log('📱 Permission changed to:', permission.state)
            setPermissionState(permission.state)
          }
          
          return permission.state
        } catch (permError) {
          console.log('⚠️ Permissions API failed:', permError)
        }
      }

      // Fallback: Try to access camera directly to test permission
      try {
        const testStream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 1, height: 1 } 
        })
        testStream.getTracks().forEach(track => track.stop())
        console.log('✅ Camera access test successful')
        setPermissionState('granted')
        return 'granted'
      } catch (testError: any) {
        console.log('❌ Camera access test failed:', testError.name)
        if (testError.name === 'NotAllowedError') {
          setPermissionState('denied')
          return 'denied'
        }
        setPermissionState('prompt')
        return 'prompt'
      }
    } catch (error) {
      console.log('❌ Permission check completely failed:', error)
      setPermissionState('unknown')
      return 'unknown'
    }
  }

  // Request camera permission with comprehensive error handling
  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      setIsRequestingPermission(true)
      setError('')
      setDebugInfo('🔐 Requesting camera permission...')
      
      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser')
      }

      console.log('📱 Requesting camera access...')
      
      // Request permission with minimal constraints
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 320, min: 160 }, 
          height: { ideal: 240, min: 120 },
          facingMode: 'environment'
        } 
      })
      
      // Stop the stream immediately - we just wanted permission
      console.log('✅ Permission granted, stopping test stream')
      stream.getTracks().forEach(track => {
        track.stop()
        console.log('🛑 Stopped track:', track.label)
      })
      
      setPermissionState('granted')
      setDebugInfo('✅ Camera permission granted successfully')
      return true
      
    } catch (error: any) {
      console.error('❌ Permission request failed:', error)
      setPermissionState('denied')
      
      let errorMessage = 'Camera access failed'
      let userGuidance = 'Please check your camera settings'
      
      switch (error.name) {
        case 'NotAllowedError':
          errorMessage = 'Camera access denied by user'
          userGuidance = 'Please click "Allow" when prompted for camera access'
          break
        case 'NotFoundError':
          errorMessage = 'No camera device found'
          userGuidance = 'Please connect a camera and refresh the page'
          break
        case 'NotReadableError':
          errorMessage = 'Camera is busy or hardware error'
          userGuidance = 'Please close other apps using the camera and try again'
          break
        case 'OverconstrainedError':
          errorMessage = 'Camera constraints not supported'
          userGuidance = 'Your camera may not support the required settings'
          break
        case 'SecurityError':
          errorMessage = 'Camera blocked by security policy'
          userGuidance = 'Please use HTTPS or check browser security settings'
          break
        case 'AbortError':
          errorMessage = 'Camera access was aborted'
          userGuidance = 'Please try again'
          break
        default:
          errorMessage = error.message || 'Unknown camera error'
          userGuidance = 'Please refresh the page and try again'
      }
      
      setError(`${errorMessage}. ${userGuidance}`)
      setDebugInfo(`❌ ${errorMessage}`)
      onError?.(errorMessage)
      return false
      
    } finally {
      setIsRequestingPermission(false)
    }
  }

  // Get available cameras
  const getCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      camerasRef.current = videoDevices
      setCameraCount(videoDevices.length)
      
      // Try to find back camera
      const backCameraIndex = videoDevices.findIndex(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('environment') ||
        device.label.toLowerCase().includes('rear')
      )
      
      if (backCameraIndex !== -1) {
        currentCameraIndexRef.current = backCameraIndex
      }
      
      const currentCamera = videoDevices[currentCameraIndexRef.current]
      setCurrentCameraLabel(currentCamera?.label || `Camera ${currentCameraIndexRef.current + 1}`)
      
      return videoDevices
    } catch (error) {
      console.error('Error getting cameras:', error)
      return []
    }
  }

  // Start camera with seamless access attempt
  const startCamera = async () => {
    try {
      setError('')
      setDebugInfo('🔄 Starting camera...')

      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }

      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser')
      }

      // Try to get cameras first
      const availableCameras = await getCameras()
      
      if (availableCameras.length === 0) {
        // Try basic constraints if no cameras detected
        console.log('⚠️ No cameras detected, trying basic constraints...')
      }

      // Start with basic constraints for better compatibility
      const baseVideoConstraints = {
        width: { ideal: 640, min: 320 },
        height: { ideal: 480, min: 240 },
        facingMode: 'environment' as const // Prefer back camera
      }

      // If we have specific cameras, add device ID
      const videoConstraints = availableCameras.length > 0 
        ? {
            ...baseVideoConstraints,
            deviceId: availableCameras[currentCameraIndexRef.current]?.deviceId
          }
        : baseVideoConstraints

      const constraints: MediaStreamConstraints = {
        video: videoConstraints
      }

      console.log('📱 Requesting camera with constraints:', constraints)
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = mediaStream

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        await videoRef.current.play()
      }

      const cameraLabel = availableCameras[currentCameraIndexRef.current]?.label || 'Camera'
      setCurrentCameraLabel(cameraLabel)
      setDebugInfo(`📹 Camera active: ${cameraLabel}`)
      setPermissionState('granted')
      
      console.log('✅ Camera started successfully')
      return mediaStream
      
    } catch (error: any) {
      console.error('❌ Camera error:', error)
      
      let errorMsg = 'Camera access failed'
      let showPermissionUI = false
      
      if (error instanceof Error) {
        switch (error.name) {
          case 'NotAllowedError':
            errorMsg = 'Camera access denied. Click "Grant Permission" below to allow camera access.'
            setPermissionState('denied')
            showPermissionUI = true
            break
          case 'NotFoundError':
            errorMsg = 'No camera found. Please connect a camera and try again.'
            break
          case 'NotReadableError':
            errorMsg = 'Camera is busy. Please close other apps using the camera.'
            break
          case 'OverconstrainedError':
            errorMsg = 'Camera settings not supported. Trying basic settings...'
            // Try again with minimal constraints
            try {
              const basicStream = await navigator.mediaDevices.getUserMedia({ video: true })
              streamRef.current = basicStream
              if (videoRef.current) {
                videoRef.current.srcObject = basicStream
                await videoRef.current.play()
              }
              setDebugInfo('📹 Camera active with basic settings')
              setPermissionState('granted')
              return basicStream
            } catch (basicError) {
              errorMsg = 'Camera not compatible with this device'
            }
            break
          case 'SecurityError':
            errorMsg = 'Camera blocked by security policy. Please use HTTPS.'
            break
          default:
            errorMsg = error.message || 'Unknown camera error'
        }
      }
      
      setError(errorMsg)
      setDebugInfo(`❌ ${errorMsg}`)
      onError?.(errorMsg)
      
      // Only show permission UI for permission-related errors
      if (!showPermissionUI) {
        setPermissionState('unknown')
      }
      
      throw error
    }
  }

  // Scan QR code with maximum safety
  const scanQRCode = () => {
    // Multiple safety checks
    if (!jsQRRef.current || !isLibraryLoaded || !videoRef.current || !canvasRef.current) {
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    
    if (!video || !canvas) return
    if (video.readyState !== video.HAVE_ENOUGH_DATA) return

    try {
      const context = canvas.getContext('2d')
      if (!context) return

      // Set canvas dimensions
      const width = video.videoWidth
      const height = video.videoHeight
      
      if (width === 0 || height === 0) return
      
      canvas.width = width
      canvas.height = height
      
      // Draw video frame to canvas
      context.drawImage(video, 0, 0, width, height)

      // Get image data with safety checks
      const imageData = context.getImageData(0, 0, width, height)
      
      if (!imageData || !imageData.data || imageData.data.length === 0) {
        return
      }

      // Call jsQR with all safety checks
      const jsQRFunction = jsQRRef.current
      if (typeof jsQRFunction !== 'function') return

      const code = jsQRFunction(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      })

      if (code && code.data && typeof code.data === 'string' && code.data.trim()) {
        console.log('🎉 QR Code detected:', code.data)
        setDebugInfo(`✅ QR detected: ${code.data}`)
        onScan(code.data.trim())
        stopScanning()
      }
    } catch (error) {
      console.error('Scan error:', error)
      // Continue scanning even on errors - don't break the loop
    }
  }

  // Start scanning directly without permission check
  const startScanning = async () => {
    if (!jsQRRef.current || !isLibraryLoaded) {
      setError('QR scanner library not loaded')
      return
    }

    try {
      setIsScanning(true)
      setError('')
      setDebugInfo('🔄 Starting camera...')
      
      // Directly attempt camera access
      await startCamera()
      
      // Start scanning loop with safety
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current)
      }
      
      scanIntervalRef.current = setInterval(() => {
        try {
          scanQRCode()
        } catch (error) {
          console.error('Scan loop error:', error)
        }
      }, 150)
      
      setDebugInfo('📹 Scanning for QR codes...')
    } catch (error) {
      setIsScanning(false)
      console.error('Failed to start scanning:', error)
      // Don't show permission UI immediately, just show the error
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
    
    setError('')
    setDebugInfo('')
  }

  // Switch camera
  const switchCamera = () => {
    if (camerasRef.current.length <= 1) return
    
    const nextIndex = (currentCameraIndexRef.current + 1) % camerasRef.current.length
    currentCameraIndexRef.current = nextIndex
    
    const newCamera = camerasRef.current[nextIndex]
    setCurrentCameraLabel(newCamera?.label || `Camera ${nextIndex + 1}`)
    
    if (isScanning) {
      stopScanning()
      setTimeout(startScanning, 500)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [])

  // Don't render until mounted (avoid hydration issues)
  if (!isMounted) {
    return (
      <div className="space-y-4">
        <div className="relative bg-gradient-to-br from-[#1a233b] to-[#2a3441] rounded-xl overflow-hidden shadow-2xl border-2 border-[#FFD700]">
          <div className="w-full h-80 bg-gradient-to-br from-[#F4E4BC] to-[#E6D7A3] flex items-center justify-center">
            <div className="text-center text-[#1a233b]">
              <div className="bg-[#FFD700] rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a233b]"></div>
              </div>
              <h3 className="font-bold text-lg mb-2">Initializing Scanner</h3>
              <p className="text-sm text-[#2a3441]">Loading QR scanner...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

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
        
        {/* Hidden Canvas */}
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Placeholder */}
        {!isScanning && (
          <div className="w-full h-80 bg-gradient-to-br from-[#F4E4BC] to-[#E6D7A3] flex items-center justify-center">
            <div className="text-center text-[#1a233b] max-w-sm mx-auto px-4">
              <div className="bg-[#FFD700] rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-lg">
                {isRequestingPermission ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a233b]"></div>
                ) : permissionState === 'denied' ? (
                  <AlertCircle className="h-10 w-10 text-red-600" />
                ) : (
                  <Camera className="h-10 w-10 text-[#1a233b]" />
                )}
              </div>
              <h3 className="font-bold text-lg mb-2">QR Code Scanner</h3>
              <p className="text-sm text-[#2a3441] mb-2">
                {isRequestingPermission
                  ? 'Requesting camera permission...'
                  : !isLibraryLoaded 
                    ? 'Loading scanner library...'
                    : permissionState === 'denied'
                      ? 'Camera permission needed'
                      : 'Ready to scan QR codes'
                }
              </p>
              {permissionState === 'denied' && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-4 w-4 text-red-600" />
                    <p className="text-sm font-medium text-red-800">
                      Camera Access Required
                    </p>
                  </div>
                  <p className="text-xs text-red-700 mb-3">
                    To scan QR codes, please grant camera permission:
                  </p>
                  <ul className="text-xs text-red-600 text-left space-y-2 mb-3">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">1.</span>
                      <span>Look for the camera icon 📷 in your browser's address bar</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">2.</span>
                      <span>Click it and select "Always allow" or "Allow"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">3.</span>
                      <span>Click "Grant Permission" button below</span>
                    </li>
                  </ul>
                  <div className="text-xs text-red-600 bg-red-100 p-2 rounded border">
                    <strong>Still having issues?</strong> Try refreshing the page or using a different browser.
                  </div>
                </div>
              )}
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
          <>
            {permissionState === 'denied' ? (
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={requestCameraPermission}
                  disabled={isRequestingPermission}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-red-500 hover:to-orange-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRequestingPermission ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Shield className="h-5 w-5 mr-2" />
                  )}
                  {isRequestingPermission ? 'Requesting Permission...' : 'Grant Camera Permission'}
                </Button>
                <Button 
                  onClick={startScanning}
                  variant="outline"
                  className="border-2 border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700] hover:text-[#1a233b] px-4 py-2 rounded-xl transition-all duration-300"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            ) : (
              <Button 
                onClick={startScanning}
                disabled={!jsQRRef.current || !isLibraryLoaded || isRequestingPermission}
                className="flex-1 bg-gradient-to-r from-[#FFD700] to-[#C49B66] hover:from-[#C49B66] hover:to-[#FFD700] text-[#1a233b] font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Camera className="h-5 w-5 mr-2" />
                {!jsQRRef.current || !isLibraryLoaded ? 'Loading Scanner...' : 'Start QR Scanner'}
              </Button>
            )}
          </>
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
        {cameraCount > 1 && (
          <Button 
            onClick={switchCamera}
            disabled={!isLibraryLoaded}
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
      {cameraCount > 0 && currentCameraLabel && (
        <div className="text-center text-sm text-gray-600">
          <p>
            Using: {currentCameraLabel}
            {cameraCount > 1 && ` (${currentCameraIndexRef.current + 1} of ${cameraCount})`}
          </p>
        </div>
      )}
    </div>
  )
}
