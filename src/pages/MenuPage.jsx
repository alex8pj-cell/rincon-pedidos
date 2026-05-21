import { useState } from 'react'
import { useMenu } from '../hooks/useMenu'
import { useCart } from '../context/cartStore'
import { useRestaurantConfig } from '../hooks/useRestaurantConfig'
import MenuCard from '../components/menu/MenuCard'
import CategoryTabs from '../components/menu/CategoryTabs'
import CartDrawer from '../components/menu/CartDrawer'
import CheckoutFlow from '../components/checkout/CheckoutFlow'
import PromotionsBanner from '../components/menu/PromotionsBanner'
import LoadingSpinner from '../components/shared/LoadingSpinner'

export default function MenuPage() {
  const { items, categories, loading, error } = useMenu(true)
  const { itemCount, subtotal }               = useCart()
  const { config, loading: configLoading }    = useRestaurantConfig()

  const [activeCategory, setActiveCategory]   = useState(null)
  const [cartOpen, setCartOpen]               = useState(false)
  const [checkoutOpen, setCheckoutOpen]       = useState(false)
  const [selectedOrderType, setSelectedOrderType] = useState(null)

  const filtered = activeCategory
    ? items.filter(i => i.category === activeCategory)
    : items

  const enabledTypes = config.orderTypes?.filter(t => t.enabled) ?? []

  function handleOrderTypeSelect(key) {
    setSelectedOrderType(key)
    // Scroll to menu
    document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  function handleOpenCheckout() {
    setCartOpen(false)
    setCheckoutOpen(true)
  }

  return (
    <div className="min-h-screen bg-white">

      {/* ── HERO: Cover photo + logo ── */}
      <div className="relative w-full">
        {/* Cover photo */}
        {config.coverUrl ? (
          <img
            src={config.coverUrl}
            alt="Portada"
            className="w-full h-48 sm:h-64 object-cover"
          />
        ) : (
          <div className="w-full h-48 sm:h-64 bg-gradient-to-br from-[#111111] to-[#333333] flex items-center justify-center">
            <span className="text-6xl">🍽️</span>
          </div>
        )}

        {/* Floating cart button */}
        <button
          onClick={() => setCartOpen(true)}
          className="absolute top-4 right-4 flex items-center gap-2 bg-white text-[#111111] font-bold pl-3 pr-4 py-2 rounded-full shadow-float hover:shadow-[0_4px_24px_rgba(0,0,0,0.2)] transition-all"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9M9 21h6" />
          </svg>
          <span className="text-sm">
            {itemCount > 0 ? `$${subtotal.toFixed(0)}` : 'Carrito'}
          </span>
          {itemCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-[#E8001C] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {itemCount}
            </span>
          )}
        </button>
      </div>

      {/* ── RESTAURANT INFO ── */}
      <div className="max-w-2xl mx-auto px-4">
        {/* Circular logo — overlaps cover */}
        <div className="flex items-end gap-4 -mt-12 mb-4">
          {config.logoUrl ? (
            <img
              src={config.logoUrl}
              alt="Logo"
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-float shrink-0"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-[#111111] border-4 border-white shadow-float flex items-center justify-center text-3xl shrink-0">
              🍽️
            </div>
          )}
          <div className="pb-1">
            <h1 className="font-bold text-xl text-[#111111] leading-tight">
              {config.name ?? 'El Rincón de Las Delicias'}
            </h1>
            <p className="text-[#6B7280] text-sm mt-0.5">Menú digital · Haz tu pedido</p>
          </div>
        </div>

        {/* ── ORDER TYPE SELECTOR ── */}
        {enabledTypes.length > 0 && (
          <section className="mb-5">
            <p className="text-sm font-bold text-[#111111] mb-3">¿Cómo quieres tu pedido?</p>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {enabledTypes.map(t => (
                <button
                  key={t.key}
                  onClick={() => handleOrderTypeSelect(t.key)}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full border-2 text-sm font-bold transition-all ${
                    selectedOrderType === t.key
                      ? 'border-[#FFB800] bg-[#FFF7E0] text-[#111111]'
                      : 'border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#FFB800]/40'
                  }`}
                >
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── PROMOTIONS ── */}
      <PromotionsBanner />

      {/* ── MENU ── */}
      <div id="menu-section" className="max-w-2xl mx-auto">

        {/* Category tabs */}
        {categories.length > 1 && (
          <CategoryTabs
            categories={['Todos', ...categories]}
            active={activeCategory ?? 'Todos'}
            onChange={cat => setActiveCategory(cat === 'Todos' ? null : cat)}
          />
        )}

        {/* Product grid */}
        <div className="px-4 py-4">
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">⚠️</p>
              <p className="text-[#E8001C]">{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-6xl mb-4">🍽️</p>
              <p className="text-[#6B7280]">No hay platos disponibles en este momento</p>
            </div>
          ) : (
            <div className="space-y-3 pb-32">
              {filtered.map(item => <MenuCard key={item.id} item={item} />)}
            </div>
          )}
        </div>
      </div>

      {/* ── FLOATING CART BUTTON (mobile) ── */}
      {itemCount > 0 && (
        <div className="fixed bottom-5 left-0 right-0 flex justify-center px-4 z-20 sm:hidden">
          <button
            onClick={() => setCartOpen(true)}
            className="w-full max-w-sm bg-[#FFB800] text-[#111111] font-bold
                       px-6 py-4 rounded-2xl flex items-center justify-between
                       shadow-float hover:bg-[#e6a600] transition-all"
          >
            <span className="bg-black/10 rounded-xl px-2.5 py-1 text-sm font-bold">{itemCount}</span>
            <span className="text-base">Ver mi pedido</span>
            <span className="font-bold">${subtotal.toFixed(2)}</span>
          </button>
        </div>
      )}

      {/* ── OVERLAYS ── */}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={handleOpenCheckout}
      />
      <CheckoutFlow
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        preselectedOrderType={selectedOrderType}
      />
    </div>
  )
}
