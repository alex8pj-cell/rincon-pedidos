import { useState } from 'react'
import { useCart } from '../../context/cartStore'
import CustomizationModal from './CustomizationModal'

export default function MenuCard({ item }) {
  const { cart } = useCart()
  const [open, setOpen] = useState(false)

  const totalInCart = cart.filter(i => i.id === item.id).reduce((s, i) => s + i.qty, 0)
  const unavailable = item.available === false

  return (
    <>
      <div
        className={`flex items-start gap-3 p-4 bg-white border border-[#E5E7EB] rounded-2xl shadow-card hover:shadow-float transition-shadow ${unavailable ? 'opacity-60' : ''}`}
        onClick={() => !unavailable && setOpen(true)}
        style={{ cursor: unavailable ? 'default' : 'pointer' }}
      >
        {/* Info */}
        <div className="flex-1 min-w-0 pr-1">
          <p className="font-bold text-[#111111] text-[15px] leading-snug">{item.name}</p>
          {item.description && (
            <p className="text-[#6B7280] text-[13px] mt-1 leading-snug line-clamp-2">
              {item.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <p className="font-bold text-[#111111] text-[15px]">
              ${Number(item.price).toFixed(2)}
            </p>
            {totalInCart > 0 && (
              <span className="text-[11px] bg-[#FFF7E0] text-[#FFB800] border border-[#FFB800]/30 rounded-full px-2 py-0.5 font-bold">
                ×{totalInCart} en carrito
              </span>
            )}
            {unavailable && (
              <span className="text-[11px] bg-[#F3F4F6] text-[#6B7280] rounded-full px-2 py-0.5 font-medium">
                Agotado
              </span>
            )}
          </div>
        </div>

        {/* Photo + "+" button */}
        <div className="relative shrink-0">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-24 h-24 rounded-xl object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-24 h-24 rounded-xl bg-[#F3F4F6] flex items-center justify-center text-3xl select-none">
              🍽️
            </div>
          )}

          {!unavailable && (
            <button
              onClick={e => { e.stopPropagation(); setOpen(true) }}
              className="absolute -bottom-2.5 -right-2.5 w-9 h-9 rounded-full bg-[#FFB800] text-[#111111] text-xl font-bold flex items-center justify-center shadow-float active:scale-95 transition-transform"
              aria-label={`Agregar ${item.name}`}
            >
              +
            </button>
          )}
        </div>
      </div>

      {open && (
        <CustomizationModal item={item} onClose={() => setOpen(false)} />
      )}
    </>
  )
}
