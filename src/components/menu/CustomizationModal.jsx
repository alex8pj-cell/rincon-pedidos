import { useState, useEffect } from 'react'

/**
 * Modal que aparece al pulsar "Agregar" en una MenuCard.
 * Permite añadir una nota de personalización al plato.
 */
export default function CustomizationModal({ item, open, onClose, onConfirm }) {
  const [note, setNote] = useState('')

  // Limpiar nota al abrir un nuevo ítem
  useEffect(() => { if (open) setNote('') }, [open])

  if (!open || !item) return null

  function handleConfirm() {
    onConfirm(item, note)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">

        {/* Imagen del plato */}
        {item.imageUrl && (
          <img src={item.imageUrl} alt={item.name} className="w-full h-40 object-cover" />
        )}

        <div className="p-5">
          {/* Cabecera */}
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-lg font-bold text-gray-900 leading-tight pr-4">{item.name}</h3>
            <span className="text-amber-600 font-bold text-lg whitespace-nowrap">
              ${item.price.toFixed(2)}
            </span>
          </div>
          {item.description && (
            <p className="text-gray-500 text-sm mb-4">{item.description}</p>
          )}

          {/* Personalización */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              ✏️ Personalización <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Ej: sin cebolla, extra salsa, término medio…"
              rows={2}
              maxLength={120}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                         focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100
                         resize-none"
            />
            <p className="text-right text-xs text-gray-400 mt-1">{note.length}/120</p>
          </div>

          {/* Acciones */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className="flex-2 flex-[2] bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Agregar al carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
