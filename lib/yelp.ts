export interface Business {
  id: string
  name: string
  rating: number
  reviewCount: number
  phone: string
  address: string
  imageUrl: string
  url: string
  categories: string[]
}

export type SearchLocation = { location: string } | { latitude: number; longitude: number }

export async function searchBusinesses(
  where: SearchLocation,
  category: string,
  term: string,
  limit = 20
): Promise<Business[]> {
  const params = new URLSearchParams({
    categories: category,
    term,
    limit: String(limit),
    sort_by: 'best_match',
  })

  if ('location' in where) {
    params.set('location', where.location)
  } else {
    params.set('latitude', String(where.latitude))
    params.set('longitude', String(where.longitude))
  }

  const res = await fetch(
    `https://api.yelp.com/v3/businesses/search?${params}`,
    {
      headers: { Authorization: `Bearer ${process.env.YELP_API_KEY}` },
      next: { revalidate: 300 },
    }
  )

  if (!res.ok) throw new Error(`Yelp API error: ${res.status}`)

  const data = await res.json()

  return (data.businesses ?? []).map((b: Record<string, unknown>) => ({
    id: b.id,
    name: b.name,
    rating: b.rating,
    reviewCount: b.review_count,
    phone: b.display_phone ?? '',
    address: (b.location as Record<string, string[]>)?.display_address?.join(', ') ?? '',
    imageUrl: b.image_url ?? '',
    url: b.url ?? '',
    categories: ((b.categories as { title: string }[]) ?? []).map((c) => c.title),
  }))
}
