export default function CategoryFilter({ categories, active, onSelect }) {
  const base    = 'px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border'
  const activeC = 'bg-brand-gold text-black border-brand-gold shadow-[0_0_12px_rgba(255,184,0,0.4)]'
  const inactC  = 'bg-brand-dark text-brand-gold border-brand-border hover:border-brand-gold'

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
      <button onClick={() => onSelect(null)} className={`${base} ${active === null ? activeC : inactC}`}>
        Todo
      </button>
      {categories.map(cat => (
        <button key={cat} onClick={() => onSelect(cat)} className={`${base} ${active === cat ? activeC : inactC}`}>
          {cat}
        </button>
      ))}
    </div>
  )
}
