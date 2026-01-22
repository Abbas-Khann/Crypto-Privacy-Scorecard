const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

/**
 * Analyze a wallet address across all supported chains
 */
export async function analyzeWallet(address) {
  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ address }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || 'Failed to analyze wallet');
  }

  return response.json();
}

/**
 * Resolve an ENS name to an address
 */
export async function resolveENS(name) {
  const response = await fetch(`${API_BASE_URL}/api/resolve/${encodeURIComponent(name)}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || 'Failed to resolve ENS');
  }

  return response.json();
}

/**
 * Get supported chains
 */
export async function getSupportedChains() {
  const response = await fetch(`${API_BASE_URL}/api/chains`);

  if (!response.ok) {
    throw new Error('Failed to fetch chains');
  }

  return response.json();
}

/**
 * Health check
 */
export async function healthCheck() {
  const response = await fetch(`${API_BASE_URL}/api/health`);
  return response.ok;
}
