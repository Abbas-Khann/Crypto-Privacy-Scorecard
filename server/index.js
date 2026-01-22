require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { fetchTransactions, resolveENS } = require('./utils/fetcher');
const { analyzeWallet } = require('./utils/analyzer');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Keys from environment
const API_KEYS = {
  etherscan: process.env.ETHERSCAN_API_KEY,
  basescan: process.env.BASESCAN_API_KEY,
  polygonscan: process.env.POLYGONSCAN_API_KEY,
  arbiscan: process.env.ARBISCAN_API_KEY,
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ENS resolution endpoint
app.get('/api/resolve/:name', async (req, res) => {
  try {
    const { name } = req.params;

    if (!name.endsWith('.eth')) {
      return res.status(400).json({ error: 'Invalid ENS name' });
    }

    const address = await resolveENS(name);

    if (!address) {
      return res.status(404).json({ error: 'Could not resolve ENS name' });
    }

    res.json({ name, address });
  } catch (error) {
    console.error('ENS resolution error:', error);
    res.status(500).json({ error: 'Failed to resolve ENS name' });
  }
});

// All supported chains
const SUPPORTED_CHAINS = ['ethereum', 'base', 'polygon', 'arbitrum'];

// Main analysis endpoint - analyzes across ALL chains
app.post('/api/analyze', async (req, res) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }

    // Validate address format (basic check)
    const isValidEVM = /^0x[a-fA-F0-9]{40}$/.test(address);
    const isENS = address.endsWith('.eth');

    if (!isValidEVM && !isENS) {
      return res.status(400).json({ error: 'Invalid address format' });
    }

    // Resolve ENS if needed
    let resolvedAddress = address;
    if (isENS) {
      resolvedAddress = await resolveENS(address);
      if (!resolvedAddress) {
        return res.status(404).json({ error: 'Could not resolve ENS name' });
      }
    }

    console.log(`Analyzing ${resolvedAddress} across all chains...`);

    // Fetch transactions from ALL chains in parallel
    const chainResults = await Promise.allSettled(
      SUPPORTED_CHAINS.map(async (chain) => {
        try {
          const data = await fetchTransactions(resolvedAddress, chain, API_KEYS);
          return { chain, data, success: true };
        } catch (error) {
          console.log(`Failed to fetch ${chain}: ${error.message}`);
          return { chain, data: null, success: false, error: error.message };
        }
      })
    );

    // Process results and merge transactions
    const allTransactions = [];
    const allTokenTransfers = [];
    const chainStats = {};
    const chainsWithActivity = [];

    chainResults.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.success && result.value.data) {
        const { chain, data } = result.value;
        const txCount = data.transactions?.length || 0;
        const tokenCount = data.tokenTransfers?.length || 0;

        chainStats[chain] = {
          transactions: txCount,
          tokenTransfers: tokenCount,
        };

        if (txCount > 0) {
          chainsWithActivity.push(chain);
          // Add chain info to each transaction for tracking
          data.transactions.forEach((tx) => {
            allTransactions.push({ ...tx, _chain: chain });
          });
        }

        if (tokenCount > 0) {
          data.tokenTransfers.forEach((tt) => {
            allTokenTransfers.push({ ...tt, _chain: chain });
          });
        }
      } else if (result.status === 'fulfilled') {
        chainStats[result.value.chain] = { transactions: 0, tokenTransfers: 0, error: result.value.error };
      }
    });

    // If no transactions found on any chain
    if (allTransactions.length === 0) {
      return res.json({
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
      });
    }

    // Merge data for analysis
    const mergedData = {
      transactions: allTransactions,
      internalTransactions: [],
      tokenTransfers: allTokenTransfers,
      chain: chainsWithActivity.length === 1 ? chainsWithActivity[0] : 'multi-chain',
    };

    // Run analysis on merged data
    const analysis = analyzeWallet(mergedData, resolvedAddress);

    // Add address info and enhanced stats
    analysis.address = resolvedAddress;
    analysis.ensName = isENS ? address : null;

    // Update stats with chain breakdown
    analysis.stats = {
      ...analysis.stats,
      chainsAnalyzed: SUPPORTED_CHAINS,
      chainsWithActivity,
      chainBreakdown: chainStats,
    };

    console.log(`Analysis complete. Score: ${analysis.score} (${chainsWithActivity.length} chains with activity)`);

    res.json(analysis);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      error: 'Failed to analyze wallet',
      message: error.message,
    });
  }
});

// Get supported chains
app.get('/api/chains', (req, res) => {
  res.json({
    chains: [
      { id: 'ethereum', name: 'Ethereum', icon: '⟠' },
      { id: 'base', name: 'Base', icon: '🔵' },
      { id: 'polygon', name: 'Polygon', icon: '💜' },
      { id: 'arbitrum', name: 'Arbitrum', icon: '🔷' },
    ],
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🔒 Privacy Scorecard API running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
  console.log(`   Analyze: POST http://localhost:${PORT}/api/analyze`);
});
