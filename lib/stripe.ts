import Stripe from 'stripe'

let stripeClient: Stripe | null = null

export function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY not configured')
    stripeClient = new Stripe(key)
  }
  return stripeClient
}

export async function createCheckoutSession(
  invitationToken: string,
  businessName: string,
  monthlyPrice: number,
  returnUrl: string
): Promise<string> {
  const stripe = getStripe()
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(monthlyPrice * 100),
          recurring: { interval: 'month' },
          product_data: {
            name: `${businessName} - QuickProList Featured Listing`,
            metadata: { invitationToken },
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${returnUrl}?success=1`,
    cancel_url: returnUrl,
    metadata: { invitationToken },
  })
  return session.url || ''
}
