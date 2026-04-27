import { searchBusinesses, type SearchLocation } from '@/lib/yelp'
import { getFeaturedIds } from '@/lib/kv'
import { CATEGORIES } from '@/lib/categories'
import SearchResultsClient from './SearchResultsClient'
import Link from 'next/link'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ location?: string; category?: string; lat?: string; lng?: string }>
}) {
  const { location, category, lat, lng } = await searchParams

  const hasCoords = lat && lng && !Number.isNaN(Number(lat)) && !Number.isNaN(Number(lng))

  if (!category || (!location && !hasCoords)) {
    return (
      <div className="text-center py-24">
        <p className="text-4xl mb-3">🤔</p>
        <p className="text-slate-700 font-medium">Missing search parameters.</p>
        <Link href="/" className="mt-3 inline-block text-sm font-medium text-amber-700 hover:text-amber-800">
          ← Back to search
        </Link>
      </div>
    )
  }

  const cat = CATEGORIES.find((c) => c.value === category)
  const term = cat?.term ?? category
  const where: SearchLocation = hasCoords
    ? { latitude: Number(lat), longitude: Number(lng) }
    : { location: location! }

  const businesses = await searchBusinesses(where, category, term).catch(() => null)
  const featuredIds = await getFeaturedIds()

  if (!businesses) {
    return (
      <div className="text-center py-24">
        <p className="text-4xl mb-3">⚠️</p>
        <p className="text-slate-700 font-medium">Failed to load results.</p>
        <Link href="/" className="mt-3 inline-block text-sm font-medium text-amber-700 hover:text-amber-800">
          ← Try again
        </Link>
      </div>
    )
  }

  const featured = businesses.filter((b) => featuredIds.has(b.id))
  const regular = businesses.filter((b) => !featuredIds.has(b.id))
  const label = cat?.label ?? category.replace(/([a-z])([A-Z])/g, '$1 $2')
  const locationLabel = hasCoords ? 'your location' : location

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3 min-w-0">
          {cat?.icon && (
            <span className="grid place-items-center h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-slate-900 text-white text-lg sm:text-xl flex-shrink-0">
              {cat.icon}
            </span>
          )}
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 capitalize tracking-tight truncate">
              {label}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 truncate">
              {businesses.length} results near <span className="font-medium text-slate-700">{locationLabel}</span>
            </p>
          </div>
        </div>
        <Link
          href="/"
          aria-label="New search"
          className="flex-shrink-0 text-sm font-medium text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">New search</span>
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
