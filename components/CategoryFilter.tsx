const CATEGORIES = ['All', 'Markets', 'Macro', 'Crypto', 'Earnings', 'Policy']

export default function CategoryFilter({
  selected,
  onSelect,
}: {
  selected: string
  onSelect: (cat: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => onSelect(cat)}
          className={`px-3 py-1.5 text-sm rounded-full font-medium transition-colors ${
            selected === cat
              ? 'bg-green-600 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
