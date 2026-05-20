export default function CategoryFilter({ categories, active, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onSelect(null)}
        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
          active === null
            ? 'bg-amber-500 text-white'
            : 'bg-white text-gray-600 border border-gray-200 hover:border-amber-300'
        }`}
      >
        Todo
      </button>
      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            active === cat
              ? 'bg-amber-500 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-amber-300'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
