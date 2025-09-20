'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, CameraOff, RotateCcw } from 'lucide-react'
import QrScanner from 'qr-scanner'

interface QRScannerProps {
  onScan: (result: string) => void
  onError?: (error: string) => void
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [qrScanner, setQrScanner] = useState<QrScanner | null>(null)
  const [error, setError] = useState<string>('')

  const startScanning = async () => {
    try {
      setError('')
      
      if (!videoRef.current) {
        const errorMsg = 'Video element not available'
        setError(errorMsg)
        onError?.(errorMsg)
        return
      }

      // Create QR scanner instance
      const scanner = new QrScanner(
        videoRef.current,
        (result) => {
          console.log('QR Code detected:', result.data)
          onScan(result.data)
          stopScanning()
        },
        {
          onDecodeError: (err) => {
            // Don't log decode errors as they happen frequently while scanning
            // console.log('QR decode error:', err)
          },
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment' // Use back camera if available
        }
      )
      
      setQrScanner(scanner)
      await scanner.start()
      setIsScanning(true)
      
    } catch (err) {
      console.error('QR Scanner error:', err)
      const errorMsg = err instanceof Error ? err.message : 'Camera access denied or not available'
      setError(errorMsg)
      onError?.(errorMsg)
    }
  }

  const stopScanning = () => {
    if (qrScanner) {
      qrScanner.stop()
      qrScanner.destroy()
      setQrScanner(null)
    }
    setIsScanning(false)
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
          style={{ display: isScanning ? 'block' : 'none' }}
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
