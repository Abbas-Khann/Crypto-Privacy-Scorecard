import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Plus, Share2, Check, Shield, User, Users, Trophy, ChevronDown, ExternalLink } from 'lucide-react'
import { useState, useEffect } from 'react'
import ScoreCircle from '../components/ScoreCircle'
import Toast, { useToast } from '../components/Toast'

// =============================================================================
// STYLE CONSTANTS - Reusable Tailwind patterns
// =============================================================================

// Card styles
const CARD_BASE = 'bg-dark-card rounded-2xl border border-gray-700/50'
const CARD_PADDING = 'p-6'
const CARD_PADDING_LG = 'p-8'
const CARD = `${CARD_BASE} ${CARD_PADDING}`
const CARD_LG = `${CARD_BASE} ${CARD_PADDING_LG}`

// Spacing system (consistent vertical rhythm)
const SPACING = {
  section: 'mb-12',      // Between major sections
  subsection: 'mb-8',    // Within sections
  element: 'mb-6',       // Between elements
  tight: 'mb-4',         // Tight spacing
}

// Typography
const SECTION_HEADER = 'text-sm text-gray-400 font-semibold uppercase tracking-wider'
const TITLE_LG = 'text-xl font-bold text-dark-text'

// Button styles
const BTN_SECONDARY = 'flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dark-card border border-gray-700 text-gray-400 hover:text-dark-text hover:border-gray-600 transition-all'
const BTN_PRIMARY = 'flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-blue hover:bg-blue-600 text-white transition-all'

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const truncateAddress = (address) => {
  if (!address) return ''
  if (address.length <= 15) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// =============================================================================
// CONFIGURATION
// =============================================================================

// Tab configuration
const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'issues', label: 'Issues', showCount: true },
  { id: 'compare', label: 'Compare' },
  { id: 'activity', label: 'Activity' },
]

// Severity configuration
const severityConfig = {
  critical: {
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: '#ef4444',
    dotColor: 'bg-red-500',
    badge: '🔴',
    label: 'Critical',
  },
  warning: {
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: '#f59e0b',
    dotColor: 'bg-yellow-500',
    badge: '🟡',
    label: 'Warning',
  },
  good: {
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: '#10b981',
    dotColor: 'bg-green-500',
    badge: '🟢',
    label: 'Good',
  },
}

