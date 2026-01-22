import { NextRequest, NextResponse } from 'next/server'
import { fetchTransactions, resolveENS, type Transaction, type TokenTransfer } from '@/lib/fetcher'
import { analyzeWallet } from '@/lib/analyzer'

const SUPPORTED_CHAINS = ['ethereum', 'base', 'polygon', 'arbitrum']

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address } = body

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 })
    }

    // Validate address format
    const isValidEVM = /^0x[a-fA-F0-9]{40}$/.test(address)
    const isENS = address.endsWith('.eth')

    if (!isValidEVM && !isENS) {
      return NextResponse.json({ error: 'Invalid address format' }, { status: 400 })
    }

    // Resolve ENS if needed
    let resolvedAddress = address
    if (isENS) {
      const resolved = await resolveENS(address)
      if (!resolved) {
        return NextResponse.json({ error: 'Could not resolve ENS name' }, { status: 404 })
      }
      resolvedAddress = resolved
    }

    console.log(`Analyzing ${resolvedAddress} across all chains...`)

    // Fetch transactions from ALL chains in parallel
    const chainResults = await Promise.allSettled(
      SUPPORTED_CHAINS.map(async (chain) => {
        try {
          const data = await fetchTransactions(resolvedAddress, chain)
          return { chain, data, success: true }
        } catch (error: any) {
          console.log(`Failed to fetch ${chain}: ${error.message}`)
          return { chain, data: null, success: false, error: error.message }
        }
      })
    )

    // Process results and merge transactions
    const allTransactions: Transaction[] = []
    const allTokenTransfers: TokenTransfer[] = []
    const chainStats: Record<string, { transactions: number; tokenTransfers: number; error?: string }> = {}
    const chainsWithActivity: string[] = []

    chainResults.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.success && result.value.data) {
        const { chain, data } = result.value
        const txCount = data.transactions?.length || 0
        const tokenCount = data.tokenTransfers?.length || 0

        chainStats[chain] = {
          transactions: txCount,
          tokenTransfers: tokenCount,
        }

        if (txCount > 0) {
          chainsWithActivity.push(chain)
          data.transactions.forEach((tx) => {
            allTransactions.push({ ...tx, _chain: chain })
          })
        }

        if (tokenCount > 0) {
          data.tokenTransfers.forEach((tt) => {
            allTokenTransfers.push({ ...tt, _chain: chain })
          })
        }
      } else if (result.status === 'fulfilled') {
        chainStats[result.value.chain] = {
          transactions: 0,
          tokenTransfers: 0,
          error: result.value.error,
        }
      }
    })

    // If no transactions found on any chain
    if (allTransactions.length === 0) {
      return NextResponse.json({
        score: 100,
        grade: 'A+',
        issues: [
          {
            detected: false,
            severity: 'good',
            points: 0,
            title: 'No Transaction History',
            description: 'This address has no transaction history on any supported chain',
          },
        ],
        timeline: [],
        stats: {
          totalTransactions: 0,
          chainsAnalyzed: SUPPORTED_CHAINS,
          chainBreakdown: chainStats,
        },
        address: resolvedAddress,
        ensName: isENS ? address : null,
      })
    }

    // Merge data for analysis
    const mergedData = {
      transactions: allTransactions,
      internalTransactions: [],
      tokenTransfers: allTokenTransfers,
      chain: chainsWithActivity.length === 1 ? chainsWithActivity[0] : 'multi-chain',
    }

    // Run analysis on merged data
    const analysis = analyzeWallet(mergedData, resolvedAddress)

    // Add address info and enhanced stats
    const result = {
      ...analysis,
      address: resolvedAddress,
      ensName: isENS ? address : null,
      stats: {
        ...analysis.stats,
        chainsAnalyzed: SUPPORTED_CHAINS,
        chainsWithActivity,
        chainBreakdown: chainStats,
      },
    }

    console.log(`Analysis complete. Score: ${result.score} (${chainsWithActivity.length} chains with activity)`)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze wallet', message: error.message },
      { status: 500 }
    )
  }
}
