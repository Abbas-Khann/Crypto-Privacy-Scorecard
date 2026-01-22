import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    chains: [
      { id: 'ethereum', name: 'Ethereum', icon: '⟠' },
      { id: 'base', name: 'Base', icon: '🔵' },
      { id: 'polygon', name: 'Polygon', icon: '💜' },
      { id: 'arbitrum', name: 'Arbitrum', icon: '🔷' },
    ],
  })
}
