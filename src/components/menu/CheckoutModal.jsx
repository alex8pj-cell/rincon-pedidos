import { useState } from 'react'
import { useCart } from '../../context/CartContext'
import { useOrders } from '../../hooks/useOrders'

export default function CheckoutModal({ open, onClose }) {
  const { cart, total, clearCart } = useCart()
  const { createOrder } = useOrders()
  const [table, setTable] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await createOrder({
        table: table.trim(),
        note: note.trim(),
        items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
        total,
      })
      clearCart()
      setSuccess(true)
      setTable('')
      setNote('')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
        {success ? (
          <div className="text-center py-6">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">¡Pedido enviado!</h3>
            <p className="text-gray-500 mb-6">Tu pedido está siendo preparado.</p>
            <button
              onClick={() => { setSuccess(false); onClose() }}
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-2.5 rounded-xl"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Confirmar pedido</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-1 max-h-40 overflow-y-auto">
              {cart.map(i => (
                <div key={i.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">{i.name} ×{i.qty}</span>
                  <span className="text-gray-900 font-medium">${(i.price * i.qty).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-1 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-amber-600">${total.toFixed(2)}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mesa *</label>
                <input
                  type="text"
                  value={table}
                  onChange={e => setTable(e.target.value)}
                  placeholder="Ej: Mesa 5"
                  required
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nota (opcional)</label>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Sin picante, sin cebolla..."
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                {submitting ? 'Enviando...' : 'Enviar pedido'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
