const axios = require('axios');

// Known exchange addresses (hot wallets)
const KNOWN_EXCHANGES = {
  // Binance
  '0x28c6c06298d514db089934071355e5743bf21d60': 'Binance',
  '0x21a31ee1afc51d94c2efccaa2092ad1028285549': 'Binance',
  '0xdfd5293d8e347dfe59e90efd55b2956a1343963d': 'Binance',
  '0x56eddb7aa87536c09ccc2793473599fd21a8b17f': 'Binance',
  // Coinbase
  '0x71660c4005ba85c37ccec55d0c4493e66fe775d3': 'Coinbase',
  '0x503828976d22510aad0201ac7ec88293211d23da': 'Coinbase',
  '0xddfabcdc4d8ffc6d5beaf154f18b778f892a0740': 'Coinbase',
  '0x3cd751e6b0078be393132286c442345e5dc49699': 'Coinbase',
  // Kraken
  '0x2910543af39aba0cd09dbb2d50200b3e800a63d2': 'Kraken',
  '0x0a869d79a7052c7f1b55a8ebabbea3420f0d1e13': 'Kraken',
  // FTX (now defunct but still useful for historical)
  '0x2faf487a4414fe77e2327f0bf4ae2a264a776ad2': 'FTX',
  // Gemini
  '0xd24400ae8bfebb18ca49be86258a3c749cf46853': 'Gemini',
  // KuCoin
  '0xf16e9b0d03470827a95cdfd0cb8a8a3b46969b91': 'KuCoin',
  // OKX
  '0x6cc5f688a315f3dc28a7781717a9a798a59fda7b': 'OKX',
  // Huobi
  '0xab5c66752a9e8167967685f1450532fb96d5d24f': 'Huobi',
};

// Chain configurations for Blockscout
const BLOCKSCOUT_URLS = {
  ethereum: 'https://eth.blockscout.com/api/v2',
  base: 'https://base.blockscout.com/api/v2',
  polygon: 'https://polygon.blockscout.com/api/v2',
  arbitrum: 'https://arbitrum.blockscout.com/api/v2',
};

/**
 * Resolve ENS name to address using Blockscout
 */
async function resolveENS(ensName) {
  try {
    // Use Blockscout's ENS resolution
    const response = await axios.get(
      `https://eth.blockscout.com/api/v2/addresses/${ensName}`,
      { timeout: 10000 }
    );

    if (response.data && response.data.hash) {
      return response.data.hash;
    }

    return null;
  } catch (error) {
    // Try ENS public resolver as fallback
    try {
      const ensResponse = await axios.get(
        `https://api.ensideas.com/ens/resolve/${ensName}`,
        { timeout: 10000 }
      );

      if (ensResponse.data && ensResponse.data.address) {
        return ensResponse.data.address;
      }
    } catch (e) {
      console.error('ENS fallback error:', e.message);
    }

    console.error('ENS resolution error:', error.message);
    return null;
  }
}

/**
 * Fetch transactions from Blockscout API
 */
