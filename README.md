# Crypto Privacy Scorecard

Analyze your crypto wallet's privacy vulnerabilities in seconds. Get actionable insights to improve your on-chain privacy.

## Features

- **Privacy Score** - Get a 0-100 score with letter grade (A+ to F)
- **Issue Detection** - Identifies 6 types of privacy vulnerabilities:
  - Address Reuse
  - Round Number Transactions
  - Exchange Interactions
  - Timing Patterns
  - Dust Attacks
  - Value Distribution Patterns
- **Multi-Chain Support** - Ethereum, Base, Polygon, Arbitrum
- **ENS Resolution** - Enter ENS names like `vitalik.eth`
- **Timeline Visualization** - See how your privacy score changes over time

## Tech Stack

**Frontend:**
- React + Vite
- Tailwind CSS
- Framer Motion (animations)
- Recharts (charts)
- Lucide React (icons)

**Backend:**
- Node.js + Express
- Blockscout API (free, no key required)
- Optional: Etherscan API for higher rate limits

## Quick Start

### 1. Clone and Install

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Start the Servers

```bash
# Terminal 1: Start backend (port 5001)
cd server
npm start

# Terminal 2: Start frontend (port 5173)
npm run dev
```

### 3. Open the App

Visit [http://localhost:5173](http://localhost:5173)

## API Keys (Optional)

For higher rate limits, add API keys to `server/.env`:

```env
ETHERSCAN_API_KEY=your_key_here
BASESCAN_API_KEY=your_key_here
POLYGONSCAN_API_KEY=your_key_here
ARBISCAN_API_KEY=your_key_here
```

Get free API keys from:
- [Etherscan](https://etherscan.io/apis)
- [Basescan](https://basescan.org/apis)
- [Polygonscan](https://polygonscan.com/apis)
- [Arbiscan](https://arbiscan.io/apis)

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/analyze` | POST | Analyze wallet privacy |
| `/api/resolve/:name` | GET | Resolve ENS name |
| `/api/chains` | GET | Get supported chains |

### Analyze Request

```bash
curl -X POST http://localhost:5001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"address": "vitalik.eth", "chain": "ethereum"}'
```

### Response Format

```json
{
  "score": 70,
  "grade": "B",
  "issues": [
    {
      "title": "Address Reuse",
      "severity": "warning",
      "points": -10,
      "description": "...",
      "whyMatters": "...",
      "howToFix": ["..."]
    }
  ],
  "timeline": [
    { "date": "Jan 15", "score": 75 }
  ],
  "stats": {
    "totalTransactions": 100,
    "uniqueAddresses": 45,
    "chain": "ethereum"
  }
}
```

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── ComparisonBar.jsx
│   │   ├── IssueCard.jsx
│   │   ├── ScoreCircle.jsx
│   │   ├── TimelineChart.jsx
│   │   └── Toast.jsx
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── LoadingPage.jsx
│   │   └── ResultsPage.jsx
│   ├── utils/
│   │   └── api.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── server/
│   ├── utils/
│   │   ├── analyzer.js
│   │   └── fetcher.js
│   ├── index.js
│   ├── .env
│   └── package.json
├── index.html
├── package.json
└── README.md
```

## Production Build

```bash
# Build frontend
npm run build

# The build output will be in /dist
```

## License

MIT
# Crypto-Privacy-Scorecard
