import { updateDoc, doc } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useMenu } from '../../hooks/useMenu'
import LoadingSpinner from '../shared/LoadingSpinner'

export default function AvailabilityPanel() {
  const { items, loading } = useMenu(false) // load all, including unavailable

  async function toggle(item) {
    await updateDoc(doc(db, 'menu', item.id), { available: !item.available })
  }

  if (loading) return <LoadingSpinner />

  // Group by category
  const byCategory = items.reduce((acc, item) => {
    const cat = item.category || 'Sin categoría'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {})

  return (
    <div className="space-y-6 max-w-2xl">
      {Object.entries(byCategory).map(([cat, catItems]) => (
        <section key={cat} className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
          <div className="px-5 py-3 border-b border-[#E5E7EB] bg-[#F9FAFB]">
            <h3 className="font-bold text-[#111111] text-sm">{cat}</h3>
            <p className="text-xs text-[#6B7280]">
              {catItems.filter(i => i.available).length} de {catItems.length} disponibles
            </p>
          </div>
          <div className="divide-y divide-[#E5E7EB]">
            {catItems.map(item => (
              <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name}
                    className="w-10 h-10 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-[#F3F4F6] flex items-center justify-center text-lg shrink-0">
                    🍽️
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#111111] text-sm truncate">{item.name}</p>
                  <p className="text-xs text-[#6B7280]">${Number(item.price).toFixed(2)}</p>
                </div>
                {/* Toggle */}
                <button
                  onClick={() => toggle(item)}
                  className={`relative shrink-0 w-12 h-6 rounded-full transition-colors duration-200 ${
                    item.available ? 'bg-[#FFB800]' : 'bg-[#E5E7EB]'
                  }`}
                  title={item.available ? 'Marcar como agotado' : 'Marcar como disponible'}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                    item.available ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
                <span className={`text-xs font-bold w-20 text-right ${
                  item.available ? 'text-[#111111]' : 'text-[#6B7280]'
                }`}>
                  {item.available ? 'Disponible' : 'Agotado'}
                </span>
              </div>
            ))}
          </div>
        </section>
      ))}

      {items.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🍽️</p>
          <p className="text-[#6B7280]">No hay productos en el menú todavía</p>
        </div>
      )}
    </div>
  )
}
