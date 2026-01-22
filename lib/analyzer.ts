import { KNOWN_EXCHANGES, type Transaction, type FetchResult } from './fetcher'

export interface Issue {
  detected: boolean
  severity: 'critical' | 'warning' | 'good'
  points: number
  title: string
  description: string
  whyMatters?: string | null
  howToFix?: string[] | null
  count?: number
  uniqueAddresses?: number
  reuseRatio?: string
  maxReuse?: number
  percentage?: string
  examples?: string[]
  exchanges?: string[]
  pattern?: string
  peakHour?: number
  concentration?: string
  uniqueSenders?: number
  repeatedValues?: { value: number; count: number }[]
}

export interface TimelinePoint {
  date: string
  score: number
}

export interface AnalysisStats {
  totalTransactions: number
  internalTransactions: number
  tokenTransfers: number
  uniqueAddresses: number
  chain: string
  chainsAnalyzed?: string[]
  chainsWithActivity?: string[]
  chainBreakdown?: Record<string, { transactions: number; tokenTransfers: number; error?: string }>
}

export interface AnalysisResult {
  score: number
  grade: string
  issues: Issue[]
  timeline: TimelinePoint[]
  stats: AnalysisStats
  address?: string
  ensName?: string | null
}

/**
 * Analyze address reuse patterns
 */
function analyzeAddressReuse(transactions: Transaction[], walletAddress: string): Issue {
  if (!transactions || transactions.length === 0) {
    return {
      detected: false,
      count: 0,
      uniqueAddresses: 0,
      severity: 'good',
      points: 0,
      title: 'Address Reuse',
      description: 'No transactions found to analyze',
    }
  }

  const addressLower = walletAddress.toLowerCase()
  const addressCounts: Record<string, number> = {}

  transactions.forEach((tx) => {
    const from = tx.from?.toLowerCase()
    const to = tx.to?.toLowerCase()

    if (from && from !== addressLower) {
      addressCounts[from] = (addressCounts[from] || 0) + 1
    }
    if (to && to !== addressLower) {
      addressCounts[to] = (addressCounts[to] || 0) + 1
    }
  })

  const uniqueAddresses = Object.keys(addressCounts).length
  const totalInteractions = transactions.length

  const highReuseAddresses = Object.entries(addressCounts)
    .filter(([, count]) => count > 5)
    .sort((a, b) => b[1] - a[1])

  const maxReuse = highReuseAddresses.length > 0 ? highReuseAddresses[0][1] : 0
  const reuseRatio = totalInteractions / Math.max(uniqueAddresses, 1)

  let severity: Issue['severity'] = 'good'
  let points = 0
  let detected = false

  if (reuseRatio > 5 || maxReuse > 20) {
    severity = 'critical'
    points = -30
    detected = true
  } else if (reuseRatio > 3 || maxReuse > 10) {
    severity = 'warning'
    points = -15
    detected = true
  } else if (reuseRatio > 2 || maxReuse > 5) {
    severity = 'warning'
    points = -10
    detected = true
  }

  return {
    detected,
    count: totalInteractions,
    uniqueAddresses,
    reuseRatio: reuseRatio.toFixed(2),
    maxReuse,
    severity,
    points,
    title: 'Address Reuse',
    description: detected
      ? `You've interacted with ${uniqueAddresses} unique addresses across ${totalInteractions} transactions (${reuseRatio.toFixed(1)}x reuse ratio)`
      : `Good address diversity: ${uniqueAddresses} unique addresses`,
    whyMatters: detected
      ? 'Reusing the same address makes it easy for anyone to track all your transactions, link your identity, and analyze your financial patterns.'
      : null,
    howToFix: detected
      ? [
          'Generate a new address for each transaction',
          'Use an HD wallet that creates fresh addresses automatically',
          'Consider using a privacy-focused wallet',
        ]
      : null,
  }
}

/**
 * Analyze round number transactions
 */
