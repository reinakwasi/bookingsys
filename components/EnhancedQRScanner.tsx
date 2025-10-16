'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, CameraOff, RotateCcw, Zap, AlertCircle, CheckCircle, Smartphone, Monitor } from 'lucide-react'
// Import html5-qrcode types only, actual import will be dynamic
type Html5Qrcode = any
type Html5QrcodeSupportedFormats = any

interface EnhancedQRScannerProps {
  onScan: (result: string) => void
  onError?: (error: string) => void
}

interface CameraDevice {
  id: string
  label: string
}

export function EnhancedQRScanner({ onScan, onError }: EnhancedQRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string>('')
  const [debugInfo, setDebugInfo] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [cameras, setCameras] = useState<CameraDevice[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string>('')
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown')
  const [Html5QrcodeClass, setHtml5QrcodeClass] = useState<any>(null)
  const [isLibraryLoaded, setIsLibraryLoaded] = useState(false)
  
  const html5QrCodeRef = useRef<any>(null)
  const scannerElementId = 'qr-scanner-container'

  // Load html5-qrcode library dynamically
  useEffect(() => {
    const loadLibrary = async () => {
      try {
        const module = await import('html5-qrcode')
        setHtml5QrcodeClass(module.Html5Qrcode)
        setIsLibraryLoaded(true)
        console.log('✅ html5-qrcode library loaded successfully')
      } catch (error) {
        console.error('Failed to load html5-qrcode:', error)
        setError('Failed to load QR scanner library')
        setIsLibraryLoaded(false)
        onError?.('Failed to load QR scanner library')
      }
    }
    
    loadLibrary()
  }, [onError])

  // Check camera permissions
  const checkCameraPermissions = useCallback(async () => {
    try {
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'camera' as PermissionName })
        setPermissionStatus(permission.state)
        
        permission.addEventListener('change', () => {
          setPermissionStatus(permission.state)
        })
      }
    } catch (error) {
      console.log('Permission API not supported')
      setPermissionStatus('unknown')
    }
  }, [])

  // Get available cameras
  const getCameras = useCallback(async () => {
    try {
      if (!Html5QrcodeClass || !isLibraryLoaded) {
        throw new Error('QR scanner library not loaded')
      }

      setDebugInfo('🔍 Detecting cameras...')
      
      // First request camera permission
      await navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          // Stop the stream immediately, we just needed permission
          stream.getTracks().forEach(track => track.stop())
        })

      const devices = await Html5QrcodeClass.getCameras()
      console.log('📹 Available cameras:', devices)
      
      const cameraDevices: CameraDevice[] = devices.map((device: any, index: number) => ({
        id: device.id,
        label: device.label || `Camera ${index + 1}`
      }))
      
      setCameras(cameraDevices)
      
      // Auto-select back camera if available, otherwise first camera
      const backCamera = cameraDevices.find(cam => 
        cam.label.toLowerCase().includes('back') || 
        cam.label.toLowerCase().includes('environment') ||
        cam.label.toLowerCase().includes('rear')
      )
      
      const defaultCamera = backCamera || cameraDevices[0]
      if (defaultCamera) {
        setSelectedCamera(defaultCamera.id)
        setDebugInfo(`📱 Found ${cameraDevices.length} camera(s). Selected: ${defaultCamera.label}`)
      }
      
      return cameraDevices
    } catch (error) {
      console.error('❌ Error getting cameras:', error)
      const errorMsg = error instanceof Error ? error.message : 'Failed to access cameras'
      setError(`Camera access failed: ${errorMsg}`)
      setDebugInfo(`❌ Camera detection failed: ${errorMsg}`)
      onError?.(errorMsg)
      return []
    }
  }, [Html5QrcodeClass, isLibraryLoaded, onError])

  // Start QR scanning
  const startScanning = useCallback(async () => {
    try {
      if (!Html5QrcodeClass || !isLibraryLoaded) {
        throw new Error('QR scanner library not loaded')
      }

      setIsLoading(true)
      setError('')
      setDebugInfo('🚀 Starting QR scanner...')
      
      // Stop any existing scanner
      if (html5QrCodeRef.current) {
        await stopScanning()
      }

      // Get cameras if not already loaded
      let availableCameras = cameras
      if (cameras.length === 0) {
        availableCameras = await getCameras()
      }

      if (availableCameras.length === 0) {
        throw new Error('No cameras found. Please check camera permissions and try again.')
      }

      const cameraId = selectedCamera || availableCameras[0].id
      console.log('📹 Starting scanner with camera:', cameraId)

      // Create new Html5Qrcode instance
      html5QrCodeRef.current = new Html5QrcodeClass(scannerElementId)

      // Configure scanner
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        disableFlip: false,
      }

      // Start scanning
      await html5QrCodeRef.current.start(
        cameraId,
        config,
        (decodedText: string, decodedResult: any) => {
          console.log('🎉 QR Code detected:', decodedText)
          setDebugInfo(`✅ QR detected: ${decodedText}`)
          
          // Validate and process QR code
          if (decodedText && decodedText.trim()) {
            onScan(decodedText.trim())
            stopScanning() // Auto-stop after successful scan
          }
        },
        (errorMessage: string) => {
          // This is called for every frame where no QR code is detected
          // We don't want to log this as it's normal behavior
        }
      )

      setIsScanning(true)
      setDebugInfo('📹 Scanner active - Point camera at QR code')
      console.log('✅ QR scanner started successfully')

    } catch (error) {
      console.error('❌ QR scanner error:', error)
      const errorMsg = error instanceof Error ? error.message : 'Failed to start QR scanner'
      setError(errorMsg)
      setDebugInfo(`❌ Error: ${errorMsg}`)
      onError?.(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }, [Html5QrcodeClass, isLibraryLoaded, cameras, selectedCamera, getCameras, onScan, onError])

  // Stop QR scanning
  const stopScanning = useCallback(async () => {
    try {
      console.log('🛑 Stopping QR scanner')
      
      if (html5QrCodeRef.current) {
        const scanner = html5QrCodeRef.current
        
        if (scanner.getState() === 2) { // SCANNING state
          await scanner.stop()
        }
        
        scanner.clear()
        html5QrCodeRef.current = null
      }
      
      setIsScanning(false)
      setError('')
      setDebugInfo('')
    } catch (error) {
      console.error('Error stopping scanner:', error)
      // Force reset even if stop fails
      setIsScanning(false)
      html5QrCodeRef.current = null
    }
  }, [])

  // Switch camera
  const switchCamera = useCallback(async () => {
    if (cameras.length <= 1) return

    const currentIndex = cameras.findIndex(cam => cam.id === selectedCamera)
    const nextIndex = (currentIndex + 1) % cameras.length
    const nextCamera = cameras[nextIndex]
    
    setSelectedCamera(nextCamera.id)
    setDebugInfo(`🔄 Switching to: ${nextCamera.label}`)
    
    if (isScanning) {
      await stopScanning()
      // Small delay before restarting with new camera
      setTimeout(() => {
        startScanning()
      }, 500)
    }
  }, [cameras, selectedCamera, isScanning, stopScanning, startScanning])

  // Request camera permissions
  const requestPermissions = useCallback(async () => {
    try {
      setIsLoading(true)
      setDebugInfo('🔐 Requesting camera permissions...')
      
      await navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          stream.getTracks().forEach(track => track.stop())
          setPermissionStatus('granted')
          getCameras()
        })
    } catch (error) {
      console.error('Permission denied:', error)
      setPermissionStatus('denied')
      setError('Camera permission denied. Please allow camera access and try again.')
    } finally {
      setIsLoading(false)
    }
  }, [getCameras])

  // Initialize component
  useEffect(() => {
    checkCameraPermissions()
    
    return () => {
      stopScanning()
    }
  }, [checkCameraPermissions, stopScanning])

  // Auto-load cameras when permission is granted
  useEffect(() => {
    if (permissionStatus === 'granted' && cameras.length === 0) {
      getCameras()
    }
  }, [permissionStatus, cameras.length, getCameras])

  return (
    <div className="space-y-4">
      {/* Scanner Container */}
      <div className="relative bg-gradient-to-br from-[#1a233b] to-[#2a3441] rounded-xl overflow-hidden shadow-2xl border-2 border-[#FFD700]">
        {/* Scanner Element */}
        <div 
          id={scannerElementId}
          className={`w-full ${isScanning ? 'block' : 'hidden'}`}
          style={{ minHeight: '320px' }}
        />
        
        {/* Placeholder when not scanning */}
        {!isScanning && (
          <div className="w-full h-80 bg-gradient-to-br from-[#F4E4BC] to-[#E6D7A3] flex items-center justify-center">
            <div className="text-center text-[#1a233b]">
              <div className="bg-[#FFD700] rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Camera className="h-10 w-10 text-[#1a233b]" />
              </div>
              <h3 className="font-bold text-lg mb-2">QR Code Scanner</h3>
              <p className="text-sm text-[#2a3441] mb-4">
                {permissionStatus === 'denied' 
                  ? 'Camera permission required'
                  : cameras.length === 0 
                    ? 'Click to detect cameras'
                    : 'Ready to scan QR codes'
                }
              </p>
              
              {/* Camera selection */}
              {cameras.length > 0 && (
                <div className="text-xs text-[#2a3441] mb-2">
                  <span className="font-medium">Selected:</span> {cameras.find(c => c.id === selectedCamera)?.label}
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
      
      {/* Active Scanner Status */}
      {isScanning && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-[#FFD700] text-sm font-bold bg-[#1a233b] px-4 py-2 rounded-full">
            <div className="w-2 h-2 bg-[#FFD700] rounded-full animate-ping"></div>
            QR Scanner Active - Point camera at QR code
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Main Action Button */}
        {!isScanning ? (
          <Button 
            onClick={permissionStatus === 'denied' ? requestPermissions : startScanning}
            disabled={isLoading || !isLibraryLoaded}
            className="flex-1 bg-gradient-to-r from-[#FFD700] to-[#C49B66] hover:from-[#C49B66] hover:to-[#FFD700] text-[#1a233b] font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#1a233b] mr-2"></div>
            ) : (
              <Camera className="h-5 w-5 mr-2" />
            )}
            {!isLibraryLoaded
              ? 'Loading QR Library...'
              : permissionStatus === 'denied' 
                ? 'Grant Camera Permission'
                : cameras.length === 0 
                  ? 'Detect Cameras'
                  : 'Start QR Scanner'
            }
          </Button>
        ) : (
          <Button 
            onClick={stopScanning}
            disabled={isLoading}
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
            disabled={isLoading}
            variant="outline"
            className="border-2 border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700] hover:text-[#1a233b] px-4 rounded-xl transition-all duration-300 flex items-center gap-2"
          >
            <RotateCcw className="h-5 w-5" />
            <span className="hidden sm:inline">Switch Camera</span>
            <span className="sm:hidden">
              {cameras.find(c => c.id === selectedCamera)?.label.includes('back') || 
               cameras.find(c => c.id === selectedCamera)?.label.includes('environment') ? (
                <Smartphone className="h-4 w-4" />
              ) : (
                <Monitor className="h-4 w-4" />
              )}
            </span>
          </Button>
        )}
        
        {/* Restart Button */}
        {isScanning && (
          <Button 
            onClick={() => {
              stopScanning()
              setTimeout(startScanning, 500)
            }}
            disabled={isLoading}
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
          <p className="flex items-center justify-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            {cameras.length} camera{cameras.length > 1 ? 's' : ''} detected
            {cameras.length > 1 && ' • Use switch button to change camera'}
          </p>
        </div>
      )}
    </div>
  )
}
