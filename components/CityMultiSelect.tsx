'use client'

import { useState } from 'react'
import CityAutocomplete from './CityAutocomplete'

interface Props {
  value: string[]
  onChange: (cities: string[]) => void
}

export default function CityMultiSelect({ value, onChange }: Props) {
  const [draft, setDraft] = useState('')

  function addCity(city: string) {
    const trimmed = city.trim()
    if (!trimmed) return
    if (value.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setDraft('')
      return
    }
    onChange([...value, trimmed])
    setDraft('')
  }

  function removeCity(city: string) {
    onChange(value.filter((c) => c !== city))
  }

  return (
    <div>
      <div className="rounded-xl ring-1 ring-slate-200 px-3 focus-within:ring-2 focus-within:ring-amber-400 bg-white">
        <CityAutocomplete
          value={draft}
          onChange={(v) => {
            // When the autocomplete picks a value (sets the full "City, ST"), commit it.
            // Heuristic: if the value contains a comma and didn't before, treat as picked.
            if (v.includes(',') && !draft.includes(',')) {
              addCity(v)
            } else {
              setDraft(v)
            }
          }}
          onSubmit={() => addCity(draft)}
          placeholder="Add a city, e.g. Acworth, GA"
          className="w-full bg-transparent py-2.5 text-base text-slate-900 placeholder-slate-400 focus:outline-none"
        />
      </div>
      {value.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {value.map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 ring-1 ring-amber-200 text-xs font-medium px-2 py-1 rounded-full"
            >
              {c}
              <button
                type="button"
                onClick={() => removeCity(c)}
                aria-label={`Remove ${c}`}
                className="hover:text-rose-600"
              >
                <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
