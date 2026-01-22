'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Plus,
  Share2,
  Check,
  User,
  Users,
  Trophy,
  ChevronDown,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import ScoreCircle from '@/components/ScoreCircle'
import Toast, { useToast } from '@/components/Toast'
import Link from 'next/link'

// Types
interface Issue {
  detected: boolean
  severity: 'critical' | 'warning' | 'good'
  points: number
  title: string
  description: string
  whyMatters?: string | null
  howToFix?: string[] | null
}

interface AnalysisData {
  score: number
  grade: string
  issues: Issue[]
  stats: {
    totalTransactions: number
    tokenTransfers: number
    uniqueAddresses: number
    chainsWithActivity?: string[]
    chainBreakdown?: Record<string, { transactions: number; tokenTransfers: number }>
  }
  address: string
  ensName?: string | null
}

// Utility functions
const truncateAddress = (address: string) => {
  if (!address) return ''
  if (address.length <= 15) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Tab configuration
const TABS = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'issues', label: 'ISSUES', showCount: true },
  { id: 'compare', label: 'COMPARE' },
  { id: 'activity', label: 'ACTIVITY' },
]

// Severity configuration
const severityConfig = {
  critical: {
    color: '#FF00FF',
    label: 'CRITICAL',
    Icon: XCircle,
  },
  warning: {
    color: '#FF9900',
    label: 'WARNING',
    Icon: AlertTriangle,
  },
  good: {
    color: '#00FFFF',
    label: 'GOOD',
    Icon: CheckCircle,
  },
}

