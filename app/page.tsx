'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Shield, AlertCircle, ArrowRight, CheckCircle2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const VITALIK_ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'

// Supported chains
const SUPPORTED_CHAINS = [
  { name: 'Ethereum', color: '#00FFFF' },
  { name: 'Base', color: '#FF00FF' },
  { name: 'Polygon', color: '#FF9900' },
  { name: 'Arbitrum', color: '#00FFFF' },
]

// Address validation
const isValidEthereumAddress = (address: string) => /^0x[a-fA-F0-9]{40}$/.test(address)
const isValidENS = (address: string) => /^[a-zA-Z0-9-]+\.eth$/.test(address)

const detectAddressType = (address: string) => {
  if (isValidEthereumAddress(address)) return { valid: true, type: 'address' }
  if (isValidENS(address)) return { valid: true, type: 'ens' }
  return { valid: false, type: null }
}

export default function HomePage() {
  const [walletAddress, setWalletAddress] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [error, setError] = useState('')
  const [detectedType, setDetectedType] = useState<{ valid: boolean; type: string | null } | null>(null)
  const [toast, setToast] = useState({ show: false, type: '', message: '' })
  const router = useRouter()

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ show: false, type: '', message: '' }), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast.show])

  const showToast = (type: string, message: string) => {
    setToast({ show: true, type, message })
  }

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setWalletAddress(value)
    setError('')

    if (value.length > 0) {
      const detection = detectAddressType(value)
      if (detection.valid) {
        setDetectedType(detection)
        showToast('success', detection.type === 'ens' ? '> VALID ENS NAME' : '> VALID ADDRESS')
      } else if (value.length >= 42 || (value.includes('.') && !value.endsWith('.eth'))) {
        setDetectedType(null)
        showToast('error', '> INVALID FORMAT')
      } else {
        setDetectedType(null)
      }
    } else {
      setDetectedType(null)
      setToast({ show: false, type: '', message: '' })
    }
  }

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedAddress = walletAddress.trim()

    if (!trimmedAddress) {
      setError('> ENTER A WALLET ADDRESS')
      return
    }

    const detection = detectAddressType(trimmedAddress)
    if (!detection.valid) {
      setError('> INVALID FORMAT: USE 0x... OR name.eth')
      return
    }

    router.push(`/loading/${encodeURIComponent(trimmedAddress)}`)
  }

  const handleTryExample = () => {
    setWalletAddress(VITALIK_ADDRESS)
    setError('')
    setDetectedType({ valid: true, type: 'address' })
    showToast('success', '> VALID ADDRESS')
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 border-2 font-mono text-sm uppercase tracking-wider flex items-center gap-3 ${toast.type === 'success'
              ? 'border-cyan bg-black text-cyan glow-cyan'
              : 'border-magenta bg-black text-magenta glow-magenta'
              }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <X className="w-4 h-4" />
            )}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="border-b-2 border-border bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/">
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
            </Link>

            {/* Nav link */}
            <a
              href="https://x.com/khanabbas201"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:block btn-skew"
            >
              <span>X</span>
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16 sm:py-24">
        <div className="max-w-5xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 border-2 border-magenta bg-magenta/10 font-mono text-sm uppercase tracking-widest text-magenta">
                <Shield className="w-4 h-4" />
                Multi-Chain Analysis
              </span>
            </motion.div>

            {/* Heading */}
            <h1 className="font-heading font-black text-5xl sm:text-4xl md:text-5xl lg:text-6xl uppercase tracking-tight leading-none mb-6">
              <span className="block text-glow-white">Crypto</span>
              <span className="block text-glow-white">Privacy</span>
              <span className="block gradient-text drop-shadow-text-magenta">Scorecard</span>
            </h1>

            {/* Subheading */}
            <p className="font-mono text-lg sm:text-xl text-foreground/70 max-w-2xl mx-auto mb-12 leading-relaxed">
              {'>'} Analyze your wallet&apos;s privacy vulnerabilities across multiple chains.
              <span className="text-cyan"> No data stored.</span>
            </p>

            {/* Input Form */}
            <form onSubmit={handleAnalyze} className="max-w-2xl mx-auto space-y-6">
              {/* Terminal-style input */}
              <div className="terminal-window">
                <div className="terminal-titlebar">
                  <div className="terminal-dot bg-magenta" />
                  <div className="terminal-dot bg-cyan" />
                  <div className="terminal-dot bg-orange" />
                  <span className="ml-3 font-mono text-xs text-foreground/50 uppercase tracking-wider">
                    wallet_analyzer.exe
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-magenta font-mono">{'>'}</span>
                    <input
                      type="text"
                      value={walletAddress}
                      onChange={handleAddressChange}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      placeholder="0x... or name.eth"
                      className={`flex-1 bg-transparent font-mono text-lg text-cyan placeholder:text-foreground/30 outline-none ${isFocused ? 'caret-cyan' : ''
                        }`}
                    />
                    {detectedType?.valid && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-6 h-6 bg-cyan flex items-center justify-center"
                      >
                        <CheckCircle2 className="w-4 h-4 text-black" />
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center justify-center gap-2 text-magenta font-mono text-sm"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-magenta text-white font-heading font-bold text-xl uppercase tracking-wider border-2 border-magenta hover:shadow-neon-magenta-lg transition-all duration-200 flex items-center justify-center gap-3"
              >
                <span>Analyze Wallet</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </form>

            {/* Try Example */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8"
            >
              <button
                onClick={handleTryExample}
                type="button"
                className="font-mono text-sm text-foreground/50 hover:text-cyan transition-colors underline underline-offset-4"
              >
                {'>'} try_example(vitalik.eth)
              </button>
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* Supported Chains */}
      <section className="border-t-2 border-magenta/30 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-mono text-sm uppercase tracking-widest text-foreground/50 mb-8">
            {'>'} SUPPORTED_CHAINS:
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {SUPPORTED_CHAINS.map((chain, index) => (
              <motion.div
                key={chain.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-center gap-2 px-4 py-2 border border-border bg-card-solid/50 font-mono text-sm"
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: chain.color, boxShadow: `0 0 10px ${chain.color}` }}
                />
                <span className="uppercase tracking-wider text-foreground/70">{chain.name}</span>
              </motion.div>
            ))}
          </div>
          <p className="mt-6 text-center font-mono text-sm text-foreground/40">
            {'>'} supports ENS: <span className="text-cyan">vitalik.eth</span>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-cyan animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-widest text-cyan">
              Privacy First
            </span>
          </div>
          <p className="font-mono text-sm text-foreground/50">
            {'>'} Your privacy matters. <span className="text-foreground">No data is stored.</span>
          </p>
        </div>
      </footer>
    </div>
  )
}
