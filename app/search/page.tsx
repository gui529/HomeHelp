import { searchBusinesses } from '@/lib/yelp'
import { getFeaturedIds } from '@/lib/kv'
import { CATEGORIES } from '@/lib/categories'
import SearchResultsClient from './SearchResultsClient'
import Link from 'next/link'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ location?: string; category?: string }>
}) {
  const { location, category } = await searchParams

  if (!location || !category) {
    return (
      <div className="text-center py-20 text-gray-500">
        Missing search parameters.{' '}
        <Link href="/" className="text-blue-600 hover:underline">Go back</Link>
      </div>
    )
  }

  const term = CATEGORIES.find((c) => c.value === category)?.term ?? category
  let businesses = await searchBusinesses(location, category, term).catch(() => null)
  const featuredIds = await getFeaturedIds()

  if (!businesses) {
    return (
      <div className="text-center py-20 text-gray-500">
        Failed to load results. Please try again.{' '}
        <Link href="/" className="text-blue-600 hover:underline">Go back</Link>
      </div>
    )
  }

  const featured = businesses.filter((b) => featuredIds.has(b.id))
  const regular = businesses.filter((b) => !featuredIds.has(b.id))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 capitalize">
            {category.replace(/([a-z])([A-Z])/g, '$1 $2')} near {location}
          </h2>
          <p className="text-sm text-gray-500 mt-1">{businesses.length} results</p>
        </div>
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          ← New search
        </Link>
      </div>

      <SearchResultsClient
        featured={featured}
        regular={regular}
        featuredIds={Array.from(featuredIds)}
      />
    </div>
  )
}