function analyzeRoundNumbers(transactions: Transaction[]): Issue {
  if (!transactions || transactions.length === 0) {
    return {
      detected: false,
      count: 0,
      severity: 'good',
      points: 0,
      title: 'Round Number Transactions',
      description: 'No transactions found to analyze',
    }
  }

  const roundNumbers: { hash: string; value: number }[] = []

  transactions.forEach((tx) => {
    const valueWei = BigInt(tx.value || '0')
    const valueEth = Number(valueWei) / 1e18

    if (valueEth > 0) {
      const isRound =
        valueEth === Math.floor(valueEth) ||
        valueEth * 2 === Math.floor(valueEth * 2) ||
        valueEth * 10 === Math.floor(valueEth * 10)

      if (isRound && valueEth >= 0.1) {
        roundNumbers.push({ hash: tx.hash, value: valueEth })
      }
    }
  })

  const count = roundNumbers.length
  const percentage = (count / transactions.length) * 100

  let severity: Issue['severity'] = 'good'
  let points = 0
  let detected = false

  if (percentage > 50 || count > 20) {
    severity = 'warning'
    points = -15
    detected = true
  } else if (percentage > 30 || count > 10) {
    severity = 'warning'
    points = -10
    detected = true
  } else if (count > 5) {
    severity = 'warning'
    points = -5
    detected = true
  }

  return {
    detected,
    count,
    percentage: percentage.toFixed(1),
    examples: roundNumbers.slice(0, 5).map((r) => `${r.value} ETH`),
    severity,
    points,
    title: 'Round Number Transactions',
    description: detected
      ? `${count} transactions use round numbers (${percentage.toFixed(0)}% of total)`
      : 'No significant round number patterns detected',
    whyMatters: detected
      ? 'Sending exact round amounts makes your transactions easier to identify and trace. Blockchain analysts look for these patterns.'
      : null,
    howToFix: detected
      ? [
          'Add random small amounts to transactions (e.g., 1.00847 ETH instead of 1 ETH)',
          'Use tools that automatically add noise to transaction amounts',
          'Break large transfers into irregular amounts',
        ]
      : null,
  }
}

/**
 * Analyze exchange interactions
 */
function analyzeExchangeLinks(transactions: Transaction[], walletAddress: string): Issue {
  if (!transactions || transactions.length === 0) {
    return {
      detected: false,
      count: 0,
      severity: 'good',
      points: 0,
      title: 'Exchange Interactions',
      description: 'No transactions found to analyze',
    }
  }

  const exchangeInteractions: { exchange: string; direction: string; hash: string }[] = []

  transactions.forEach((tx) => {
    const from = tx.from?.toLowerCase()
    const to = tx.to?.toLowerCase()

    if (KNOWN_EXCHANGES[from]) {
      exchangeInteractions.push({
        exchange: KNOWN_EXCHANGES[from],
        direction: 'received',
        hash: tx.hash,
      })
    }
    if (KNOWN_EXCHANGES[to]) {
      exchangeInteractions.push({
        exchange: KNOWN_EXCHANGES[to],
        direction: 'sent',
        hash: tx.hash,
      })
    }
  })

  const count = exchangeInteractions.length
  const exchanges = [...new Set(exchangeInteractions.map((e) => e.exchange))]

  let severity: Issue['severity'] = 'good'
  let points = 0
  const detected = count > 0

  if (count > 10) {
    severity = 'critical'
    points = -25
  } else if (count > 5) {
    severity = 'warning'
    points = -15
  } else if (count > 0) {
    severity = 'warning'
    points = -10
  }

  return {
    detected,
    count,
    exchanges,
    severity,
    points,
    title: detected ? 'Direct Exchange Links' : 'No Direct Exchange Links',
    description: detected
      ? `Found ${count} direct interactions with exchanges: ${exchanges.join(', ')}`
      : "Great! No direct transactions to known exchange deposit addresses",
    whyMatters: detected
      ? 'Direct exchange interactions can link your wallet to your KYC identity. Exchanges are required to share data with authorities.'
      : null,
    howToFix: detected
      ? [
          'Use intermediate wallets between your main wallet and exchanges',
          'Consider peer-to-peer trading platforms',
          'Use privacy-preserving DEXs when possible',
        ]
      : null,
  }
}

/**
 * Analyze timing patterns
 */
