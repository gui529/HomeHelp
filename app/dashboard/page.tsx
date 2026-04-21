'use client'

import { useEffect, useState } from 'react'
import BusinessCard from '@/components/BusinessCard'
import type { Business } from '@/lib/yelp'
import Link from 'next/link'

function getStarred(): Record<string, Business> {
  try {
    return JSON.parse(localStorage.getItem('starred') ?? '{}')
  } catch {
    return {}
  }
}

function setStarredStorage(data: Record<string, Business>) {
  localStorage.setItem('starred', JSON.stringify(data))
}

export default function DashboardPage() {
  const [starred, setStarred] = useState<Business[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const saved = getStarred()
    setStarred(Object.values(saved))
    setLoaded(true)
  }, [])

  function handleStarToggle(business: Business, isStarred: boolean) {
    const saved = getStarred()
    if (isStarred) {
      saved[business.id] = business
    } else {
      delete saved[business.id]
    }
    setStarredStorage(saved)
    setStarred(Object.values(saved))
  }

  if (!loaded) return null

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">My Favorites</h2>
      {starred.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-4">⭐</p>
          <p className="text-lg font-medium">No favorites yet</p>
          <p className="text-sm mt-2">
            Star businesses during a{' '}
            <Link href="/" className="text-blue-600 hover:underline">
              search
            </Link>{' '}
            to save them here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {starred.map((b) => (
            <BusinessCard
              key={b.id}
              business={b}
              initialStarred
              onStarToggle={handleStarToggle}
            />
          ))}
        </div>
      )}
    </div>
  )
}
