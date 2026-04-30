import { NextRequest, NextResponse } from 'next/server'
import { getInvitationByToken } from '@/lib/invitations'
import { createCheckoutSession } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const token = body.token

  if (!token) {
    return NextResponse.json({ error: 'token is required' }, { status: 400 })
  }

  try {
    const invitation = await getInvitationByToken(token)
    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    if (invitation.status === 'expired') {
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 410 })
    }

    if (invitation.status === 'paid') {
      return NextResponse.json({ error: 'Invitation already paid' }, { status: 400 })
    }

    const returnUrl = `${req.headers.get('origin')}/enroll/${token}`
    const checkoutUrl = await createCheckoutSession(
      token,
      invitation.business_name,
      invitation.monthly_price,
      returnUrl
    )

    if (!checkoutUrl) {
      return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
    }

    return NextResponse.json({ checkoutUrl })
  } catch (err) {
    console.error('checkout failed:', err)
    const msg = err instanceof Error ? err.message : 'Failed to create checkout'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
