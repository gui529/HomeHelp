'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { Business } from '@/lib/yelp'

interface Props {
  business: Business
  isFeatured?: boolean
  initialStarred?: boolean
  onStarToggle?: (business: Business, starred: boolean) => void
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className={`w-5 h-5 transition-colors ${filled ? 'text-yellow-400' : 'text-gray-300'}`}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
      />
    </svg>
  )
}

function RatingDots({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`w-3 h-3 rounded-full ${
            i <= Math.round(rating) ? 'bg-red-500' : 'bg-gray-200'
          }`}
        />
      ))}
      <span className="text-sm text-gray-500 ml-1">{rating.toFixed(1)}</span>
    </div>
  )
}

export default function BusinessCard({ business, isFeatured = false, initialStarred = false, onStarToggle }: Props) {
  const [starred, setStarred] = useState(initialStarred)

  function handleStar() {
    const next = !starred
    setStarred(next)
    onStarToggle?.(business, next)
  }

  return (
    <div className={`bg-white rounded-xl border-2 overflow-hidden flex flex-col sm:flex-row transition-shadow hover:shadow-md ${
      isFeatured ? 'border-yellow-400' : 'border-gray-100'
    }`}>
      {business.imageUrl && (
        <div className="relative w-full sm:w-40 h-40 sm:h-auto flex-shrink-0">
          <Image
            src={business.imageUrl}
            alt={business.name}
            fill
            className="object-cover"
            sizes="160px"
          />
          {isFeatured && (
            <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
              Sponsored
            </span>
          )}
        </div>
      )}
      <div className="p-4 flex flex-col gap-2 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-gray-900 truncate">{business.name}</h3>
            <div className="flex flex-wrap gap-1 mt-1">
              {business.categories.map((c) => (
                <span key={c} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {c}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={handleStar}
            aria-label={starred ? 'Remove from favorites' : 'Add to favorites'}
            className="flex-shrink-0 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <StarIcon filled={starred} />
          </button>
        </div>
        <RatingDots rating={business.rating} />
        <p className="text-sm text-gray-500">{business.reviewCount} reviews</p>
        {business.address && (
          <p className="text-sm text-gray-600 truncate">{business.address}</p>
        )}
        {business.phone && (
          <a href={`tel:${business.phone}`} className="text-sm text-blue-600 hover:underline">
            {business.phone}
          </a>
        )}
        <a
          href={business.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto text-sm text-blue-600 hover:underline self-start"
        >
          View on Yelp →
        </a>
      </div>
    </div>
  )
}
