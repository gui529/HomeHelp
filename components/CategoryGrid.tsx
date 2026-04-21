import { CATEGORIES } from '@/lib/categories'

interface Props {
  onSelect: (category: string) => void
  selected: string
}

export default function CategoryGrid({ onSelect, selected }: Props) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-6">
      {CATEGORIES.map(({ label, value, icon }) => (
        <button
          key={value}
          onClick={() => onSelect(value)}
          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-sm font-medium cursor-pointer ${
            selected === value
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
          }`}
        >
          <span className="text-2xl">{icon}</span>
          <span className="text-center leading-tight">{label}</span>
        </button>
      ))}
    </div>
  )
}