function analyzeTimingPatterns(transactions: Transaction[]): Issue {
  if (!transactions || transactions.length < 5) {
    return {
      detected: false,
      severity: 'good',
      points: 0,
      title: 'Timing Patterns',
      description: 'Not enough transactions to analyze timing patterns',
    }
  }

  const hourCounts = new Array(24).fill(0)

  transactions.forEach((tx) => {
    const timestamp = parseInt(tx.timeStamp) * 1000
    const date = new Date(timestamp)
    hourCounts[date.getUTCHours()]++
  })

  const maxHourCount = Math.max(...hourCounts)
  const peakHour = hourCounts.indexOf(maxHourCount)
  const hourConcentration = maxHourCount / transactions.length

  let maxWindowCount = 0
  let windowStart = 0
  for (let i = 0; i < 24; i++) {
    const windowCount = hourCounts[i] + hourCounts[(i + 1) % 24] + hourCounts[(i + 2) % 24]
    if (windowCount > maxWindowCount) {
      maxWindowCount = windowCount
      windowStart = i
    }
  }
  const windowConcentration = maxWindowCount / transactions.length

  let severity: Issue['severity'] = 'good'
  let points = 0
  let detected = false
  let pattern = ''

  if (windowConcentration > 0.6) {
    severity = 'warning'
    points = -15
    detected = true
    pattern = `${windowStart}:00-${(windowStart + 3) % 24}:00 UTC`
  } else if (windowConcentration > 0.4) {
    severity = 'warning'
    points = -10
    detected = true
    pattern = `${windowStart}:00-${(windowStart + 3) % 24}:00 UTC`
  } else if (hourConcentration > 0.3) {
    severity = 'warning'
    points = -5
    detected = true
    pattern = `around ${peakHour}:00 UTC`
  }

  return {
    detected,
    pattern,
    peakHour,
    concentration: (windowConcentration * 100).toFixed(1),
    severity,
    points,
    title: 'Timing Patterns',
    description: detected
      ? `Transactions often occur ${pattern} (${(windowConcentration * 100).toFixed(0)}% concentration)`
      : 'Transaction timing appears random',
    whyMatters: detected
      ? 'Regular transaction timing can reveal your timezone and daily routine. Analysts use this to narrow down identity.'
      : null,
    howToFix: detected
      ? [
          'Vary the times when you make transactions',
          'Use scheduled transactions with random delays',
          'Consider time-delayed transaction services',
        ]
      : null,
  }
}

/**
 * Analyze dust attacks
 */
function analyzeDustAttacks(transactions: Transaction[], walletAddress: string): Issue {
  if (!transactions || transactions.length === 0) {
    return {
      detected: false,
      count: 0,
      severity: 'good',
      points: 0,
      title: 'Dust Attack Detection',
      description: 'No transactions found to analyze',
    }
  }

  const addressLower = walletAddress.toLowerCase()
  const dustTransactions: { hash: string; value: number; from: string }[] = []
  const DUST_THRESHOLD = 0.001

  transactions.forEach((tx) => {
    const to = tx.to?.toLowerCase()
    const valueWei = BigInt(tx.value || '0')
    const valueEth = Number(valueWei) / 1e18

    if (to === addressLower && valueEth > 0 && valueEth < DUST_THRESHOLD) {
      dustTransactions.push({
        hash: tx.hash,
        value: valueEth,
        from: tx.from,
      })
    }
  })

  const count = dustTransactions.length
  const uniqueSenders = [...new Set(dustTransactions.map((d) => d.from))].length

  let severity: Issue['severity'] = 'good'
  let points = 0
  const detected = count > 0

  if (count > 10 || uniqueSenders > 5) {
    severity = 'warning'
    points = -10
  } else if (count > 5) {
    severity = 'warning'
    points = -5
  } else if (count > 0) {
    points = -2
  }

  return {
    detected,
    count,
    uniqueSenders,
    severity: detected ? severity : 'good',
    points,
    title: 'Dust Attack Detection',
    description: detected
      ? `Detected ${count} potential dust transactions from ${uniqueSenders} unique senders`
      : 'No dust attack patterns detected',
    whyMatters: detected
      ? 'Dust attacks send tiny amounts to your wallet to track your spending patterns when you consolidate funds.'
      : null,
    howToFix: detected
      ? [
          'Never consolidate dust with your main funds',
          'Use a separate wallet for dust-contaminated addresses',
          'Consider these UTXOs as "burned" for privacy',
        ]
      : null,
  }
}

/**
 * Analyze transaction value distribution
 */
