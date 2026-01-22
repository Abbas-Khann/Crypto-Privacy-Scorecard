import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { Shield, Search, FileText, AlertCircle, Globe, Zap, CheckCircle } from 'lucide-react'
import { analyzeWallet } from '../utils/api'

// Dynamic messages based on progress percentage
const getLoadingMessage = (progress) => {
  if (progress < 25) return 'Scanning transactions...'
  if (progress < 50) return 'Analyzing privacy patterns...'
  if (progress < 75) return 'Checking vulnerabilities...'
  return 'Generating your report...'
}

// Get icon based on progress
const getProgressIcon = (progress) => {
  if (progress < 25) return Globe
  if (progress < 50) return Search
  if (progress < 75) return Zap
  if (progress < 100) return FileText
  return CheckCircle
}

// Animated counter component
function AnimatedCounter({ value }) {
  const spring = useSpring(0, { stiffness: 100, damping: 30 })
  const display = useTransform(spring, (current) => Math.round(current))
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  useEffect(() => {
    const unsubscribe = display.on('change', (latest) => {
      setDisplayValue(latest)
    })
    return () => unsubscribe()
  }, [display])

  return <span>{displayValue}</span>
}

export default function LoadingPage() {
  const { address } = useParams()
  const navigate = useNavigate()
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const [currentMessage, setCurrentMessage] = useState('Scanning transactions...')
  const prevMessageRef = useRef(currentMessage)

  useEffect(() => {
    let isMounted = true
    let progressInterval

    const runAnalysis = async () => {
      try {
        // Start progress animation
        progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 85) return 85 // Cap at 85% until API returns
            return prev + 1.2
          })
        }, 100)

        // Call the API (no chain param - analyzes all chains)
        const result = await analyzeWallet(address)

        if (!isMounted) return

        // Smooth completion
        setProgress(92)
        await new Promise((r) => setTimeout(r, 300))

        if (!isMounted) return

        setProgress(96)
        await new Promise((r) => setTimeout(r, 300))

        if (!isMounted) return

        // Complete
        setProgress(100)
        await new Promise((r) => setTimeout(r, 400))

        // Navigate to results with data
        navigate(`/results/${address}`, {
          replace: true,
          state: { analysisData: result },
        })
      } catch (err) {
        if (!isMounted) return
        console.error('Analysis error:', err)
        setError(err.message || 'Failed to analyze wallet')
        clearInterval(progressInterval)
      }
    }

    runAnalysis()

    return () => {
      isMounted = false
      if (progressInterval) clearInterval(progressInterval)
    }
  }, [address, navigate])

  // Update message based on progress
  useEffect(() => {
    const newMessage = getLoadingMessage(progress)
    if (newMessage !== prevMessageRef.current) {
      prevMessageRef.current = newMessage
      setCurrentMessage(newMessage)
    }
  }, [progress])

  const CurrentIcon = getProgressIcon(progress)

  if (error) {
    return (
      <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-dark-text mb-4">Analysis Failed</h2>
          <p className="text-gray-400 mb-8">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-accent-blue hover:bg-accent-blue-hover text-white rounded-xl font-medium transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center px-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/3 left-1/3 w-96 h-96 bg-accent-blue/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
          className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 text-center">
        {/* Animated icon with enhanced effects */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mb-10 inline-block"
        >
          <div className="relative">
            {/* Outer pulsing glow */}
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute inset-0 bg-accent-blue/30 rounded-full blur-2xl"
            />

            {/* Spinning ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-36 h-36 rounded-full border-4 border-dark-card border-t-accent-blue border-r-accent-blue/50"
            />

            {/* Inner glow ring */}
            <motion.div
              animate={{
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute inset-2 rounded-full bg-accent-blue/10"
            />

            {/* Center icon with pulse */}
            <div className="absolute inset-0 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentMessage}
                  initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                  animate={{
                    opacity: 1,
                    scale: [1, 1.1, 1],
                    rotate: 0,
                  }}
                  exit={{ opacity: 0, scale: 0.5, rotate: 10 }}
                  transition={{
                    duration: 0.4,
                    scale: {
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }
                  }}
                >
                  <CurrentIcon className="w-14 h-14 text-accent-blue drop-shadow-lg" />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Loading text with smooth transitions */}
        <AnimatePresence mode="wait">
          <motion.p
            key={currentMessage}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="text-2xl sm:text-3xl font-semibold text-dark-text mb-5"
          >
            {currentMessage}
          </motion.p>
        </AnimatePresence>

        {/* Wallet address - more prominent */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-10"
        >
          <p className="text-gray-400 text-sm mb-1">Analyzing wallet</p>
          <p className="text-gray-300 font-mono text-base sm:text-lg bg-dark-card/50 px-4 py-2 rounded-xl inline-block border border-gray-700/50">
            {address?.length > 20
              ? `${address.slice(0, 10)}...${address.slice(-8)}`
              : address}
          </p>
        </motion.div>

        {/* Progress bar - enhanced with glow */}
        <div className="w-96 max-w-full mx-auto">
          <div className="relative">
            {/* Glow effect behind progress bar */}
            <motion.div
              className="absolute -inset-1 bg-gradient-to-r from-accent-blue to-purple-500 rounded-full blur-md opacity-40"
              style={{ width: `${Math.max(progress, 5)}%` }}
              animate={{ opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />

            {/* Progress bar container */}
            <div className="relative h-3 bg-dark-card rounded-full overflow-hidden border border-gray-700/50">
              <motion.div
                className="h-full bg-gradient-to-r from-accent-blue via-blue-400 to-purple-500 rounded-full relative"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
              </motion.div>
            </div>
          </div>

          {/* Animated percentage */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 flex items-center justify-center gap-1"
          >
            <span className="text-2xl sm:text-3xl font-bold text-dark-text">
              <AnimatedCounter value={Math.min(progress, 100)} />
            </span>
            <span className="text-xl sm:text-2xl font-bold text-gray-500">%</span>
          </motion.div>
        </div>

        {/* Progress steps indicator */}
        <div className="flex justify-center gap-4 mt-10">
          {[0, 25, 50, 75].map((threshold, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center gap-2"
            >
              <motion.div
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  progress >= threshold ? 'bg-accent-blue' : 'bg-dark-card border border-gray-700'
                }`}
                animate={{
                  scale: progress >= threshold && progress < threshold + 25 ? [1, 1.3, 1] : 1,
                  boxShadow: progress >= threshold
                    ? '0 0 10px rgba(59, 130, 246, 0.5)'
                    : '0 0 0px rgba(59, 130, 246, 0)',
                }}
                transition={{
                  scale: { duration: 0.6, repeat: progress >= threshold && progress < threshold + 25 ? Infinity : 0 },
                  boxShadow: { duration: 0.3 },
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
