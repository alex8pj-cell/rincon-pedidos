import { useState } from 'react'
import { useCart } from '../../context/cartStore'
import CustomizationModal from './CustomizationModal'

export default function MenuCard({ item }) {
  const { addItem, cart } = useCart()
  const [modalOpen, setModalOpen] = useState(false)

  // Total de unidades de este plato en el carrito (cualquier personalización)
  const totalInCart = cart
    .filter(i => i.id === item.id)
    .reduce((s, i) => s + i.qty, 0)

  function handleConfirm(item, note) {
    addItem(item, note)
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-44 object-cover" />
        ) : (
          <div className="w-full h-24 bg-amber-50 flex items-center justify-center text-4xl">🍽️</div>
        )}

        <div className="p-4 flex flex-col flex-1">
          <div className="flex justify-between items-start gap-2 mb-1 flex-1">
            <h3 className="font-semibold text-gray-900 text-base leading-tight">{item.name}</h3>
            <span className="text-amber-600 font-bold text-base whitespace-nowrap">
              ${item.price.toFixed(2)}
            </span>
          </div>

          {item.description && (
            <p className="text-gray-500 text-sm mb-3 line-clamp-2">{item.description}</p>
          )}

          <button
            onClick={() => setModalOpen(true)}
            className={`mt-auto w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              totalInCart > 0
                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                : 'bg-amber-500 text-white hover:bg-amber-600'
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
        onConfirm={handleConfirm}
      />
    </>
  )
}
