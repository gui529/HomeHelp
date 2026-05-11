import { NextRequest, NextResponse } from 'next/server'
import { AuthError, requireAdmin } from '@/lib/auth'
import { listCampaignContacts } from '@/lib/campaigns'

async function gate(): Promise<NextResponse | null> {
  try {
    await requireAdmin()
    return null
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    throw err
  }
}

export async function GET(_req: NextRequest) {
  const denied = await gate()
  if (denied) return denied
  try {
    const contacts = await listCampaignContacts()
    return NextResponse.json({ contacts })
  } catch (err) {
    console.error('campaigns GET failed:', err)
    return NextResponse.json({ error: 'Failed to load campaign contacts' }, { status: 500 })
  }
}
