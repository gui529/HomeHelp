'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import CategoryGrid from '@/components/CategoryGrid'
import { CATEGORIES } from '@/lib/categories'

export default function HomePage() {
  const router = useRouter()
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0].value)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!location.trim()) return
    router.push(`/search?location=${encodeURIComponent(location.trim())}&category=${category}`)
  }

  return (
    <div className="flex flex-col items-center pt-12 pb-20">
      <h1 className="text-4xl font-bold text-gray-900 text-center">
        Find Home Services Near You
      </h1>
      <p className="mt-3 text-lg text-gray-500 text-center max-w-md">
        Plumbers, electricians, HVAC, and more — trusted local pros in your area.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 w-full max-w-lg flex gap-3">
        <input
          type="text"
          placeholder="City or ZIP code"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="flex-1 rounded-xl border-2 border-gray-200 px-4 py-3 text-base focus:outline-none focus:border-blue-500 bg-white"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          Search
        </button>
      </form>

      <div className="mt-10 w-full max-w-2xl">
        <p className="text-sm font-medium text-gray-500 mb-2">Select a category</p>
        <CategoryGrid onSelect={setCategory} selected={category} />
      </div>
    </div>
  )
}
