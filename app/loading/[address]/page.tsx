'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, useParams } from 'next/navigation'
import { Shield, Search, FileText, AlertCircle, Globe, Zap, CheckCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

// Dynamic messages based on progress
const getLoadingMessage = (progress: number) => {
  if (progress < 25) return '> SCANNING TRANSACTIONS'
  if (progress < 50) return '> ANALYZING PATTERNS'
  if (progress < 75) return '> CHECKING VULNERABILITIES'
  return '> GENERATING REPORT'
}

// Get icon based on progress
const getProgressIcon = (progress: number) => {
  if (progress < 25) return Globe
  if (progress < 50) return Search
  if (progress < 75) return Zap
  if (progress < 100) return FileText
  return CheckCircle
}

export default function LoadingPage() {
  const params = useParams()
  const address = params.address as string
  const router = useRouter()
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [currentMessage, setCurrentMessage] = useState('> SCANNING TRANSACTIONS')
  const prevMessageRef = useRef(currentMessage)

  useEffect(() => {
    let isMounted = true
    let progressInterval: NodeJS.Timeout

    const runAnalysis = async () => {
      try {
        // Start progress animation
        progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 85) return 85 // Cap at 85% until API returns
            return prev + 1.2
          })
        }, 100)

        // Call the API
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: decodeURIComponent(address) }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || errorData.message || 'Failed to analyze wallet')
        }

        const result = await response.json()

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

        // Store result in sessionStorage and navigate
        sessionStorage.setItem('analysisData', JSON.stringify(result))
        router.push(`/results/${encodeURIComponent(address)}`)
      } catch (err: any) {
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
  }, [address, router])

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
      <div className="min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="border-b-2 border-border bg-black/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-magenta" />
                  <div className="w-3 h-3 rounded-full bg-cyan" />
                  <div className="w-3 h-3 rounded-full bg-orange" />
                </div>
                <span className="font-heading font-bold uppercase tracking-wider text-foreground">
                  Privacy Scorecard
                </span>
              </div>
            </div>
          </div>
        </nav>

        {/* Error content */}
        <div className="flex-1 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md"
          >
            <div className="w-24 h-24 mx-auto mb-8 border-2 border-magenta bg-magenta/10 flex items-center justify-center glow-magenta">
              <AlertCircle className="w-12 h-12 text-magenta" />
            </div>
            <h2 className="font-heading font-black text-3xl text-foreground uppercase tracking-tight mb-4">
              Analysis Failed
            </h2>
            <p className="font-mono text-foreground/70 mb-8">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-3 px-6 py-3 border-2 border-cyan text-cyan font-mono uppercase tracking-wider hover:bg-cyan hover:text-black transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Try Again
            </button>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b-2 border-border bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-magenta" />
                <div className="w-3 h-3 rounded-full bg-cyan" />
                <div className="w-3 h-3 rounded-full bg-orange" />
              </div>
              <span className="font-heading font-bold uppercase tracking-wider text-foreground">
                Privacy Scorecard
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="text-center max-w-xl w-full">
          {/* Loading animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mb-12 inline-block"
          >
            <div className="relative w-40 h-40 sm:w-48 sm:h-48">
              {/* Outer rotating square */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 border-2 border-magenta glow-magenta"
              />

              {/* Inner circle */}
              <div className="absolute inset-4 rounded-full border-2 border-cyan glow-cyan" />

              {/* Center icon container */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-foreground bg-black flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentMessage}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                    >
                      <CurrentIcon className="w-8 h-8 sm:w-10 sm:h-10 text-cyan" />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Loading text */}
          <AnimatePresence mode="wait">
            <motion.h2
              key={currentMessage}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="font-heading font-black text-2xl sm:text-3xl text-cyan text-glow-cyan uppercase tracking-tight mb-6"
            >
              {currentMessage}
            </motion.h2>
          </AnimatePresence>

          {/* Wallet address */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-10"
          >
            <p className="font-mono text-sm text-foreground/50 uppercase tracking-widest mb-2">
              {'>'} analyzing_wallet:
            </p>
            <div className="inline-block border border-border bg-card-solid/50 px-4 py-2">
              <p className="font-mono text-sm text-foreground">
                {decodeURIComponent(address).length > 20
                  ? `${decodeURIComponent(address).slice(0, 10)}...${decodeURIComponent(address).slice(-8)}`
                  : decodeURIComponent(address)}
              </p>
            </div>
          </motion.div>

          {/* Progress bar */}
          <div className="max-w-md mx-auto">
            <div className="relative h-4 border-2 border-cyan bg-black overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-magenta to-cyan"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Percentage */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 flex items-center justify-center"
            >
              <div className="inline-flex items-baseline gap-1 border border-border bg-card-solid/50 px-6 py-3">
                <span className="font-heading font-black text-3xl sm:text-4xl text-foreground">
                  {Math.round(Math.min(progress, 100))}
                </span>
                <span className="font-heading text-xl text-foreground/50">%</span>
              </div>
            </motion.div>
          </div>

          {/* Progress steps */}
          <div className="flex justify-center gap-6 sm:gap-8 mt-12">
            {[0, 25, 50, 75].map((threshold, index) => {
              const colors = ['#FF00FF', '#00FFFF', '#FF9900', '#00FFFF']
              const isActive = progress >= threshold
              const isCurrent = progress >= threshold && progress < threshold + 25

              return (
                <motion.div
                  key={index}
                  className="flex flex-col items-center gap-3"
                >
                  <motion.div
                    className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-foreground transition-all"
                    style={{
                      backgroundColor: isActive ? colors[index] : 'transparent',
                      boxShadow: isActive ? `0 0 10px ${colors[index]}` : 'none',
                    }}
                    animate={{
                      scale: isCurrent ? [1, 1.2, 1] : 1,
                    }}
                    transition={{
                      scale: { duration: 0.6, repeat: isCurrent ? Infinity : 0 },
                    }}
                  />
                  <span className="font-mono text-xs text-foreground/50 uppercase tracking-wider">
                    {threshold}%
                  </span>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-magenta/30 py-6 bg-black/30">
        <p className="text-center font-mono text-sm text-magenta uppercase tracking-widest">
          {'>'} Multi-Chain Analysis in Progress
        </p>
      </div>
    </div>
  )
}