function analyzeValueDistribution(transactions: Transaction[]): Issue {
  if (!transactions || transactions.length < 5) {
    return {
      detected: false,
      severity: 'good',
      points: 0,
      title: 'Value Distribution',
      description: 'Not enough transactions to analyze',
    }
  }

  const values = transactions
    .map((tx) => Number(BigInt(tx.value || '0')) / 1e18)
    .filter((v) => v > 0)

  if (values.length < 3) {
    return {
      detected: false,
      severity: 'good',
      points: 0,
      title: 'Value Distribution',
      description: 'Not enough value transactions to analyze',
    }
  }

  const valueCounts: Record<string, number> = {}
  values.forEach((v) => {
    const rounded = v.toFixed(6)
    valueCounts[rounded] = (valueCounts[rounded] || 0) + 1
  })

  const repeatedValues = Object.entries(valueCounts).filter(([, count]) => count > 2)
  const hasRepeatedPattern = repeatedValues.length > 0

  let severity: Issue['severity'] = 'good'
  let points = 0
  let detected = false

  if (repeatedValues.some(([, count]) => count > 5)) {
    severity = 'warning'
    points = -10
    detected = true
  } else if (hasRepeatedPattern) {
    severity = 'warning'
    points = -5
    detected = true
  }

  return {
    detected,
    repeatedValues: repeatedValues.map(([v, c]) => ({ value: parseFloat(v), count: c })),
    severity,
    points,
    title: 'Value Distribution',
    description: detected
      ? `Found ${repeatedValues.length} repeated transaction amounts`
      : 'Transaction values show good variety',
    whyMatters: detected
      ? 'Repeated exact transaction amounts create a fingerprint that can be used to track your activity.'
      : null,
    howToFix: detected
      ? ['Vary transaction amounts slightly', 'Avoid sending the same amount repeatedly']
      : null,
  }
}

/**
 * Generate timeline data from transactions
 */
function generateTimeline(transactions: Transaction[], walletAddress: string): TimelinePoint[] {
  if (!transactions || transactions.length === 0) {
    return []
  }

  const addressLower = walletAddress.toLowerCase()
  const dateScores: Record<string, number> = {}

  const sorted = [...transactions].sort(
    (a, b) => parseInt(a.timeStamp) - parseInt(b.timeStamp)
  )

  let runningScore = 100
  const addressesSeen = new Set<string>()

  sorted.forEach((tx) => {
    const date = new Date(parseInt(tx.timeStamp) * 1000)
    const dateKey = date.toISOString().split('T')[0]

    const to = tx.to?.toLowerCase()
    const from = tx.from?.toLowerCase()
    const otherAddress = to === addressLower ? from : to

    if (otherAddress && addressesSeen.has(otherAddress)) {
      runningScore = Math.max(0, runningScore - 0.5)
    }
    addressesSeen.add(otherAddress)

    if (KNOWN_EXCHANGES[to] || KNOWN_EXCHANGES[from]) {
      runningScore = Math.max(0, runningScore - 2)
    }

    dateScores[dateKey] = Math.round(runningScore)
  })

  const dates = Object.keys(dateScores).slice(-5)
  return dates.map((date) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: dateScores[date],
  }))
}

/**
 * Calculate overall privacy score
 */
function calculateScore(issues: Issue[]): { score: number; grade: string } {
  let score = 100

  issues.forEach((issue) => {
    score += issue.points
  })

  score = Math.max(0, Math.min(100, score))

  let grade: string
  if (score >= 90) grade = 'A+'
  else if (score >= 80) grade = 'A'
  else if (score >= 70) grade = 'B'
  else if (score >= 60) grade = 'C'
  else if (score >= 40) grade = 'D'
  else grade = 'F'

  return { score, grade }
}

/**
 * Main analysis function
 */
export function analyzeWallet(data: FetchResult, walletAddress: string): AnalysisResult {
  const { transactions, internalTransactions, tokenTransfers } = data

  const addressReuse = analyzeAddressReuse(transactions, walletAddress)
  const roundNumbers = analyzeRoundNumbers(transactions)
  const exchangeLinks = analyzeExchangeLinks(transactions, walletAddress)
  const timingPatterns = analyzeTimingPatterns(transactions)
  const dustAttacks = analyzeDustAttacks(transactions, walletAddress)
  const valueDistribution = analyzeValueDistribution(transactions)

  const allIssues: Issue[] = [
    addressReuse,
    roundNumbers,
    exchangeLinks,
    timingPatterns,
    dustAttacks,
    valueDistribution,
  ]

  const severityOrder = { critical: 0, warning: 1, good: 2 }
  allIssues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

  const { score, grade } = calculateScore(allIssues)
  const timeline = generateTimeline(transactions, walletAddress)

  const stats: AnalysisStats = {
    totalTransactions: transactions.length,
    internalTransactions: internalTransactions?.length || 0,
    tokenTransfers: tokenTransfers?.length || 0,
    uniqueAddresses: addressReuse.uniqueAddresses || 0,
    chain: data.chain,
  }

  return {
    score,
    grade,
    issues: allIssues,
    timeline,
    stats,
  }
}
