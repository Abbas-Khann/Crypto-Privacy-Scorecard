'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, X, AlertTriangle } from 'lucide-react'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'warning' | ''
  isVisible: boolean
  onClose: () => void
}

export default function Toast({ message, type, isVisible, onClose }: ToastProps) {
  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          borderColor: '#00FFFF',
          color: '#00FFFF',
          icon: CheckCircle2,
          glow: '0 0 20px rgba(0,255,255,0.3)',
        }
      case 'error':
        return {
          borderColor: '#FF00FF',
          color: '#FF00FF',
          icon: X,
          glow: '0 0 20px rgba(255,0,255,0.3)',
        }
      case 'warning':
        return {
          borderColor: '#FF9900',
          color: '#FF9900',
          icon: AlertTriangle,
          glow: '0 0 20px rgba(255,153,0,0.3)',
        }
      default:
        return {
          borderColor: '#00FFFF',
          color: '#00FFFF',
          icon: CheckCircle2,
          glow: '0 0 20px rgba(0,255,255,0.3)',
        }
    }
  }

  const styles = getStyles()
  const Icon = styles.icon

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -50, x: '-50%' }}
          className="fixed top-6 left-1/2 z-[200] px-6 py-3 bg-black border-2 font-mono text-sm uppercase tracking-wider flex items-center gap-3"
          style={{
            borderColor: styles.borderColor,
            color: styles.color,
            boxShadow: styles.glow,
          }}
        >
          <Icon className="w-4 h-4" />
          <span>{message}</span>
          <button
            onClick={onClose}
            className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Custom hook for toast
export function useToast() {
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error' | 'warning' | ''
    isVisible: boolean
  }>({
    message: '',
    type: '',
    isVisible: false,
  })

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'warning') => {
    setToast({ message, type, isVisible: true })

    // Auto-hide after 3 seconds
    setTimeout(() => {
      setToast((prev) => ({ ...prev, isVisible: false }))
    }, 3000)
  }, [])

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, isVisible: false }))
  }, [])

  return { toast, showToast, hideToast }
}
