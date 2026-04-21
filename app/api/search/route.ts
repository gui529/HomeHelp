import { NextRequest, NextResponse } from 'next/server'
import { searchBusinesses } from '@/lib/yelp'

export async function GET(req: NextRequest) {
  const location = req.nextUrl.searchParams.get('location')?.trim()
  const category = req.nextUrl.searchParams.get('category')?.trim()

  if (!location || !category) {
    return NextResponse.json({ error: 'location and category are required' }, { status: 400 })
  }

  try {
    const businesses = await searchBusinesses(location, category)
    return NextResponse.json({ businesses })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 502 })
  }
}
