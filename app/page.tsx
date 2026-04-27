'use client'

import { useEffect, useState } from 'react'
import { CATEGORIES } from '@/lib/categories'
import BusinessCard from '@/components/BusinessCard'
import ListBusinessSection from '@/components/ListBusinessSection'
import type { Business } from '@/lib/yelp'

type Coords = { lat: number; lng: number }
type SavedLocation = { text: string; coords?: Coords }

const LOCATION_KEY = 'homehelp:lastLocation'

function getStarred(): Record<string, Business> {
  try { return JSON.parse(localStorage.getItem('starred') ?? '{}') } catch { return {} }
}
function setStarredStorage(data: Record<string, Business>) {
  localStorage.setItem('starred', JSON.stringify(data))
}

function loadSavedLocation(): SavedLocation | null {
  try {
    const raw = localStorage.getItem(LOCATION_KEY)
    return raw ? (JSON.parse(raw) as SavedLocation) : null
  } catch { return null }
}
function saveLocation(loc: SavedLocation) {
  localStorage.setItem(LOCATION_KEY, JSON.stringify(loc))
}

export default function HomePage() {
  const [location, setLocation] = useState('')
  const [coords, setCoords] = useState<Coords | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [results, setResults] = useState<Business[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set())
  const [geoLoading, setGeoLoading] = useState(false)

  // Restore last location on mount
  useEffect(() => {
    const saved = loadSavedLocation()
    if (saved) {
      setLocation(saved.text)
      if (saved.coords) setCoords(saved.coords)
    }
  }, [])

  function useMyLocation() {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported in this browser.')
      return
    }
    setError('')
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setCoords(c)
        const text = 'your location'
        setLocation(text)
        saveLocation({ text, coords: c })
        setGeoLoading(false)
      },
      (err) => {
        setGeoLoading(false)
        if (err.code === err.PERMISSION_DENIED) {
          setError('Location permission denied. You can still type a city or ZIP.')
        } else {
          setError('Could not get your location. Try typing a city or ZIP.')
        }
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 }
    )
  }

  async function handleCategoryClick(value: string) {
    const hasCoords = !!coords && location === 'your location'
    const hasText = location.trim().length > 0 && !hasCoords
    if (!hasCoords && !hasText) {
      setError('Enter a city or ZIP, or use your location.')
      return
    }
    setError('')
    setActiveCategory(value)
    setLoading(true)
    setResults([])

    const params = new URLSearchParams({ category: value })
    if (hasCoords && coords) {
      params.set('lat', String(coords.lat))
      params.set('lng', String(coords.lng))
    } else {
      params.set('location', location.trim())
      saveLocation({ text: location.trim() })
    }

    const res = await fetch(`/api/search?${params.toString()}`)
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Something went wrong.')
    } else {
      setResults(data.businesses.slice(0, 5))
      const saved = getStarred()
      setStarredIds(new Set(Object.keys(saved)))
    }
    setLoading(false)
  }

  function handleStarToggle(business: Business, starred: boolean) {
    const saved = getStarred()
    if (starred) saved[business.id] = business
    else delete saved[business.id]
    setStarredStorage(saved)
    setStarredIds(new Set(Object.keys(saved)))
  }

  const activeCat = CATEGORIES.find((c) => c.value === activeCategory)
  const usingGeo = !!coords && location === 'your location'

  return (
    <div className="-mx-4 sm:-mx-6 -mt-6 sm:-mt-8">
      {/* Hero */}
      <section className="relative hero-bg overflow-hidden">
        <div className="absolute inset-0 grid-dots opacity-60 pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-16 sm:pt-14 sm:pb-20">
          <div className="flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 ring-1 ring-slate-200 px-3 py-1 text-[11px] font-medium text-slate-600 shadow-sm backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Trusted local pros
            </span>
            <h1 className="mt-4 sm:mt-5 text-[28px] leading-[1.15] sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 max-w-3xl px-2">
              The right hand for every{' '}
              <span className="relative inline-block whitespace-nowrap">
                <span className="relative z-10">home project</span>
                <span className="absolute inset-x-0 bottom-0.5 sm:bottom-1 h-2 sm:h-3 bg-amber-300/50 rounded-sm -z-0" />
              </span>
              .
            </h1>
            <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-slate-500 max-w-xl px-2">
              Plumbers, electricians, HVAC and more — find top-rated pros nearby in seconds.
            </p>

            {/* Search bar */}
            <div className="mt-6 sm:mt-8 w-full max-w-xl">
              <div className="relative flex items-center bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-amber-400 transition">
                <span className="pl-3 sm:pl-4 pr-1 sm:pr-2 text-slate-400 flex-shrink-0">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </span>
                <input
                  type="text"
                  inputMode="text"
                  autoComplete="postal-code"
                  placeholder="City, ZIP, or use your location"
                  value={usingGeo ? '' : location}
                  onChange={(e) => {
                    setLocation(e.target.value)
                    setCoords(null)
                    setError('')
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter' && activeCategory) handleCategoryClick(activeCategory) }}
                  className="flex-1 min-w-0 bg-transparent py-3.5 sm:py-4 text-base text-slate-900 placeholder-slate-400 focus:outline-none"
                />

                {usingGeo && (
                  <span className="hidden sm:inline-flex items-center gap-1 mr-1.5 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 text-xs font-medium px-2 py-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Using your location
                  </span>
                )}

                <button
                  type="button"
                  onClick={useMyLocation}
                  disabled={geoLoading}
                  aria-label="Use my location"
                  title="Use my location"
                  className={`m-1.5 inline-flex items-center justify-center h-10 w-10 rounded-xl transition-colors flex-shrink-0 ${
                    usingGeo
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300'
                  } disabled:opacity-50`}
                >
                  {geoLoading ? (
                    <svg viewBox="0 0 24 24" className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M21 12a9 9 0 1 1-6.2-8.55" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                    </svg>
                  )}
                </button>

                {activeCategory && (
                  <button
                    onClick={() => handleCategoryClick(activeCategory)}
                    className="my-1.5 mr-1.5 inline-flex items-center gap-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-3 sm:px-4 py-2.5 transition-colors flex-shrink-0"
                  >
                    Search
                  </button>
                )}
              </div>

              {usingGeo && (
                <p className="sm:hidden mt-2 inline-flex items-center gap-1 text-xs text-emerald-700 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Using your location
                </p>
              )}

              {error && (
                <p className="mt-3 text-sm text-rose-600 flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4M12 16h.01" />
                  </svg>
                  {error}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 -mt-6 sm:-mt-10 relative">
        <div className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-[0_10px_40px_rgba(15,23,42,0.06)] p-4 sm:p-6">
          <div className="flex items-baseline justify-between mb-3 sm:mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Pick a category</h2>
            <span className="text-xs text-slate-500">{CATEGORIES.length} services</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-10 gap-2 sm:gap-2.5">
            {CATEGORIES.map(({ label, value, icon }) => {
              const active = activeCategory === value
              return (
                <button
                  key={value}
                  onClick={() => handleCategoryClick(value)}
                  className={`group relative flex flex-col items-center gap-1.5 sm:gap-2 px-1.5 py-3 sm:px-2 sm:py-4 rounded-xl text-[11.5px] sm:text-[12.5px] font-medium transition-all cursor-pointer ${
                    active
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-slate-50 active:bg-slate-100 hover:bg-white hover:ring-1 hover:ring-slate-200 hover:shadow-sm text-slate-700'
                  }`}
                >
                  <span className="text-xl sm:text-2xl transition-transform group-hover:scale-110">
                    {icon}
                  </span>
                  <span className="text-center leading-tight break-words">{label}</span>
                  {active && (
                    <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-amber-400" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-8 sm:mt-10 pb-16 sm:pb-20">
        {(loading || results.length > 0) && (
          <div className="w-full max-w-3xl mx-auto">
            <div className="flex items-baseline justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">
                {loading
                  ? 'Searching nearby pros…'
                  : `Top ${results.length} ${activeCat?.label ?? ''}`}
              </h3>
              {!loading && location && (
                <span className="text-xs text-slate-500">near {usingGeo ? 'you' : location}</span>
              )}
            </div>
            {loading ? (
              <div className="flex flex-col gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-40 skeleton rounded-2xl" />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {results.map((b) => (
                  <BusinessCard
                    key={b.id}
                    business={b}
                    initialStarred={starredIds.has(b.id)}
                    onStarToggle={handleStarToggle}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {!loading && results.length === 0 && (
          <div className="mt-12 grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {[
              { icon: '🛡️', title: 'Verified ratings', body: 'Real reviews from your neighbors via Yelp.' },
              { icon: '⚡', title: 'Fast results', body: 'Top-matched local pros in under a second.' },
              { icon: '⭐', title: 'Save favorites', body: 'Star pros you trust and revisit them anytime.' },
            ].map((f) => (
              <div key={f.title} className="bg-white/70 rounded-2xl ring-1 ring-slate-200 p-5">
                <div className="text-2xl">{f.icon}</div>
                <p className="mt-2 text-sm font-semibold text-slate-900">{f.title}</p>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <ListBusinessSection />
    </div>
  )
}
