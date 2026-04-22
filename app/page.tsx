'use client'

import { useState } from 'react'
import { CATEGORIES } from '@/lib/categories'
import BusinessCard from '@/components/BusinessCard'
import type { Business } from '@/lib/yelp'

function getStarred(): Record<string, Business> {
  try { return JSON.parse(localStorage.getItem('starred') ?? '{}') } catch { return {} }
}
function setStarredStorage(data: Record<string, Business>) {
  localStorage.setItem('starred', JSON.stringify(data))
}

export default function HomePage() {
  const [location, setLocation] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [results, setResults] = useState<Business[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set())

  async function handleCategoryClick(value: string) {
    if (!location.trim()) {
      setError('Enter a city or ZIP first.')
      return
    }
    setError('')
    setActiveCategory(value)
    setLoading(true)
    setResults([])

    const res = await fetch(
      `/api/search?location=${encodeURIComponent(location.trim())}&category=${value}`
    )
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

  return (
    <div className="flex flex-col items-center pt-12 pb-20">
      <h1 className="text-4xl font-bold text-gray-900 text-center">
        Find Home Services Near You
      </h1>
      <p className="mt-3 text-lg text-gray-500 text-center max-w-md">
        Plumbers, electricians, HVAC, and more — trusted local pros in your area.
      </p>

      <div className="mt-10 w-full max-w-lg flex gap-3">
        <input
          type="text"
          placeholder="City or ZIP code"
          value={location}
          onChange={(e) => { setLocation(e.target.value); setError('') }}
          onKeyDown={(e) => { if (e.key === 'Enter' && activeCategory) handleCategoryClick(activeCategory) }}
          className="flex-1 rounded-xl border-2 border-gray-200 px-4 py-3 text-base focus:outline-none focus:border-blue-500 bg-white"
        />
      </div>

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      <div className="mt-8 w-full max-w-2xl">
        <p className="text-sm font-medium text-gray-500 mb-3">Pick a category</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {CATEGORIES.map(({ label, value, icon }) => (
            <button
              key={value}
              onClick={() => handleCategoryClick(value)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-sm font-medium cursor-pointer ${
                activeCategory === value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <span className="text-2xl">{icon}</span>
              <span className="text-center leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {(loading || results.length > 0) && (
        <div className="mt-10 w-full max-w-2xl">
          <p className="text-sm font-semibold text-gray-700 mb-4">
            {loading
              ? 'Loading…'
              : `Top ${results.length} ${activeCat?.label ?? ''} near ${location}`}
          </p>
          {loading ? (
            <div className="flex flex-col gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
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
    </div>
  )
}
