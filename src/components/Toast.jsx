import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, X, AlertCircle, Info } from 'lucide-react'

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
}

const colors = {
  success: {
    bg: 'bg-green-500/20',
    border: 'border-green-500/50',
    text: 'text-green-400',
    icon: 'text-green-400',
  },
  error: {
    bg: 'bg-red-500/20',
    border: 'border-red-500/50',
    text: 'text-red-400',
    icon: 'text-red-400',
  },
  info: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/50',
    text: 'text-blue-400',
    icon: 'text-blue-400',
  },
}

export default function Toast({ message, type = 'success', isVisible, onClose }) {
  const Icon = icons[type]
  const colorClasses = colors[type]

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div
            className={`flex items-center gap-3 px-5 py-4 rounded-xl border ${colorClasses.bg} ${colorClasses.border} shadow-lg backdrop-blur-sm`}
          >
            <Icon className={`w-5 h-5 ${colorClasses.icon}`} />
            <p className={`font-medium ${colorClasses.text}`}>{message}</p>
            <button
              onClick={onClose}
              className="ml-2 p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Hook for using toast
import { useState, useCallback } from 'react'

export function useToast() {
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' })

  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    setToast({ isVisible: true, message, type })
    setTimeout(() => {
      setToast((prev) => ({ ...prev, isVisible: false }))
    }, duration)
  }, [])

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, isVisible: false }))
  }, [])

  return { toast, showToast, hideToast }
}
