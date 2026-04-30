import { getBusinessById, searchBusinesses, type Business, type SearchLocation } from './yelp'
import { getCurated, getCuratedById, normalizeCity } from './kv'
import { CATEGORIES } from './categories'

export const MAX_RESULTS = 5

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export function isUuid(s: string): boolean {
  return UUID_RE.test(s)
}

export async function resolveHighlight(id: string): Promise<Business | null> {
  if (isUuid(id)) return getCuratedById(id)
  return getBusinessById(id)
}

export async function getMergedResults(
  where: SearchLocation,
  category: string,
  options: { highlightId?: string } = {}
): Promise<Business[]> {
  const term = CATEGORIES.find((c) => c.value === category)?.term ?? category
  const city = 'location' in where ? normalizeCity(where.location) : ''

  const highlight = options.highlightId ? await resolveHighlight(options.highlightId) : null

  const curated = city ? await getCurated(category, city) : []

  const targetSize = highlight ? MAX_RESULTS - 1 : MAX_RESULTS
  let merged: Business[]

  if (curated.length >= targetSize) {
    merged = curated.slice(0, targetSize)
  } else {
    const yelp = await searchBusinesses(where, category, term, MAX_RESULTS)
    const curatedYelpIds = new Set(curated.map((b) => b.yelpId).filter(Boolean) as string[])
    const yelpFiltered = yelp.filter((b) => !curatedYelpIds.has(b.id))
    merged = [...curated, ...yelpFiltered.slice(0, targetSize - curated.length)]
  }

  const sliced = !highlight
    ? merged.slice(0, MAX_RESULTS)
    : (() => {
        const highlightYelp = highlight.yelpId ?? (highlight.source === 'yelp' ? highlight.id : undefined)
        const deduped = merged.filter((b) => {
          if (b.id === highlight.id) return false
          const bYelp = b.yelpId ?? (b.source === 'yelp' ? b.id : undefined)
          if (highlightYelp && bYelp && highlightYelp === bYelp) return false
          return true
        })
        return [highlight, ...deduped].slice(0, MAX_RESULTS)
      })()

  return sliced
}
