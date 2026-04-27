import { NextRequest, NextResponse } from 'next/server'
import { searchBusinesses, type SearchLocation } from '@/lib/yelp'
import { CATEGORIES } from '@/lib/categories'

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const location = sp.get('location')?.trim()
  const lat = sp.get('lat')
  const lng = sp.get('lng')
  const category = sp.get('category')?.trim()

  if (!category) {
    return NextResponse.json({ error: 'category is required' }, { status: 400 })
  }

  let where: SearchLocation
  if (lat && lng) {
    const latitude = Number(lat)
    const longitude = Number(lng)
    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return NextResponse.json({ error: 'invalid coordinates' }, { status: 400 })
    }
    where = { latitude, longitude }
  } else if (location) {
    where = { location }
  } else {
    return NextResponse.json({ error: 'location or lat/lng is required' }, { status: 400 })
  }

  const term = CATEGORIES.find((c) => c.value === category)?.term ?? category

  try {
    const businesses = await searchBusinesses(where, category, term)
    return NextResponse.json({ businesses })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 502 })
  }
}
