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
        <form onSubmit={handleLogin} className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-sm flex flex-col gap-4">
          <h2 className="text-xl font-bold text-gray-900">Admin Login</h2>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl border-2 border-gray-200 px-4 py-3 focus:outline-none focus:border-blue-500"
            required
          />
          {authError && <p className="text-sm text-red-500">{authError}</p>}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Login
          </button>
        </form>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Admin — Manage Featured Listings</h2>
        <span className="text-xs bg-green-100 text-green-700 font-medium px-3 py-1 rounded-full">
          {featuredIds.size} featured
        </span>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <input
          type="text"
          placeholder="City or ZIP"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="flex-1 rounded-xl border-2 border-gray-200 px-4 py-2.5 focus:outline-none focus:border-blue-500 bg-white"
          required
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border-2 border-gray-200 px-3 py-2.5 focus:outline-none focus:border-blue-500 bg-white"
        >
          {CATEGORIES.map(({ label, value }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <button
          type="submit"
          disabled={searching}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
        >
          {searching ? 'Searching…' : 'Search'}
        </button>
      </form>

      {searchError && <p className="text-sm text-red-500 mb-4">{searchError}</p>}

      <div className="flex flex-col gap-4">
        {results.map((b) => (
          <div key={b.id} className="flex items-stretch gap-3">
            <div className="flex-1">
              <BusinessCard business={b} isFeatured={featuredIds.has(b.id)} />
            </div>
            <button
              onClick={() => toggleFeatured(b.id)}
              className={`flex-shrink-0 self-center px-4 py-2 rounded-xl font-semibold text-sm transition-colors ${
                featuredIds.has(b.id)
                  ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-2 border-yellow-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-200'
              }`}
            >
              {featuredIds.has(b.id) ? '★ Featured' : '☆ Feature'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