// Issue Card Component
function IssueCard({
  issue,
  isExpanded,
  onToggle,
}: {
  issue: Issue
  isExpanded: boolean
  onToggle: () => void
}) {
  const config = severityConfig[issue.severity]
  const hasDetails = issue.whyMatters || issue.howToFix
  const Icon = config.Icon

  return (
    <div
      className="border border-border bg-card-solid/80 backdrop-blur overflow-hidden"
      style={{ borderLeftWidth: '4px', borderLeftColor: config.color }}
    >
      <button
        onClick={() => hasDetails && onToggle()}
        className={`w-full p-4 flex items-start justify-between text-left ${hasDetails ? 'cursor-pointer hover:bg-white/5' : 'cursor-default'
          } transition-colors`}
      >
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div
            className="w-10 h-10 border-2 flex items-center justify-center shrink-0"
            style={{ borderColor: config.color, backgroundColor: `${config.color}20` }}
          >
            <Icon className="w-5 h-5" style={{ color: config.color }} />
          </div>

          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-heading font-semibold text-foreground uppercase tracking-wide">
                {issue.title}
              </h3>
              <span
                className="font-mono text-xs px-2 py-1 border uppercase tracking-wider"
                style={{
                  borderColor: config.color,
                  color: config.color,
                  backgroundColor: `${config.color}10`,
                }}
              >
                {config.label}
              </span>
            </div>
            <p className="font-mono text-sm text-foreground/60">{issue.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 ml-4">
          <span className="font-heading font-bold" style={{ color: config.color }}>
            {issue.points > 0 ? `+${issue.points}` : issue.points} pts
          </span>
          {hasDetails && (
            <div
              className={`w-6 h-6 border border-border flex items-center justify-center transition-transform ${isExpanded ? 'rotate-180' : ''
                }`}
            >
              <ChevronDown className="w-4 h-4 text-foreground/60" />
            </div>
          )}
        </div>
      </button>

      {isExpanded && hasDetails && (
        <div className="p-4 border-t border-border bg-black/30">
          {issue.whyMatters && (
            <div className="mb-4">
              <h4 className="font-mono text-xs text-magenta uppercase tracking-widest mb-2">
                {'>'} WHY_IT_MATTERS:
              </h4>
              <p className="font-mono text-sm text-foreground/70">{issue.whyMatters}</p>
            </div>
          )}

          {issue.howToFix && issue.howToFix.length > 0 && (
            <div>
              <h4 className="font-mono text-xs text-cyan uppercase tracking-widest mb-2">
                {'>'} HOW_TO_FIX:
              </h4>
              <ul className="space-y-2">
                {issue.howToFix.map((fix, index) => (
                  <li key={index} className="font-mono text-sm text-foreground/70 flex items-start gap-2">
                    <span className="text-cyan">-</span>
                    <span>{fix}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Comparison data
const comparisons = [
  { label: 'YOUR SCORE', color: '#FF00FF', isUser: true, icon: User },
  { label: 'AVERAGE USER', score: 38, color: '#FF9900', isUser: false, icon: Users },
  { label: 'PRIVACY PRO', score: 95, color: '#00FFFF', isUser: false, icon: Trophy },
]

export default function ResultsPage() {
  const params = useParams()
  const address = params.address as string
  const router = useRouter()
  const { toast, showToast, hideToast } = useToast()
  const [copied, setCopied] = useState(false)
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [expandedIssue, setExpandedIssue] = useState<number | null>(null)

  useEffect(() => {
    // Get data from sessionStorage
    const stored = sessionStorage.getItem('analysisData')
    if (stored) {
      setAnalysisData(JSON.parse(stored))
    } else {
      // Redirect to loading page if no data
      router.push(`/loading/${address}`)
    }
  }, [address, router])

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Crypto Privacy Scorecard',
          text: `My wallet privacy score: ${analysisData?.score || 0}/100`,
          url: url,
        })
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          copyToClipboard(url)
        }
      }
    } else {
      copyToClipboard(url)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    showToast('> LINK COPIED!', 'success')
    setTimeout(() => setCopied(false), 2000)
  }

  if (!analysisData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-2 border-cyan animate-pulse" />
      </div>
    )
  }

  const { score, issues, stats, ensName } = analysisData
  const issuesCount = issues.filter((i) => i.severity !== 'good').length
  const displayAddress = ensName || decodeURIComponent(address)

  // Group issues
  const warnings = issues.filter((i) => i.severity === 'critical' || i.severity === 'warning')
  const goodPractices = issues.filter((i) => i.severity === 'good')

  // Calculate percentile
  const percentile = Math.round((score / 100) * 100 * 0.56 + 20)

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b-2 border-border bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-magenta" />
                  <div className="w-3 h-3 rounded-full bg-cyan" />
                  <div className="w-3 h-3 rounded-full bg-orange" />
                </div>
                <span className="font-heading font-bold uppercase tracking-wider text-foreground hidden sm:inline">
                  Privacy Scorecard
                </span>
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 px-3 py-2 border border-border font-mono text-sm uppercase tracking-wider hover:border-cyan hover:text-cyan transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-3 py-2 border border-border font-mono text-sm uppercase tracking-wider hover:border-cyan hover:text-cyan transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                <span className="hidden sm:inline">Share</span>
              </button>

              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 px-3 py-2 bg-magenta text-white border-2 border-magenta font-mono text-sm uppercase tracking-wider hover:shadow-neon-magenta transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>New</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Score Display */}
          <section className="flex flex-col items-center mb-8">
            <div className="mb-6">
              <ScoreCircle score={score} size={180} />
            </div>

            {/* Grade Badge */}
            <div
              className="px-6 py-2 font-heading font-black text-lg uppercase tracking-wider border-2"
              style={{
                borderColor: score >= 70 ? '#00FFFF' : score >= 50 ? '#FF9900' : '#FF00FF',
                color: score >= 70 ? '#00FFFF' : score >= 50 ? '#FF9900' : '#FF00FF',
                boxShadow: `0 0 20px ${score >= 70 ? 'rgba(0,255,255,0.3)' : score >= 50 ? 'rgba(255,153,0,0.3)' : 'rgba(255,0,255,0.3)'}`,
              }}
            >
              {score >= 90 ? 'EXCELLENT' : score >= 70 ? 'GOOD' : score >= 50 ? 'FAIR' : score >= 30 ? 'POOR' : 'CRITICAL'}
            </div>
          </section>

          {/* Tab Navigation */}
          <nav className="mb-6">
            <div className="flex border-2 border-border bg-black/50">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-4 py-3 font-mono text-sm uppercase tracking-wider transition-all border-r border-border last:border-r-0 ${activeTab === tab.id
                    ? 'bg-cyan text-black'
                    : 'text-foreground/60 hover:text-cyan hover:bg-cyan/10'
                    }`}
                >
                  {tab.label}
                  {tab.showCount && issuesCount > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 text-xs bg-magenta text-white">
                      {issuesCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </nav>

          {/* Tab Content */}
          <div className="w-full">
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Wallet Address */}
                <div className="text-center">
                  <p className="font-mono text-xs text-foreground/50 uppercase tracking-widest mb-2">
                    {'>'} wallet_address:
                  </p>
                  <div className="inline-block border border-border bg-card-solid/50 px-4 py-3">
                    <p className="font-mono text-foreground">{truncateAddress(displayAddress)}</p>
                  </div>
                </div>

                {/* Stats Grid */}
                {stats && stats.totalTransactions > 0 && (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { value: stats.totalTransactions, label: 'TRANSACTIONS', color: '#FF00FF' },
                      { value: stats.uniqueAddresses || 0, label: 'ADDRESSES', color: '#00FFFF' },
                      { value: stats.tokenTransfers || 0, label: 'TOKENS', color: '#FF9900' },
                      { value: stats.chainsWithActivity?.length || 1, label: 'CHAINS', color: '#00FFFF' },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="border border-border bg-card-solid/50 p-4 text-center"
                      >
                        <div
                          className="w-3 h-3 mx-auto mb-2 rounded-full"
                          style={{ backgroundColor: stat.color, boxShadow: `0 0 10px ${stat.color}` }}
                        />
                        <p className="font-heading font-black text-3xl text-foreground">{stat.value}</p>
                        <p className="font-mono text-xs text-foreground/50 mt-1 uppercase tracking-widest">
                          {stat.label}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Chain Activity */}
                {stats?.chainBreakdown && (
                  <div className="border border-border bg-card-solid/50 p-4">
                    <h3 className="font-mono text-xs text-foreground/50 uppercase tracking-widest mb-4 text-center">
                      {'>'} chain_activity:
                    </h3>
                    <div className="flex flex-wrap justify-center gap-3">
                      {[
                        { id: 'ethereum', name: 'Ethereum', color: '#00FFFF' },
                        { id: 'base', name: 'Base', color: '#FF00FF' },
                        { id: 'polygon', name: 'Polygon', color: '#FF9900' },
                        { id: 'arbitrum', name: 'Arbitrum', color: '#00FFFF' },
                      ].map((chain) => {
                        const chainData = stats.chainBreakdown?.[chain.id] || { transactions: 0 }
                        const hasActivity = chainData.transactions > 0
                        return (
                          <div
                            key={chain.id}
                            className={`flex items-center gap-2 px-3 py-2 border font-mono text-sm ${hasActivity
                              ? 'border-border bg-card-solid/50'
                              : 'border-border/50 bg-transparent opacity-50'
                              }`}
                          >
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor: hasActivity ? chain.color : '#333',
                                boxShadow: hasActivity ? `0 0 8px ${chain.color}` : 'none',
                              }}
                            />
                            <span className="uppercase tracking-wider text-foreground/70">
                              {chain.name}
                            </span>
                            <span className="text-foreground/40">({chainData.transactions})</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Quick Summary */}
                <div
                  className="border p-4 text-center"
                  style={{
                    borderColor: issuesCount > 0 ? '#FF00FF' : '#00FFFF',
                    backgroundColor: issuesCount > 0 ? 'rgba(255,0,255,0.1)' : 'rgba(0,255,255,0.1)',
                  }}
                >
                  <p className="font-mono text-foreground">
                    {issuesCount > 0 ? (
                      <>
                        {'>'} Found <span className="text-magenta font-bold">{issuesCount} issue{issuesCount !== 1 ? 's' : ''}</span> affecting your privacy.{' '}
                        <button
                          onClick={() => setActiveTab('issues')}
                          className="text-cyan underline underline-offset-4 hover:no-underline"
                        >
                          View details
                        </button>
                      </>
                    ) : (
                      <>
                        {'>'} <span className="text-cyan font-bold">Excellent!</span> No privacy issues detected.
                      </>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* ISSUES TAB */}
            {activeTab === 'issues' && (
              <div className="space-y-4">
                {warnings.length > 0 && (
                  <div className="space-y-3">
                    {warnings.map((issue, index) => (
                      <IssueCard
                        key={index}
                        issue={issue}
                        isExpanded={expandedIssue === index}
                        onToggle={() => setExpandedIssue(expandedIssue === index ? null : index)}
                      />
                    ))}
                  </div>
                )}

                {warnings.length > 0 && goodPractices.length > 0 && (
                  <div className="my-6 h-px bg-border" />
                )}

                {goodPractices.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-mono text-xs text-cyan uppercase tracking-widest mb-3">
                      {'>'} good_practices:
                    </h3>
                    {goodPractices.map((issue, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-4 border border-border bg-card-solid/50"
                        style={{ borderLeftWidth: '4px', borderLeftColor: '#00FFFF' }}
                      >
                        <CheckCircle className="w-5 h-5 text-cyan shrink-0" />
                        <p className="font-mono text-sm text-foreground flex-1">{issue.title}</p>
                        <span className="font-heading font-bold text-cyan text-sm">
                          +{issue.points} pts
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {issues.length === 0 && (
                  <div className="text-center py-12 border border-border bg-card-solid/50">
                    <CheckCircle className="w-16 h-16 mx-auto mb-4 text-cyan" />
                    <h3 className="font-heading font-black text-xl text-foreground uppercase tracking-tight mb-2">
                      Perfect Privacy!
                    </h3>
                    <p className="font-mono text-foreground/60">No issues detected.</p>
                  </div>
                )}
              </div>
            )}

            {/* COMPARE TAB */}
            {activeTab === 'compare' && (
              <div className="border border-border bg-card-solid/50 p-6">
                <h3 className="font-heading font-black text-xl text-foreground uppercase tracking-tight mb-6 text-center">
                  How You Compare
                </h3>

                <div className="space-y-5">
                  {comparisons.map((item) => {
                    const Icon = item.icon
                    const itemScore = item.isUser ? score : item.score
                    return (
                      <div key={item.label}>
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className="w-8 h-8 border flex items-center justify-center shrink-0"
                            style={{ borderColor: item.color, backgroundColor: `${item.color}20` }}
                          >
                            <Icon className="w-4 h-4" style={{ color: item.color }} />
                          </div>
                          <span className="flex-1 font-mono text-sm uppercase tracking-wider text-foreground/70">
                            {item.label}
                          </span>
                          <span className="font-heading font-bold text-lg" style={{ color: item.color }}>
                            {itemScore}/100
                          </span>
                        </div>
                        <div className="h-3 border border-border bg-black overflow-hidden">
                          <motion.div
                            className="h-full"
                            style={{ backgroundColor: item.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${itemScore}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Percentile */}
                <div className="mt-8 pt-6 border-t border-border text-center">
                  <div
                    className="inline-block px-6 py-3 border-2 border-cyan"
                    style={{ boxShadow: '0 0 20px rgba(0,255,255,0.2)' }}
                  >
                    <p className="font-heading font-black text-2xl text-cyan uppercase tracking-tight">
                      Better than {percentile}%
                    </p>
                  </div>
                  <p className="font-mono text-sm text-foreground/50 mt-3 uppercase tracking-widest">
                    of all analyzed wallets
                  </p>
                </div>
              </div>
            )}

            {/* ACTIVITY TAB */}
            {activeTab === 'activity' && (
              <div className="space-y-6">
                {/* Chain Breakdown */}
                <div className="border border-border bg-card-solid/50 p-6">
                  <h3 className="font-heading font-bold text-lg text-foreground uppercase tracking-tight mb-6 text-center">
                    Chain Breakdown
                  </h3>
                  <div className="space-y-4">
                    {[
                      { id: 'ethereum', name: 'Ethereum', color: '#00FFFF' },
                      { id: 'base', name: 'Base', color: '#FF00FF' },
                      { id: 'polygon', name: 'Polygon', color: '#FF9900' },
                      { id: 'arbitrum', name: 'Arbitrum', color: '#00FFFF' },
                    ].map((chain) => {
                      const chainData = stats?.chainBreakdown?.[chain.id] || { transactions: 0 }
                      const total = stats?.totalTransactions || 1
                      const percentage = total > 0 ? Math.round((chainData.transactions / total) * 100) : 0
                      return (
                        <div key={chain.id}>
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: chain.color }}
                            />
                            <span className="flex-1 font-mono text-sm uppercase tracking-wider text-foreground/70">
                              {chain.name}
                            </span>
                            <span className="font-heading font-bold text-foreground">
                              {chainData.transactions}
                            </span>
                            <span className="font-mono text-sm text-foreground/50 w-14 text-right">
                              ({percentage}%)
                            </span>
                          </div>
                          <div className="h-2 border border-border bg-black overflow-hidden">
                            <motion.div
                              className="h-full"
                              style={{ backgroundColor: chain.color }}
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Activity Stats */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: stats?.totalTransactions || 0, label: 'TOTAL TXS', color: '#FF00FF' },
                    { value: stats?.tokenTransfers || 0, label: 'TOKENS', color: '#00FFFF' },
                    { value: stats?.uniqueAddresses || 0, label: 'ADDRESSES', color: '#FF9900' },
                    { value: stats?.chainsWithActivity?.length || 0, label: 'CHAINS', color: '#00FFFF' },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="border border-border bg-card-solid/50 p-4 text-center"
                    >
                      <div
                        className="w-3 h-3 mx-auto mb-2 rounded-full"
                        style={{ backgroundColor: stat.color, boxShadow: `0 0 10px ${stat.color}` }}
                      />
                      <p className="font-heading font-black text-3xl text-foreground">{stat.value}</p>
                      <p className="font-mono text-xs text-foreground/50 mt-1 uppercase tracking-widest">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div
                  className="border border-cyan p-4 text-center"
                  style={{ backgroundColor: 'rgba(0,255,255,0.1)' }}
                >
                  <p className="font-mono text-foreground">
                    {'>'} Analyzed across{' '}
                    <span className="text-cyan font-bold">{stats?.chainsWithActivity?.length || 4} chains</span>
                    {' • '}
                    Active on{' '}
                    <span className="text-magenta font-bold">{stats?.chainsWithActivity?.length || 0} chains</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 bg-black/30 mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <p className="font-mono text-sm text-foreground/50 uppercase tracking-widest">
            {'>'} Privacy Analysis Complete
          </p>
        </div>
      </footer>

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  )
}
