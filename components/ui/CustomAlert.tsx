'use client'

import React, { useState, useEffect } from 'react'
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'
import { Button } from './button'

export interface AlertData {
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  details?: string[]
  onConfirm?: () => void
  onCancel?: () => void
  confirmText?: string
  cancelText?: string
}

interface CustomAlertProps {
  alert: AlertData | null
  onClose: () => void
}

export function CustomAlert({ alert, onClose }: CustomAlertProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (alert) {
      setIsVisible(true)
    }
  }, [alert])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      onClose()
    }, 300) // Wait for animation to complete
  }

  const handleConfirm = () => {
    alert?.onConfirm?.()
    handleClose()
  }

  const handleCancel = () => {
    alert?.onCancel?.()
    handleClose()
  }

  if (!alert) return null

  const getIcon = () => {
    switch (alert.type) {
      case 'success':
        return <CheckCircle className="h-8 w-8 text-emerald-500" />
      case 'error':
        return <XCircle className="h-8 w-8 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-8 w-8 text-amber-500" />
      case 'info':
        return <Info className="h-8 w-8 text-blue-500" />
    }
  }

  const getColors = () => {
    switch (alert.type) {
      case 'success':
        return {
          bg: 'bg-emerald-50/95',
          border: 'border-emerald-200',
          title: 'text-emerald-800',
          message: 'text-emerald-700'
        }
      case 'error':
        return {
          bg: 'bg-red-50/95',
          border: 'border-red-200',
          title: 'text-red-800',
          message: 'text-red-700'
        }
      case 'warning':
        return {
          bg: 'bg-amber-50/95',
          border: 'border-amber-200',
          title: 'text-amber-800',
          message: 'text-amber-700'
        }
      case 'info':
        return {
          bg: 'bg-blue-50/95',
          border: 'border-blue-200',
          title: 'text-blue-800',
          message: 'text-blue-700'
        }
    }
  }

  const colors = getColors()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Alert Modal */}
      <div 
        className={`relative w-full max-w-md transform transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <div className={`glass-morphism rounded-3xl shadow-luxury border-2 ${colors.border} ${colors.bg} overflow-hidden`}>
          {/* Header */}
          <div className="relative p-6 pb-4">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors duration-200"
            >
              <X className="h-5 w-5 text-slate-600" />
            </button>
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                {getIcon()}
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-bold ${colors.title} mb-2`}>
                  {alert.title}
                </h3>
                <p className={`text-base ${colors.message} leading-relaxed`}>
                  {alert.message}
                </p>
              </div>
            </div>
          </div>

          {/* Details */}
          {alert.details && alert.details.length > 0 && (
            <div className="px-6 pb-4">
              <div className="bg-white/30 rounded-2xl p-4 backdrop-blur-sm">
                <ul className="space-y-2">
                  {alert.details.map((detail, index) => (
                    <li key={index} className={`text-sm ${colors.message} flex items-start gap-2`}>
                      <span className="text-[#C49B66] font-bold">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="px-6 pb-6">
            <div className="flex gap-3 justify-end">
              {alert.onCancel && (
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="px-6 py-2 rounded-xl border-2 border-slate-300 text-slate-700 hover:bg-slate-100 transition-all duration-200"
                >
                  {alert.cancelText || 'Cancel'}
                </Button>
              )}
              <Button
                onClick={handleConfirm}
                className={`px-6 py-2 rounded-xl font-semibold transition-all duration-200 ${
                  alert.type === 'success' 
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    : alert.type === 'error'
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : alert.type === 'warning'
                    ? 'bg-amber-500 hover:bg-amber-600 text-white'
                    : 'bg-[#C49B66] hover:bg-[#B8875A] text-white'
                }`}
              >
                {alert.confirmText || 'OK'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Hook for managing alerts
export function useCustomAlert() {
  const [alert, setAlert] = useState<AlertData | null>(null)

  const showAlert = (alertData: AlertData) => {
    setAlert(alertData)
  }

  const hideAlert = () => {
    setAlert(null)
  }

  const showSuccess = (title: string, message: string, details?: string[]) => {
    showAlert({
      type: 'success',
      title,
      message,
      details
    })
  }

  const showError = (title: string, message: string, details?: string[]) => {
    showAlert({
      type: 'error',
      title,
      message,
      details
    })
  }

  const showWarning = (title: string, message: string, details?: string[]) => {
    showAlert({
      type: 'warning',
      title,
      message,
      details
    })
  }

  const showInfo = (title: string, message: string, details?: string[]) => {
    showAlert({
      type: 'info',
      title,
      message,
      details
    })
  }

  return {
    alert,
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    CustomAlert: () => <CustomAlert alert={alert} onClose={hideAlert} />
  }
}
