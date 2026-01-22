import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Shield, Sparkles, AlertCircle, ArrowRight, CheckCircle2, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const VITALIK_ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'

// Supported chains with icons (fixed Ethereum to be visible on dark bg)
const SUPPORTED_CHAINS = [
  { name: 'Ethereum', icon: '◆', color: 'text-blue-400' },
  { name: 'Base', icon: '🔵', color: '' },
  { name: 'Polygon', icon: '💜', color: '' },
  { name: 'Arbitrum', icon: '🔷', color: '' },
]

// Address validation functions
const isValidEthereumAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

const isValidENS = (address) => {
  return /^[a-zA-Z0-9-]+\.eth$/.test(address)
}

const detectAddressType = (address) => {
  if (isValidEthereumAddress(address)) {
    return { valid: true, type: 'address', icon: '⟠' }
  }
  if (isValidENS(address)) {
    return { valid: true, type: 'ens', icon: '🔗' }
  }
  return { valid: false, type: null, icon: null }
}

// Animation variants for staggered fade-in
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
}

export default function LandingPage() {
  const [walletAddress, setWalletAddress] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [error, setError] = useState('')
  const [detectedType, setDetectedType] = useState(null)
  const [toast, setToast] = useState({ show: false, type: '', message: '' })
  const navigate = useNavigate()

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, type: '', message: '' })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [toast.show])

  const showToast = (type, message) => {
    setToast({ show: true, type, message })
  }

  const handleAddressChange = (e) => {
    const value = e.target.value
    setWalletAddress(value)
    setError('')

    if (value.length > 0) {
      const detection = detectAddressType(value)
      if (detection.valid) {
        setDetectedType(detection)
        // Show success toast when valid address detected
        showToast('success', detection.type === 'ens' ? '✓ Valid ENS name detected' : '✓ Valid address detected')
      } else if (value.length >= 42 || (value.includes('.') && !value.endsWith('.eth'))) {
        setDetectedType(null)
        // Show error toast for invalid format
        showToast('error', '✗ Invalid address format')
      } else {
        setDetectedType(null)
      }
    } else {
      setDetectedType(null)
      setToast({ show: false, type: '', message: '' })
    }
  }

  const handleAnalyze = (e) => {
    e.preventDefault()
    const trimmedAddress = walletAddress.trim()

    if (!trimmedAddress) {
      setError('Please enter a wallet address')
      return
    }

    const detection = detectAddressType(trimmedAddress)
    if (!detection.valid) {
      setError('Invalid format. Enter an address (0x...) or ENS name (name.eth)')
      return
    }

    navigate(`/loading/${encodeURIComponent(trimmedAddress)}`)
  }

  const handleTryExample = () => {
    setWalletAddress(VITALIK_ADDRESS)
    setError('')
    setDetectedType({ valid: true, type: 'address', icon: '⟠' })
    showToast('success', '✓ Valid address detected')
  }

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center py-12 sm:py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className={`fixed top-6 left-1/2 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 ${
              toast.type === 'success'
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
            <span className="font-medium text-base">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Enhanced background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent-blue/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Center radial gradient for depth */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full"
          style={{
            background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.06) 0%, transparent 60%)',
          }}
        />

        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Main content with staggered animations */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-2xl w-full text-center"
      >
        {/* Shield icon with enhanced glow and pulse */}
        <motion.div variants={itemVariants} className="mb-12 sm:mb-16 inline-block">
          <div className="relative">
            {/* Outer pulsing glow */}
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute inset-0 bg-accent-blue/40 rounded-3xl blur-2xl"
            />
            {/* Inner glow */}
            <motion.div
              animate={{
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute inset-2 bg-accent-blue/20 rounded-2xl blur-xl"
            />
            {/* Icon container with pulse scale */}
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative w-24 h-24 sm:w-28 sm:h-28 bg-dark-card rounded-3xl flex items-center justify-center border border-gray-700/50 shadow-2xl shadow-accent-blue/25"
            >
              <Shield className="w-12 h-12 sm:w-14 sm:h-14 text-accent-blue" />
            </motion.div>
          </div>
        </motion.div>

        {/* Heading with better typography */}
        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-dark-text mb-8 sm:mb-10 tracking-tight leading-[1.1]"
        >
          Crypto Privacy
          <br />
          <span className="bg-gradient-to-r from-accent-blue to-purple-400 bg-clip-text text-transparent">
            Scorecard
          </span>
        </motion.h1>

        {/* Subheading with better spacing - properly centered */}
        <motion.p
          variants={itemVariants}
          className="text-lg sm:text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed tracking-wide text-center"
        >
          Analyze your wallet's privacy vulnerabilities across multiple chains in seconds
        </motion.p>

        {/* Input form with enhanced styling */}
        <motion.form
          variants={itemVariants}
          onSubmit={handleAnalyze}
          className="mt-16 sm:mt-24 space-y-8"
        >
          {/* Input container - FIXED: removed overflow-hidden */}
          <div className="relative">
            {/* Outer glow on focus - increased intensity */}
            <motion.div
              animate={{
                opacity: isFocused ? 0.5 : 0,
                scale: isFocused ? 1 : 0.95,
              }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="absolute -inset-3 bg-gradient-to-r from-accent-blue via-purple-500 to-accent-blue rounded-3xl blur-xl"
            />

            {/* Inner glow ring */}
            <motion.div
              animate={{
                opacity: isFocused ? 1 : 0,
              }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="absolute -inset-[2px] bg-gradient-to-r from-accent-blue to-purple-500 rounded-2xl"
            />

            {/* Input container - BIGGER input (4rem+ height) */}
            <div
              className={`relative flex items-center bg-dark-card rounded-2xl border-2 transition-all duration-300 ${
                error
                  ? 'border-red-500/50'
                  : isFocused
                    ? 'border-transparent'
                    : 'border-gray-700/60 hover:border-gray-600/70'
              }`}
            >
              <div className="pl-6 sm:pl-8 text-gray-500">
                <Search className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <input
                type="text"
                value={walletAddress}
                onChange={handleAddressChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Enter address or ENS name..."
                className="w-full px-5 sm:px-6 py-7 sm:py-8 bg-transparent text-dark-text placeholder-gray-500 outline-none text-xl sm:text-2xl font-mono tracking-wide"
              />
            </div>
          </div>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-center gap-2 text-red-400"
              >
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-medium tracking-wide">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Analyze button - proportional to larger input */}
          <motion.button
            type="submit"
            whileHover={{
              scale: 1.03,
              boxShadow: '0 30px 60px -15px rgba(59, 130, 246, 0.5)',
            }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-7 sm:py-8 bg-gradient-to-r from-accent-blue to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white font-bold text-xl sm:text-2xl rounded-2xl transition-all duration-300 flex items-center justify-center gap-4 shadow-2xl shadow-accent-blue/40 tracking-wide group"
          >
            <Sparkles className="w-7 h-7 sm:w-8 sm:h-8" />
            <span>Analyze Wallet</span>
            <ArrowRight className="w-6 h-6 sm:w-7 sm:h-7 group-hover:translate-x-1.5 transition-transform" />
          </motion.button>
        </motion.form>

        {/* Try example link - more prominent */}
        <motion.div variants={itemVariants} className="mt-12 sm:mt-14">
          <button
            onClick={handleTryExample}
            type="button"
            className="group relative text-base sm:text-lg text-blue-400 hover:text-blue-300 transition-colors duration-300 font-semibold tracking-wide"
          >
            <span>Try with Vitalik's wallet</span>
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300 ease-out" />
          </button>
        </motion.div>

        {/* Supported chains with larger badges and more spacing */}
        <motion.div
          variants={itemVariants}
          className="mt-16 sm:mt-20"
        >
          <p className="text-sm text-gray-400 mb-6 tracking-widest uppercase font-medium">
            Analyzes across
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5">
            {SUPPORTED_CHAINS.map((chain, index) => (
              <motion.div
                key={chain.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="flex items-center gap-3 px-6 py-3 bg-dark-card/70 border border-gray-700/60 rounded-full hover:border-gray-600 hover:bg-dark-card transition-all duration-200"
              >
                <span className={`text-xl ${chain.color}`}>{chain.icon}</span>
                <span className="text-sm sm:text-base text-gray-200 font-medium">{chain.name}</span>
              </motion.div>
            ))}
          </div>
          <p className="mt-8 text-sm text-gray-500 tracking-wide">
            Supports ENS names like <span className="text-gray-300 font-mono">vitalik.eth</span>
          </p>
        </motion.div>
      </motion.div>

      {/* Footer - Privacy Promise */}
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="fixed bottom-0 left-0 right-0 pb-6 sm:pb-8 pt-8 text-center px-4 bg-gradient-to-t from-dark-bg via-dark-bg/95 to-transparent"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-green-400 text-sm font-medium tracking-wide uppercase">Privacy First</span>
        </div>
        <p className="text-gray-400 text-base sm:text-lg font-medium">
          Your privacy matters. <span className="text-gray-300">No data is stored.</span>
        </p>
      </motion.footer>
    </div>
  )
}
