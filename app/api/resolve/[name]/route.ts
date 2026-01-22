import { NextRequest, NextResponse } from 'next/server'
import { resolveENS } from '@/lib/fetcher'

export async function GET(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const { name } = params

    if (!name.endsWith('.eth')) {
      return NextResponse.json({ error: 'Invalid ENS name' }, { status: 400 })
    }

    const address = await resolveENS(name)

    if (!address) {
      return NextResponse.json({ error: 'Could not resolve ENS name' }, { status: 404 })
    }

    return NextResponse.json({ name, address })
  } catch (error) {
    console.error('ENS resolution error:', error)
    return NextResponse.json({ error: 'Failed to resolve ENS name' }, { status: 500 })
  }
}