async function fetchFromBlockscout(address, chain = 'ethereum') {
  const baseUrl = BLOCKSCOUT_URLS[chain] || BLOCKSCOUT_URLS.ethereum;

  try {
    // Fetch transactions
    const txResponse = await axios.get(
      `${baseUrl}/addresses/${address}/transactions`,
      {
        timeout: 20000,
      }
    );

    const transactions = txResponse.data.items || [];

    // Convert Blockscout format to our format
    const normalizedTx = transactions.map((tx) => ({
      hash: tx.hash,
      from: tx.from?.hash || tx.from,
      to: tx.to?.hash || tx.to,
      value: tx.value || '0',
      timeStamp: Math.floor(new Date(tx.timestamp).getTime() / 1000).toString(),
      gasUsed: tx.gas_used || '0',
      gasPrice: tx.gas_price || '0',
      isError: tx.status === 'error' ? '1' : '0',
      txreceipt_status: tx.status === 'ok' ? '1' : '0',
    }));

    // Fetch token transfers
    let tokenTransfers = [];
    try {
      const tokenResponse = await axios.get(
        `${baseUrl}/addresses/${address}/token-transfers`,
        {
          params: { type: 'ERC-20' },
          timeout: 15000,
        }
      );
      tokenTransfers = tokenResponse.data.items || [];
    } catch (e) {
      console.log('Token transfers fetch skipped:', e.message);
    }

    return {
      transactions: normalizedTx,
      internalTransactions: [],
      tokenTransfers: tokenTransfers.map((t) => ({
        hash: t.tx_hash,
        from: t.from?.hash || t.from,
        to: t.to?.hash || t.to,
        value: t.total?.value || '0',
        tokenName: t.token?.name || 'Unknown',
        tokenSymbol: t.token?.symbol || '???',
      })),
      chain,
    };
  } catch (error) {
    console.error(`Blockscout fetch error for ${chain}:`, error.message);
    throw new Error(`Failed to fetch transactions from ${chain}`);
  }
}

/**
 * Fetch Ethereum transactions from Etherscan (with API key)
 */
async function fetchFromEtherscan(address, apiKey, chain = 'ethereum') {
  const chainConfigs = {
    ethereum: { url: 'https://api.etherscan.io/v2/api', chainId: 1 },
    base: { url: 'https://api.basescan.org/api', chainId: null },
    polygon: { url: 'https://api.polygonscan.com/api', chainId: null },
    arbitrum: { url: 'https://api.arbiscan.io/api', chainId: null },
  };

  const config = chainConfigs[chain] || chainConfigs.ethereum;

  try {
    const params = {
      module: 'account',
      action: 'txlist',
      address: address,
      startblock: 0,
      endblock: 99999999,
      page: 1,
      offset: 100,
      sort: 'desc',
      apikey: apiKey,
    };

    // Add chainId for Etherscan v2
    if (config.chainId) {
      params.chainid = config.chainId;
    }

    const txResponse = await axios.get(config.url, {
      params,
      timeout: 15000,
    });

    if (txResponse.data.status !== '1') {
      throw new Error(txResponse.data.message || 'Etherscan API error');
    }

    return {
      transactions: txResponse.data.result || [],
      internalTransactions: [],
      tokenTransfers: [],
      chain,
    };
  } catch (error) {
    console.error(`Etherscan fetch error for ${chain}:`, error.message);
    throw error;
  }
}

/**
 * Main function to fetch transactions based on chain
 */
async function fetchTransactions(address, chain = 'ethereum', apiKeys = {}) {
  // Check if it's an ENS name
  let resolvedAddress = address;
  if (address.endsWith('.eth')) {
    const resolved = await resolveENS(address);
    if (!resolved) {
      throw new Error('Could not resolve ENS name');
    }
    resolvedAddress = resolved;
    console.log(`Resolved ${address} to ${resolvedAddress}`);
  }

  // Normalize address
  resolvedAddress = resolvedAddress.toLowerCase();

  // Check if we have an API key for Etherscan
  const apiKeyMap = {
    ethereum: apiKeys.etherscan,
    base: apiKeys.basescan,
    polygon: apiKeys.polygonscan,
    arbitrum: apiKeys.arbiscan,
  };

  const apiKey = apiKeyMap[chain];

  // If we have an API key, try Etherscan first
  if (apiKey) {
    try {
      return await fetchFromEtherscan(resolvedAddress, apiKey, chain);
    } catch (error) {
      console.log(`Etherscan failed, falling back to Blockscout: ${error.message}`);
    }
  }

  // Default: use Blockscout (free, no API key needed)
  return await fetchFromBlockscout(resolvedAddress, chain);
}

module.exports = {
  fetchTransactions,
  resolveENS,
  KNOWN_EXCHANGES,
};
