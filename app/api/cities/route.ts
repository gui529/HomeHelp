import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rate-limit'

const STATE_ABBREV: Record<string, string> = {
  Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR', California: 'CA',
  Colorado: 'CO', Connecticut: 'CT', Delaware: 'DE', Florida: 'FL', Georgia: 'GA',
  Hawaii: 'HI', Idaho: 'ID', Illinois: 'IL', Indiana: 'IN', Iowa: 'IA',
  Kansas: 'KS', Kentucky: 'KY', Louisiana: 'LA', Maine: 'ME', Maryland: 'MD',
  Massachusetts: 'MA', Michigan: 'MI', Minnesota: 'MN', Mississippi: 'MS', Missouri: 'MO',
  Montana: 'MT', Nebraska: 'NE', Nevada: 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
  'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', Ohio: 'OH',
  Oklahoma: 'OK', Oregon: 'OR', Pennsylvania: 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', Tennessee: 'TN', Texas: 'TX', Utah: 'UT', Vermont: 'VT',
  Virginia: 'VA', Washington: 'WA', 'West Virginia': 'WV', Wisconsin: 'WI', Wyoming: 'WY',
  'District of Columbia': 'DC',
}

interface NominatimItem {
  address?: {
    city?: string
    town?: string
    village?: string
    hamlet?: string
    state?: string
  }
  lat?: string
  lon?: string
}

export async function GET(req: NextRequest) {
  const ip = getClientIp(req)
  if (!checkRateLimit(`cities:${ip}`, 30)) return rateLimitResponse()

  const q = req.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 2) {
    return NextResponse.json({ cities: [] })
  }

  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('q', q)
  url.searchParams.set('format', 'json')
  url.searchParams.set('addressdetails', '1')
  url.searchParams.set('countrycodes', 'us')
  url.searchParams.set('limit', '10')

  try {
    const res = await fetch(url.toString(), {
      headers: { 'User-Agent': 'QuickProList/1.0 (contact: admin@quickprolist.com)' },
      next: { revalidate: 86400 },
    })
    if (!res.ok) throw new Error(`Nominatim ${res.status}`)
    const data = (await res.json()) as NominatimItem[]

    const seen = new Set<string>()
    const cities: { label: string; value: string }[] = []
    for (const item of data) {
      const a = item.address ?? {}
      const cityName = a.city ?? a.town ?? a.village ?? a.hamlet
      if (!cityName || !a.state) continue
      const stateCode = STATE_ABBREV[a.state] ?? a.state
      const label = `${cityName}, ${stateCode}`
      if (seen.has(label)) continue
      seen.add(label)
      cities.push({ label, value: label })
    }
    return NextResponse.json({ cities })
  } catch (err) {
    console.error('city autocomplete failed:', err)
    return NextResponse.json({ cities: [], error: 'autocomplete unavailable' }, { status: 502 })
  }
}
