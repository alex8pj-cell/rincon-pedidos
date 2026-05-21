import { useState } from 'react'
import { useCart } from '../../context/cartStore'
import CustomizationModal from './CustomizationModal'

export default function MenuCard({ item }) {
  const { addItem, cart } = useCart()
  const [modalOpen, setModalOpen] = useState(false)

  const totalInCart = cart.filter(i => i.id === item.id).reduce((s, i) => s + i.qty, 0)

  return (
    <>
      <div
        className="card-hover bg-brand-dark rounded-2xl overflow-hidden flex flex-col cursor-pointer"
        style={{ border: '1px solid rgba(255,184,0,0.2)' }}
        onClick={() => setModalOpen(true)}
      >
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-44 object-cover" />
        ) : (
          <div className="w-full h-28 flex items-center justify-center text-5xl"
               style={{ background: '#111' }}>🍽️</div>
        )}

        <div className="p-4 flex flex-col flex-1">
          <div className="flex justify-between items-start gap-2 mb-1 flex-1">
            <h3 className="font-bold text-white text-sm leading-tight">{item.name}</h3>
            <span className="text-brand-gold font-black text-sm whitespace-nowrap">
              ${item.price.toFixed(2)}
            </span>
          </div>

          {item.description && (
            <p className="text-white/50 text-xs mb-3 line-clamp-2">{item.description}</p>
          )}

          <button
            onClick={e => { e.stopPropagation(); setModalOpen(true) }}
            className={`mt-auto w-full py-2.5 rounded-xl text-sm font-black transition-all ${
              totalInCart > 0
                ? 'bg-brand-red text-white shadow-[0_0_12px_rgba(232,0,28,0.4)]'
                : 'bg-brand-gold text-black hover:shadow-[0_0_16px_rgba(255,184,0,0.5)]'
            }`}
          >
            {totalInCart > 0 ? `✓ En carrito (${totalInCart})` : '＋ Agregar'}
          </button>
        </div>
      </div>

      <CustomizationModal
        item={item}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={(item, note) => addItem(item, note)}
      />
    </>
  )
}
