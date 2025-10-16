'use client'

import { useState } from 'react'
import { SmartQRScanner } from '@/components/SmartQRScanner'
import { Button } from '@/components/ui/button'
import { QrCode, CheckCircle, XCircle } from 'lucide-react'

export default function TestQRPage() {
  const [scannedResult, setScannedResult] = useState<string>('')
  const [isScanning, setIsScanning] = useState(false)
  const [scanHistory, setScanHistory] = useState<string[]>([])

  const handleScan = (result: string) => {
    console.log('QR Code scanned:', result)
    setScannedResult(result)
    setScanHistory(prev => [result, ...prev.slice(0, 4)]) // Keep last 5 scans
    setIsScanning(false)
  }

  const handleError = (error: string) => {
    console.error('QR Scanner error:', error)
  }

  const clearResults = () => {
    setScannedResult('')
    setScanHistory([])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a233b] to-[#2a3441] p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-[#FFD700] mb-4">
            QR Scanner Test Page
          </h1>
          <p className="text-[#F4E4BC] text-lg">
            Test the new QR scanner functionality for Hotel 734
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scanner Section */}
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#1a233b] flex items-center gap-2">
                <QrCode className="h-6 w-6 text-[#FFD700]" />
                QR Code Scanner
              </h2>
              <Button
                onClick={() => setIsScanning(!isScanning)}
                className="bg-[#FFD700] hover:bg-[#C49B66] text-[#1a233b] font-bold"
              >
                {isScanning ? 'Hide Scanner' : 'Show Scanner'}
              </Button>
            </div>

            {isScanning && (
              <div className="space-y-4">
                <SmartQRScanner 
                  onScan={handleScan}
                  onError={handleError}
                />
              </div>
            )}

            {!isScanning && (
              <div className="text-center py-12 bg-gradient-to-br from-[#F4E4BC] to-[#E6D7A3] rounded-xl">
                <QrCode className="h-16 w-16 text-[#1a233b] mx-auto mb-4" />
                <p className="text-[#1a233b] font-medium">
                  Click "Show Scanner" to test QR code scanning
                </p>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#1a233b]">
                Scan Results
              </h2>
              {(scannedResult || scanHistory.length > 0) && (
                <Button
                  onClick={clearResults}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  Clear Results
                </Button>
              )}
            </div>

            {/* Latest Result */}
            {scannedResult && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-green-900 mb-1">Latest Scan</h3>
                    <p className="text-green-700 text-sm break-all">{scannedResult}</p>
                    <p className="text-green-600 text-xs mt-1">
                      Scanned at {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Scan History */}
            {scanHistory.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium text-[#1a233b] mb-3">Recent Scans</h3>
                {scanHistory.map((scan, index) => (
                  <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-gray-700 text-sm break-all">{scan}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      Scan #{scanHistory.length - index}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* No Results */}
            {!scannedResult && scanHistory.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <XCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="font-medium mb-1">No QR codes scanned yet</p>
                <p className="text-sm">Use the scanner to test QR code detection</p>
              </div>
            )}
          </div>
        </div>

        {/* Test Instructions */}
        <div className="bg-[#F4E4BC] border border-[#FFD700] rounded-2xl p-6">
          <h3 className="text-xl font-bold text-[#1a233b] mb-4">Testing Instructions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[#2a3441]">
            <div>
              <h4 className="font-medium mb-2">📱 Mobile Testing:</h4>
              <ul className="text-sm space-y-1">
                <li>• Test on Chrome, Safari, Firefox mobile</li>
                <li>• Try switching between front/back cameras</li>
                <li>• Test camera permissions</li>
                <li>• Verify QR code detection accuracy</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">💻 Desktop Testing:</h4>
              <ul className="text-sm space-y-1">
                <li>• Test with webcam on Chrome, Firefox, Edge</li>
                <li>• Try different QR code sizes and distances</li>
                <li>• Test error handling and recovery</li>
                <li>• Verify fallback scanner functionality</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sample QR Codes */}
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <h3 className="text-xl font-bold text-[#1a233b] mb-4">Sample QR Codes for Testing</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="bg-white p-4 inline-block">
                {/* You can generate QR codes and add them here */}
                <div className="w-32 h-32 bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <span className="text-xs text-gray-500">QR Code 1</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">Test Ticket: TKT-123456</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="bg-white p-4 inline-block">
                <div className="w-32 h-32 bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <span className="text-xs text-gray-500">QR Code 2</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">Test URL: https://hotel734.com</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="bg-white p-4 inline-block">
                <div className="w-32 h-32 bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <span className="text-xs text-gray-500">QR Code 3</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">Test Data: {"{"}"event": "test"{"}"}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4 text-center">
            Generate your own QR codes at <a href="https://qr-code-generator.com" target="_blank" rel="noopener noreferrer" className="text-[#FFD700] hover:underline">qr-code-generator.com</a> to test scanning
          </p>
        </div>
      </div>
    </div>
  )
}
