import { useCart } from '../../context/cartStore'

export default function CartDrawer({ open, onClose, onCheckout }) {
  const { cart, updateQty, subtotal } = useCart()
  const count = cart.reduce((s, i) => s + i.qty, 0)

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/70 z-40" onClick={onClose} />}

      <aside
        className={`fixed right-0 top-0 h-full w-full max-w-sm z-50 flex flex-col
                    transition-transform duration-300
                    ${open ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ background: '#0a0a0a', borderLeft: '1px solid rgba(255,184,0,0.2)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4"
             style={{ borderBottom: '1px solid rgba(255,184,0,0.15)' }}>
          <div>
            <h2 className="text-lg font-black text-white">Tu pedido</h2>
            <p className="text-xs text-white/40">{count === 0 ? 'Vacío' : `${count} producto${count > 1 ? 's' : ''}`}</p>
          </div>
          <button onClick={onClose}
                  className="text-white/40 hover:text-brand-gold text-3xl leading-none transition-colors">
            &times;
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16">
              <span className="text-5xl">🛒</span>
              <p className="text-white/40 text-sm">Tu carrito está vacío.<br/>¡Agrega algo del menú!</p>
            </div>
          ) : cart.map(item => (
            <div key={item.cartKey} className="rounded-2xl p-3"
                 style={{ background: '#1a1a1a', border: '1px solid rgba(255,184,0,0.15)' }}>
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm leading-tight">{item.name}</p>
                  {item.note && (
                    <span className="text-xs text-black font-semibold bg-brand-gold rounded-md px-2 py-0.5 mt-1 inline-block">
                      ✏️ {item.note}
                    </span>
                  )}
                  <p className="text-brand-gold font-black text-sm mt-1">
                    ${(item.price * item.qty).toFixed(2)}
                    <span className="text-white/30 font-normal ml-1 text-xs">${item.price.toFixed(2)} c/u</span>
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => updateQty(item.cartKey, item.qty - 1)}
                          className="w-7 h-7 rounded-full bg-white/10 hover:bg-brand-red hover:text-white
                                     text-white text-base font-bold flex items-center justify-center transition-colors">
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-black text-white">{item.qty}</span>
                  <button onClick={() => updateQty(item.cartKey, item.qty + 1)}
                          className="w-7 h-7 rounded-full bg-brand-gold hover:opacity-90
                                     text-black text-base font-bold flex items-center justify-center transition-colors">
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="px-4 py-4 space-y-3"
               style={{ borderTop: '1px solid rgba(255,184,0,0.15)' }}>
            <div className="flex justify-between items-center">
              <span className="text-white/50 text-sm">Subtotal</span>
              <span className="font-black text-white text-xl">${subtotal.toFixed(2)}</span>
            </div>
            <button onClick={onCheckout}
                    className="w-full bg-brand-gold text-black font-black py-4 rounded-2xl
                               hover:shadow-[0_0_24px_rgba(255,184,0,0.5)] transition-all text-base">
              Finalizar pedido →
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
