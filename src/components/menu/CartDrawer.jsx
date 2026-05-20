import { useCart } from '../../context/cartStore'

export default function CartDrawer({ open, onClose, onCheckout }) {
  const { cart, removeItem, updateQty, subtotal } = useCart()

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />}

      <aside className={`fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl z-50
                         flex flex-col transition-transform duration-300
                         ${open ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Tu pedido</h2>
            <p className="text-xs text-gray-400">{cart.length === 0 ? 'Vacío' : `${cart.reduce((s,i)=>s+i.qty,0)} productos`}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl leading-none w-8 h-8 flex items-center justify-center">
            &times;
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16">
              <span className="text-5xl">🛒</span>
              <p className="text-gray-400 text-sm">Tu carrito está vacío.<br />¡Agrega algo del menú!</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.cartKey} className="bg-gray-50 rounded-2xl p-3">
                <div className="flex items-start gap-3">
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm leading-tight">{item.name}</p>
                    {item.note && (
                      <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-2 py-0.5 mt-1 inline-block">
                        ✏️ {item.note}
                      </p>
                    )}
                    <p className="text-amber-600 font-semibold text-sm mt-1">
                      ${(item.price * item.qty).toFixed(2)}
                      <span className="text-gray-400 font-normal ml-1 text-xs">
                        (${item.price.toFixed(2)} c/u)
                      </span>
                    </p>
                  </div>

                  {/* Controles */}
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <button
                      onClick={() => updateQty(item.cartKey, item.qty - 1)}
                      className="w-7 h-7 rounded-full bg-gray-200 hover:bg-red-100 hover:text-red-600
                                 text-gray-600 text-base font-bold flex items-center justify-center transition-colors"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm font-bold text-gray-900">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.cartKey, item.qty + 1)}
                      className="w-7 h-7 rounded-full bg-amber-500 hover:bg-amber-600
                                 text-white text-base font-bold flex items-center justify-center transition-colors"
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
          <div className="px-4 py-4 border-t space-y-3 bg-white">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Subtotal</span>
              <span className="font-bold text-gray-900 text-lg">${subtotal.toFixed(2)}</span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold
                         py-3.5 rounded-2xl transition-colors text-base shadow-sm"
            >
              Continuar → Finalizar pedido
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
