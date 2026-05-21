import { useState } from 'react'
import { useMenu } from '../hooks/useMenu'
import { useCart } from '../context/cartStore'
import MenuCard from '../components/menu/MenuCard'
import CategoryFilter from '../components/menu/CategoryFilter'
import CartDrawer from '../components/menu/CartDrawer'
import CheckoutFlow from '../components/checkout/CheckoutFlow'
import PromotionsBanner from '../components/menu/PromotionsBanner'
import LoadingSpinner from '../components/shared/LoadingSpinner'

export default function MenuPage() {
  const { items, categories, loading, error } = useMenu(true)
  const { itemCount, subtotal } = useCart()
  const [activeCategory, setActiveCategory] = useState(null)
  const [cartOpen, setCartOpen]       = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  const filtered = activeCategory ? items.filter(i => i.category === activeCategory) : items

  return (
    <div className="min-h-screen bg-black">

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-30" style={{ background: '#000', borderBottom: '1px solid rgba(255,184,0,0.2)' }}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">

          {/* Logo / Nombre */}
          <div className="min-w-0">
            <h1 className="font-black leading-tight text-xl tracking-tight">
              <span className="text-brand-red">El&nbsp;Rincón</span>
              {' '}
              <span className="text-brand-gold">de Las Delicias</span>
            </h1>
            <p className="text-white/40 text-[11px] tracking-wide uppercase mt-0.5">
              Menú digital · Haz tu pedido
            </p>
          </div>

          {/* Botón carrito */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2 shrink-0
                       bg-brand-gold text-black font-black pl-3 pr-4 py-2.5 rounded-2xl
                       hover:shadow-[0_0_20px_rgba(255,184,0,0.5)] transition-all"
          >
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9M9 21h6" />
            </svg>
            <span className="text-sm">
              {itemCount > 0 ? `$${subtotal.toFixed(0)}` : 'Carrito'}
            </span>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-brand-red text-white
                               text-xs w-5 h-5 rounded-full flex items-center justify-center font-black
                               shadow-[0_0_8px_rgba(232,0,28,0.8)]">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ── CONTENIDO ── */}
      <main className="max-w-2xl mx-auto px-4 py-5 space-y-5">

        {/* Promociones */}
        <PromotionsBanner />

        {/* Filtro de categorías */}
        <CategoryFilter categories={categories} active={activeCategory} onSelect={setActiveCategory} />

        {/* Grid de productos */}
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">⚠️</p>
            <p className="text-brand-red">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">🍽️</p>
            <p className="text-white/40">No hay platos disponibles en este momento</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-28">
            {filtered.map(item => <MenuCard key={item.id} item={item} />)}
          </div>
        )}
      </main>

      {/* ── BOTÓN FLOTANTE MOBILE ── */}
      {itemCount > 0 && (
        <div className="fixed bottom-5 left-0 right-0 flex justify-center px-4 z-20 sm:hidden">
          <button
            onClick={() => setCartOpen(true)}
            className="w-full max-w-sm bg-brand-gold text-black font-black
                       px-6 py-4 rounded-2xl flex items-center justify-between
                       shadow-[0_4px_30px_rgba(255,184,0,0.5)] hover:shadow-[0_4px_40px_rgba(255,184,0,0.7)]
                       transition-all"
          >
            <span className="bg-black/15 rounded-xl px-2.5 py-1 text-sm font-black">{itemCount}</span>
            <span className="text-base">Ver mi pedido</span>
            <span className="font-black">${subtotal.toFixed(2)}</span>
          </button>
        </div>
      )}

      {/* ── OVERLAYS ── */}
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
