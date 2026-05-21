import { useRef } from 'react'

export default function CategoryTabs({ categories, active, onChange }) {
  const scrollRef = useRef(null)

  return (
    <div
      ref={scrollRef}
      className="flex gap-1 overflow-x-auto no-scrollbar px-4 py-2 sticky top-0 bg-white z-10 border-b border-[#E5E7EB]"
    >
      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`
            shrink-0 px-4 py-2 text-sm font-semibold rounded-full transition-all
            ${active === cat
              ? 'bg-[#FFB800] text-[#111111]'
              : 'bg-[#F9FAFB] text-[#6B7280] hover:bg-[#FFF7E0] hover:text-[#111111]'
            }
          `}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
