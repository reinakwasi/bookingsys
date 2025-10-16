'use client'

import { UltraSimpleQRScanner } from './UltraSimpleQRScanner'

interface SmartQRScannerProps {
  onScan: (result: string) => void
  onError?: (error: string) => void
}

export function SmartQRScanner({ onScan, onError }: SmartQRScannerProps) {
  // Use ultra-simple scanner that bypasses all permission checks
  return (
    <UltraSimpleQRScanner 
      onScan={onScan}
      onError={onError}
    />
  )
}
