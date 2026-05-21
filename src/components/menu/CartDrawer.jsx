import { useCart } from '../../context/cartStore'

export default function CartDrawer({ open, onClose, onCheckout }) {
  const { cart, updateQty, subtotal } = useCart()
  const count = cart.reduce((s, i) => s + i.qty, 0)

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed right-0 top-0 h-full w-full max-w-sm z-50 flex flex-col
                    bg-white border-l border-[#E5E7EB] shadow-float
                    transition-transform duration-300
                    ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
          <div>
            <h2 className="text-lg font-bold text-[#111111]">Tu pedido</h2>
            <p className="text-xs text-[#6B7280]">
              {count === 0 ? 'Vacío' : `${count} producto${count > 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#F3F4F6] hover:bg-[#E5E7EB] flex items-center justify-center text-[#6B7280] text-xl transition-colors"
          >
            ×
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16">
              <span className="text-5xl">🛒</span>
              <p className="text-[#6B7280] text-sm">
                Tu carrito está vacío.<br />¡Agrega algo del menú!
              </p>
            </div>
          ) : (
            cart.map(item => (
              <div
                key={item.cartKey}
                className="rounded-2xl p-3 border border-[#E5E7EB] bg-[#F9FAFB]"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#111111] text-sm leading-tight">{item.name}</p>

                    {/* Customizations */}
                    {item.selectedCustomizations && Object.keys(item.selectedCustomizations).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(item.selectedCustomizations).map(([group, opts]) =>
                          (Array.isArray(opts) ? opts : [opts]).map(opt => (
                            <span key={`${group}-${opt}`}
                              className="text-[10px] bg-[#FFF7E0] text-[#111111] border border-[#FFB800]/30 rounded-full px-2 py-0.5 font-medium">
                              {opt}
                            </span>
                          ))
                        )}
                      </div>
                    )}

                    {item.note && (
                      <span className="text-[11px] text-[#111111] font-semibold bg-[#FFF7E0] border border-[#FFB800]/30 rounded-md px-2 py-0.5 mt-1 inline-block">
                        ✏️ {item.note}
                      </span>
                    )}

                    <p className="font-bold text-[#111111] text-sm mt-1">
                      ${(item.price * item.qty).toFixed(2)}
                      <span className="text-[#6B7280] font-normal ml-1 text-xs">
                        ${item.price.toFixed(2)} c/u
                      </span>
                    </p>
                  </div>

                  {/* Qty controls */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => updateQty(item.cartKey, item.qty - 1)}
                      className="w-7 h-7 rounded-full bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#111111] text-base font-bold flex items-center justify-center transition-colors"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm font-bold text-[#111111]">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.cartKey, item.qty + 1)}
                      className="w-7 h-7 rounded-full bg-[#FFB800] text-[#111111] text-base font-bold flex items-center justify-center transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="px-4 py-4 space-y-3 border-t border-[#E5E7EB]">
            <div className="flex justify-between items-center">
              <span className="text-[#6B7280] text-sm">Subtotal</span>
              <span className="font-bold text-[#111111] text-xl">${subtotal.toFixed(2)}</span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full bg-[#FFB800] text-[#111111] font-bold py-4 rounded-2xl
                         hover:bg-[#e6a600] transition-colors text-base shadow-float"
            >
              Finalizar pedido →
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
