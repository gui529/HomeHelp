'use client'

import { useState } from 'react'
import BusinessCard from '@/components/BusinessCard'
import { CATEGORIES } from '@/lib/categories'
import type { Business } from '@/lib/yelp'

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState('')

  const [location, setLocation] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0].value)
  const [results, setResults] = useState<Business[]>([])
  const [featuredIds, setFeaturedIds] = useState<Set<string>>(new Set())
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      setAuthed(true)
      loadFeatured()
    } else {
      setAuthError('Wrong password')
    }
  }

  async function loadFeatured() {
    const res = await fetch('/api/featured')
    const data = await res.json()
    setFeaturedIds(new Set(data.ids as string[]))
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!location.trim()) return
    setSearching(true)
    setSearchError('')
    const res = await fetch(
      `/api/search?location=${encodeURIComponent(location)}&category=${category}`
    )
    const data = await res.json()
    if (!res.ok) {
      setSearchError(data.error ?? 'Search failed')
    } else {
      setResults(data.businesses)
    }
    setSearching(false)
  }

  async function toggleFeatured(id: string) {
    const action = featuredIds.has(id) ? 'remove' : 'add'
    const res = await fetch('/api/featured', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${password}`,
      },
      body: JSON.stringify({ id, action }),
    })
    if (res.ok) {
      const next = new Set(featuredIds)
      if (action === 'add') next.add(id)
      else next.delete(id)
      setFeaturedIds(next)
    }
  }

  if (!authed) {
    return (
      <div className="flex items-center justify-center pt-20">
        <form
          onSubmit={handleLogin}
          className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm p-7 w-full max-w-sm flex flex-col gap-4"
        >
          <div className="flex items-center gap-3">
            <span className="grid place-items-center h-10 w-10 rounded-xl bg-slate-900 text-white">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 1 1 10 0v4" />
              </svg>
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">Admin Login</h2>
              <p className="text-xs text-slate-500">Manage featured listings</p>
            </div>
          </div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl ring-1 ring-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
            required
          />
          {authError && <p className="text-sm text-rose-600">{authError}</p>}
          <button
            type="submit"
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Login
          </button>
        </form>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Manage Featured Listings
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Featured pros appear at the top of search results.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs bg-amber-50 text-amber-800 ring-1 ring-amber-200 font-semibold px-3 py-1.5 rounded-full">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          {featuredIds.size} featured
        </span>
      </div>

      <form
        onSubmit={handleSearch}
        className="bg-white rounded-2xl ring-1 ring-slate-200 p-3 mb-8 flex flex-col sm:flex-row gap-2"
      >
        <input
          type="text"
          placeholder="City or ZIP"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="flex-1 rounded-xl ring-1 ring-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
          required
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl ring-1 ring-slate-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
        >
          {CATEGORIES.map(({ label, value }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <button
          type="submit"
          disabled={searching}
          className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
        >
          {searching ? 'Searching…' : 'Search'}
        </button>
      </form>

      {searchError && <p className="text-sm text-rose-600 mb-4">{searchError}</p>}

      <div className="flex flex-col gap-4">
        {results.map((b) => {
          const isFeatured = featuredIds.has(b.id)
          return (
            <div key={b.id} className="flex items-stretch gap-3">
              <div className="flex-1">
                <BusinessCard business={b} isFeatured={isFeatured} />
              </div>
              <button
                onClick={() => toggleFeatured(b.id)}
                className={`flex-shrink-0 self-center px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                  isFeatured
                    ? 'bg-amber-500 text-white hover:bg-amber-600'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {isFeatured ? '★ Featured' : '☆ Feature'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
