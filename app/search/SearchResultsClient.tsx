'use client'

import { useEffect, useState } from 'react'
import BusinessCard from '@/components/BusinessCard'
import type { Business } from '@/lib/yelp'

interface Props {
  featured: Business[]
  regular: Business[]
  featuredIds: string[]
}

function getStarred(): Record<string, Business> {
  try {
    return JSON.parse(localStorage.getItem('starred') ?? '{}')
  } catch {
    return {}
  }
}

function setStarred(data: Record<string, Business>) {
  localStorage.setItem('starred', JSON.stringify(data))
}

export default function SearchResultsClient({ featured, regular, featuredIds }: Props) {
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const saved = getStarred()
    setStarredIds(new Set(Object.keys(saved)))
  }, [])

  function handleStarToggle(business: Business, starred: boolean) {
    const saved = getStarred()
    if (starred) {
      saved[business.id] = business
    } else {
      delete saved[business.id]
    }
    setStarred(saved)
    setStarredIds(new Set(Object.keys(saved)))
  }

  const featuredSet = new Set(featuredIds)

  return (
    <div className="flex flex-col gap-4">
      {featured.length > 0 && (
        <>
          <p className="text-xs font-semibold text-yellow-600 uppercase tracking-wide">
            Featured
          </p>
          {featured.map((b) => (
            <BusinessCard
              key={b.id}
              business={b}
              isFeatured
              initialStarred={starredIds.has(b.id)}
              onStarToggle={handleStarToggle}
            />
          ))}
          {regular.length > 0 && (
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-2">
              All Results
            </p>
          )}
        </>
      )}
      {regular.map((b) => (
        <BusinessCard
          key={b.id}
          business={b}
          isFeatured={featuredSet.has(b.id)}
          initialStarred={starredIds.has(b.id)}
          onStarToggle={handleStarToggle}
        />
      ))}
    </div>
  )
}
