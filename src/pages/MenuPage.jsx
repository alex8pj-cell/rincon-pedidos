import { useState } from 'react'
import { useMenu } from '../hooks/useMenu'
import { useCart } from '../context/cartStore'
import MenuCard from '../components/menu/MenuCard'
import CategoryFilter from '../components/menu/CategoryFilter'
import CartDrawer from '../components/menu/CartDrawer'
import CheckoutFlow from '../components/checkout/CheckoutFlow'
import LoadingSpinner from '../components/shared/LoadingSpinner'

export default function MenuPage() {
  const { items, categories, loading, error } = useMenu(true)
  const { itemCount, subtotal } = useCart()
  const [activeCategory, setActiveCategory] = useState(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  const filtered = activeCategory
    ? items.filter(i => i.category === activeCategory)
    : items

  return (
    <div className="min-h-screen bg-amber-50">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">🍽️ El Rincón de Las Delicias</h1>
            <p className="text-xs text-gray-400">Menú digital • Haz tu pedido aquí</p>
          </div>

          {/* Botón carrito */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2 bg-amber-500 hover:bg-amber-600
                       text-white pl-3 pr-4 py-2 rounded-2xl transition-colors"
          >
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9M9 21h6" />
            </svg>
            {itemCount > 0 ? (
              <span className="text-sm font-bold">${subtotal.toFixed(0)}</span>
            ) : (
              <span className="text-sm font-medium">Carrito</span>
            )}
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white
                               text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ── Contenido ── */}
      <main className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        <CategoryFilter
          categories={categories}
          active={activeCategory}
          onSelect={setActiveCategory}
        />

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="text-center text-red-500 py-12">
            <p className="text-4xl mb-2">⚠️</p>
            <p>{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-400 py-16">
            <p className="text-5xl mb-3">🍽️</p>
            <p>No hay platos disponibles en este momento</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-24">
            {filtered.map(item => <MenuCard key={item.id} item={item} />)}
          </div>
        )}
      </main>

      {/* Botón flotante ver pedido (mobile) */}
      {itemCount > 0 && (
        <div className="fixed bottom-5 left-0 right-0 flex justify-center px-4 z-20 sm:hidden">
          <button
            onClick={() => setCartOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold
                       px-8 py-4 rounded-2xl shadow-xl transition-colors
                       flex items-center gap-3 w-full max-w-sm justify-center"
          >
            <span className="bg-white/20 rounded-xl px-2 py-0.5 text-sm">{itemCount}</span>
            <span>Ver mi pedido</span>
            <span className="ml-auto font-bold">${subtotal.toFixed(2)}</span>
          </button>
        </div>
      )}

      {/* ── Overlays ── */}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => { setCartOpen(false); setCheckoutOpen(true) }}
      />
      <CheckoutFlow
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />
    </div>
  )
}
