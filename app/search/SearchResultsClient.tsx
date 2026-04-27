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

function SectionLabel({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <div className="flex items-center gap-3 mt-2 mb-1">
      <span
        className={`text-[11px] font-bold uppercase tracking-[0.12em] ${
          accent ? 'text-amber-600' : 'text-slate-500'
        }`}
      >
        {children}
      </span>
      <span className="flex-1 h-px bg-slate-200" />
    </div>
  )
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

  if (featured.length === 0 && regular.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl ring-1 ring-slate-200">
        <p className="text-4xl mb-3">🔍</p>
        <p className="text-slate-700 font-medium">No pros found in this area.</p>
        <p className="text-sm text-slate-500 mt-1">Try a different ZIP or category.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {featured.length > 0 && (
        <>
          <SectionLabel accent>★ Featured</SectionLabel>
          {featured.map((b) => (
            <BusinessCard
              key={b.id}
              business={b}
              isFeatured
              initialStarred={starredIds.has(b.id)}
              onStarToggle={handleStarToggle}
            />
          ))}
          {regular.length > 0 && <SectionLabel>All Results</SectionLabel>}
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
