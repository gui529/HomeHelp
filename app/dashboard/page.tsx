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
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">My Favorites</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {starred.length === 0
              ? 'No saved pros yet'
              : `${starred.length} saved ${starred.length === 1 ? 'pro' : 'pros'}`}
          </p>
        </div>
        {starred.length > 0 && (
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Find more
          </Link>
        )}
      </div>

      {starred.length === 0 ? (
        <div className="bg-white rounded-2xl ring-1 ring-slate-200 py-16 px-6 text-center">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-amber-50 grid place-items-center ring-1 ring-amber-100">
            <svg viewBox="0 0 24 24" className="h-7 w-7 text-amber-500" fill="currentColor">
              <path d="M6 3.75A1.75 1.75 0 0 1 7.75 2h8.5A1.75 1.75 0 0 1 18 3.75V21l-6-3.5L6 21V3.75Z" />
            </svg>
          </div>
          <p className="mt-4 text-base font-semibold text-slate-900">Nothing saved yet</p>
          <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
            Tap the bookmark on any pro to keep them here for the next time you need help.
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-4 py-2.5 transition-colors"
          >
            Start a search
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
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