// Issue Card Component with improved styling
function IssueCard({ issue, isExpanded, onToggle }) {
  const config = severityConfig[issue.severity]
  const hasDetails = issue.whyMatters || issue.howToFix || issue.learnMoreUrl

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        scale: 1.01,
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
      }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl overflow-hidden bg-[#1e2430] border border-gray-700/50"
      style={{
        borderLeft: `4px solid ${config.borderColor}`,
      }}
    >
      <button
        onClick={() => hasDetails && onToggle()}
        className={`w-full p-6 flex items-start justify-between text-left ${
          hasDetails ? 'cursor-pointer' : 'cursor-default'
        }`}
      >
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {/* Larger severity indicator */}
          <div
            className={`w-4 h-4 rounded-full shrink-0 mt-1.5 ${config.dotColor}`}
            style={{ boxShadow: `0 0 10px ${config.color}50` }}
          />

          <div className="flex flex-col gap-2 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-lg font-bold text-dark-text">{issue.title}</h3>
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide"
                style={{ backgroundColor: config.bgColor, color: config.color }}
              >
                {config.label}
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">{issue.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0 ml-4">
          <span
            className="text-xl font-bold whitespace-nowrap"
            style={{ color: config.color }}
          >
            {issue.points > 0 ? `+${issue.points}` : issue.points} pts
          </span>
          {hasDetails && (
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="p-2 rounded-lg bg-gray-800/50"
            >
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </motion.div>
          )}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && hasDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-4 border-t border-gray-700/50 ml-8">
              {issue.whyMatters && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Why it matters
                  </h4>
                  <p className="text-base text-dark-text leading-relaxed">{issue.whyMatters}</p>
                </div>
              )}

              {issue.howToFix && issue.howToFix.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    How to fix
                  </h4>
                  <ul className="space-y-3">
                    {issue.howToFix.map((fix, index) => (
                      <li key={index} className="text-base text-dark-text flex items-start gap-3">
                        <span className="text-accent-blue mt-0.5">→</span>
                        <span>{fix}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {issue.learnMoreUrl && (
                <a
                  href={issue.learnMoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-accent-blue hover:text-blue-400 transition-colors text-base font-medium"
                >
                  <span>Learn More</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Compact Good Practice Card
function GoodPracticeCard({ issue }) {
  const config = severityConfig.good

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-4 p-4 bg-[#1a2e1a] border border-green-900/50 rounded-xl"
      style={{ borderLeft: `3px solid ${config.borderColor}` }}
    >
      <div className={`w-3 h-3 rounded-full ${config.dotColor}`} />
      <p className="text-dark-text font-medium">{issue.title}</p>
      <span className="text-green-400 font-bold text-sm">+{issue.points} pts</span>
    </motion.div>
  )
}

// Comparison data
const comparisons = [
  { label: 'Your Score', color: '#f59e0b', isUser: true, icon: User },
  { label: 'Average User', score: 38, color: '#6b7280', isUser: false, icon: Users },
  { label: 'Privacy Pro', score: 95, color: '#22c55e', isUser: false, icon: Trophy },
]

export default function ResultsPage() {
  const { address } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast, showToast, hideToast } = useToast()
  const [copied, setCopied] = useState(false)
  const [analysisData, setAnalysisData] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [expandedIssue, setExpandedIssue] = useState(null)

  useEffect(() => {
    if (location.state?.analysisData) {
      setAnalysisData(location.state.analysisData)
    } else {
      navigate(`/loading/${address}`, { replace: true })
    }
  }, [location.state, address, navigate])

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Crypto Privacy Scorecard',
          text: `My wallet privacy score: ${analysisData?.score || 0}/100`,
          url: url,
        })
      } catch (err) {
        if (err.name !== 'AbortError') {
          copyToClipboard(url)
        }
      }
    } else {
      copyToClipboard(url)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    showToast('Link copied to clipboard!', 'success')
    setTimeout(() => setCopied(false), 2000)
  }

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full" />
      </div>
    )
  }

  const { score, issues, stats, ensName } = analysisData
  const issuesCount = issues.filter((i) => i.severity !== 'good').length
  const displayAddress = ensName || address

  // Group issues by severity
  const warnings = issues.filter(i => i.severity === 'critical' || i.severity === 'warning')
  const goodPractices = issues.filter(i => i.severity === 'good')

  // Calculate percentile
  const percentile = Math.round((score / 100) * 100 * 0.56 + 20)

  // Get grade info
  const getGradeInfo = (score) => {
    if (score >= 90) return { label: 'Excellent', color: 'bg-green-500/20 text-green-400 border-green-500/30' }
    if (score >= 70) return { label: 'Good', color: 'bg-green-500/20 text-green-400 border-green-500/30' }
    if (score >= 50) return { label: 'Fair', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' }
    if (score >= 30) return { label: 'Poor', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' }
    return { label: 'Critical', color: 'bg-red-500/20 text-red-400 border-red-500/30' }
  }

  const gradeInfo = getGradeInfo(score)

  return (
    <div className="min-h-screen w-full bg-dark-bg flex flex-col">
      {/* Fixed Header - STEP 1: Navbar with h-16, px-8 py-4 */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 h-16 bg-dark-bg/95 backdrop-blur-lg border-b border-gray-700"
      >
        <div className="max-w-4xl mx-auto h-full px-6">
          <div className="flex items-center justify-between h-full">
            {/* Left - Product name */}
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-accent-blue" />
              <span className="text-lg font-semibold text-dark-text hidden sm:inline">
                Crypto Privacy Scorecard
              </span>
            </div>

            {/* Right - Actions */}
            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => navigate('/')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={BTN_SECONDARY}
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">Back</span>
              </motion.button>

              <motion.button
                onClick={handleShare}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={BTN_SECONDARY}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
                <span className="text-sm font-medium hidden sm:inline">Share</span>
              </motion.button>

              <motion.button
                onClick={() => navigate('/')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={BTN_PRIMARY}
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">New Scan</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content Wrapper - centers the main container */}
      <div className="w-full flex justify-center flex-1">
        <main className="w-full max-w-4xl px-6">
        {/* Score Display - Large top margin to push down from navbar */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center pt-12"
        >
          <div className="mb-8 relative">
            {/* Subtle glow effect behind score circle */}
            <div
              className="absolute inset-0 rounded-full blur-3xl opacity-30"
              style={{
                background: `radial-gradient(circle, ${score >= 70 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444'} 0%, transparent 70%)`,
                transform: 'scale(1.2)'
              }}
            />
            <ScoreCircle score={score} size={200} />
          </div>

          {/* Grade Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <span className={`px-6 py-2 rounded-full text-base font-semibold border ${gradeInfo.color}`}>
              {gradeInfo.label}
            </span>
          </motion.div>
        </motion.section>

        {/* Tab Navigation */}
        <motion.nav
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex justify-center gap-8 border-b-2 border-gray-800/50 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-6 py-3 text-lg font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-dark-text'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab.label}
                {tab.showCount && issuesCount > 0 && (
                  <span className="ml-2 px-8 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400">
                    {issuesCount}
                  </span>
                )}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-[3px] bg-accent-blue rounded-t-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </motion.nav>

        {/* Tab Content Container */}
        <div className="pt-6 w-full">
          <AnimatePresence mode="wait" className='w-full'>
            {/* OVERVIEW TAB - Proper spacing throughout */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Wallet Address */}
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-3 uppercase tracking-wider font-medium">Wallet Address</p>
                  <p className={`text-xl font-mono text-dark-text ${CARD_BASE} px-8 py-4 inline-block`}>
                    {truncateAddress(displayAddress)}
                  </p>
                </div>

                {/* Stats Grid */}
                {stats && stats.totalTransactions > 0 && (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                      {[
                        { value: stats.totalTransactions, label: 'Transactions' },
                        { value: stats.uniqueAddresses || 0, label: 'Addresses' },
                        { value: stats.tokenTransfers || 0, label: 'Tokens' },
                        { value: stats.chainsWithActivity?.length || 1, label: 'Chains' },
                      ].map((stat, index) => (
                        <motion.div
                          key={stat.label}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + index * 0.05 }}
                          whileHover={{ scale: 1.02, borderColor: 'rgba(107, 114, 128, 0.5)' }}
                          className={`${CARD} text-center transition-all`}
                        >
                          <p className="text-4xl font-bold text-dark-text">{stat.value}</p>
                          <p className="text-sm text-gray-500 mt-2">{stat.label}</p>
                        </motion.div>
                      ))}
                  </div>
                )}

                {/* Chain Activity */}
                {stats?.chainBreakdown && (
                  <div className={CARD}>
                    <h3 className={`${SECTION_HEADER} mb-5 text-center`}>
                      Activity by Chain
                    </h3>
                    <div className="flex flex-wrap justify-center gap-3">
                      {[
                        { id: 'ethereum', name: 'Ethereum', icon: '◆', color: 'text-blue-400' },
                        { id: 'base', name: 'Base', icon: '🔵' },
                        { id: 'polygon', name: 'Polygon', icon: '💜' },
                        { id: 'arbitrum', name: 'Arbitrum', icon: '🔷' },
                      ].map((chain) => {
                        const chainData = stats.chainBreakdown[chain.id] || { transactions: 0 }
                        const hasActivity = chainData.transactions > 0
                        return (
                          <div
                            key={chain.id}
                            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${
                              hasActivity
                                ? 'bg-accent-blue/10 text-dark-text border border-accent-blue/30'
                                : 'bg-gray-800/30 text-gray-500 border border-gray-800/50'
                            }`}
                          >
                            <span className={chain.color || ''}>{chain.icon}</span>
                            <span className="font-medium">{chain.name}</span>
                            <span className={`text-xs font-semibold ${hasActivity ? 'text-accent-blue' : 'text-gray-600'}`}>
                              ({chainData.transactions})
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Quick Summary */}
                <div className="max-w-2xl mx-auto">
                  <div className={`${CARD} text-center`}>
                    <p className="text-gray-400 text-lg">
                      {issuesCount > 0 ? (
                        <>
                          Found <span className="text-yellow-400 font-bold">{issuesCount} issue{issuesCount !== 1 ? 's' : ''}</span> affecting your privacy score.{' '}
                          <button
                            onClick={() => setActiveTab('issues')}
                            className="text-accent-blue hover:underline font-semibold"
                          >
                            View details →
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-green-400 font-bold">Great job!</span> No privacy issues detected.
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ISSUES TAB - Centered content */}
            {activeTab === 'issues' && (
              <motion.div
                key="issues"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-2xl mx-auto"
              >
                {/* Warning Cards */}
                {warnings.length > 0 && (
                  <div className="space-y-4">
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

                {/* Separator between warnings and good practices */}
                {warnings.length > 0 && goodPractices.length > 0 && (
                  <div className="my-10 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
                )}

                {/* Good Practice Cards */}
                {goodPractices.length > 0 && (
                  <div className="space-y-3">
                    {goodPractices.map((issue, index) => (
                      <GoodPracticeCard key={index} issue={issue} />
                    ))}
                  </div>
                )}

                {/* No Issues */}
                {issues.length === 0 && (
                  <div className="text-center py-16">
                    <div className="text-7xl mb-6">🎉</div>
                    <h3 className="text-2xl font-bold text-dark-text mb-3">Perfect Privacy!</h3>
                    <p className="text-gray-400 text-lg">No issues detected with your wallet.</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* COMPARE TAB - Centered content */}
            {activeTab === 'compare' && (
              <motion.div
                key="compare"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-2xl mx-auto"
              >
                <div className={CARD_LG}>
                  <h3 className={`${TITLE_LG} ${SPACING.subsection} text-center`}>
                    How You Compare
                  </h3>

                  <div className="space-y-6">
                    {comparisons.map((item, index) => {
                      const Icon = item.icon
                      const itemScore = item.isUser ? score : item.score
                      return (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + index * 0.1 }}
                        >
                          <div className="flex items-center gap-4 mb-2">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                              style={{ backgroundColor: `${item.color}20` }}
                            >
                              <Icon className="w-5 h-5" style={{ color: item.color }} />
                            </div>
                            <span
                              className={`flex-1 text-base font-medium ${
                                item.isUser ? 'text-dark-text' : 'text-gray-400'
                              }`}
                            >
                              {item.label}
                            </span>
                            <span
                              className="text-xl font-bold"
                              style={{ color: item.color }}
                            >
                              {itemScore}/100
                            </span>
                          </div>
                          <div className="h-3 bg-gray-800 rounded-full overflow-hidden w-full">
                            <motion.div
                              className="h-full rounded-full"
                              style={{
                                backgroundColor: item.color,
                                boxShadow: `0 0 20px ${item.color}50`
                              }}
                              initial={{ width: 0 }}
                              animate={{ width: `${itemScore}%` }}
                              transition={{ duration: 1, delay: 0.2 + index * 0.1, ease: 'easeOut' }}
                            />
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>

                  {/* Percentile Callout */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-12 pt-8 border-t border-gray-700/50 text-center"
                  >
                    <div className="inline-block px-8 py-6 bg-gradient-to-br from-green-500/10 to-emerald-500/5 rounded-2xl border border-green-500/20">
                      <p className="text-3xl sm:text-4xl font-bold mb-2">
                        <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                          Better than {percentile}%
                        </span>
                      </p>
                      <p className="text-gray-400 text-base">of all analyzed wallets</p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* ACTIVITY TAB - Centered content */}
            {activeTab === 'activity' && (
              <motion.div
                key="activity"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-2xl mx-auto space-y-8"
              >
                {/* Chain Breakdown */}
                <div className={CARD_LG}>
                  <h3 className={`${TITLE_LG} ${SPACING.subsection} text-center`}>Chain Breakdown</h3>
                  <div className="space-y-5">
                    {[
                      { id: 'ethereum', name: 'Ethereum', icon: '◆', color: '#627EEA' },
                      { id: 'base', name: 'Base', icon: '🔵', color: '#0052FF' },
                      { id: 'polygon', name: 'Polygon', icon: '💜', color: '#8247E5' },
                      { id: 'arbitrum', name: 'Arbitrum', icon: '🔷', color: '#28A0F0' },
                    ].map((chain) => {
                      const chainData = stats?.chainBreakdown?.[chain.id] || { transactions: 0, tokenTransfers: 0 }
                      const total = stats?.totalTransactions || 1
                      const percentage = total > 0 ? Math.round((chainData.transactions / total) * 100) : 0
                      return (
                        <div key={chain.id}>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-xl w-8">{chain.icon}</span>
                            <span className="flex-1 text-dark-text font-medium">{chain.name}</span>
                            <span className="text-dark-text font-bold">{chainData.transactions}</span>
                            <span className="text-gray-500 text-sm w-24 text-right">txns ({percentage}%)</span>
                          </div>
                          <div className="h-2 bg-gray-800 rounded-full overflow-hidden w-full">
                            <motion.div
                              className="h-full rounded-full"
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
                    { value: stats?.totalTransactions || 0, label: 'Total Transactions' },
                    { value: stats?.tokenTransfers || 0, label: 'Token Transfers' },
                    { value: stats?.uniqueAddresses || 0, label: 'Unique Addresses' },
                    { value: stats?.chainsWithActivity?.length || 0, label: 'Active Chains' },
                  ].map((stat) => (
                    <motion.div
                      key={stat.label}
                      whileHover={{ scale: 1.02, borderColor: 'rgba(107, 114, 128, 0.5)' }}
                      className={`${CARD} text-center transition-all`}
                    >
                      <p className="text-4xl font-bold text-dark-text">{stat.value}</p>
                      <p className="text-sm text-gray-500 mt-2">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Chains Analyzed Summary */}
                <div className={`${CARD} text-center mt-4`}>
                  <p className="text-gray-400">
                    Analyzed across{' '}
                    <span className="text-dark-text font-semibold">
                      {stats?.chainsAnalyzed?.length || 4} chains
                    </span>
                    {' • '}
                    Active on{' '}
                    <span className="text-accent-blue font-semibold">
                      {stats?.chainsWithActivity?.length || 0} chains
                    </span>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Spacing */}
        <div className="h-16" />
      </main>
      </div>

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
