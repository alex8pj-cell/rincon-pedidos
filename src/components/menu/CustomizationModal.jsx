import { useState, useEffect } from 'react'

export default function CustomizationModal({ item, open, onClose, onConfirm }) {
  const [note, setNote] = useState('')
  useEffect(() => { if (open) setNote('') }, [open])
  if (!open || !item) return null

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
         onClick={onClose}>
      <div
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden"
        style={{ background: '#111', border: '1px solid rgba(255,184,0,0.25)' }}
        onClick={e => e.stopPropagation()}
      >
        {item.imageUrl && (
          <img src={item.imageUrl} alt={item.name} className="w-full h-44 object-cover" />
        )}

        <div className="p-5">
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-lg font-black text-white leading-tight pr-4">{item.name}</h3>
            <span className="text-brand-gold font-black text-lg whitespace-nowrap">
              ${item.price.toFixed(2)}
            </span>
          </div>
          {item.description && (
            <p className="text-white/50 text-sm mb-4">{item.description}</p>
          )}

          <div className="mb-5">
            <label className="block text-xs font-bold text-brand-gold mb-2 uppercase tracking-wider">
              ✏️ Personalización <span className="text-white/40 normal-case font-normal">(opcional)</span>
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Ej: sin cebolla, extra salsa, término medio…"
              rows={2}
              maxLength={120}
              className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30
                         resize-none focus:outline-none"
              style={{ background: '#1a1a1a', border: '1px solid rgba(255,184,0,0.25)' }}
              onFocus={e => e.target.style.borderColor = 'rgba(255,184,0,0.8)'}
              onBlur={e  => e.target.style.borderColor = 'rgba(255,184,0,0.25)'}
            />
            <p className="text-right text-xs text-white/30 mt-1">{note.length}/120</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 font-bold py-3 rounded-xl text-white/60 hover:text-white transition-colors"
              style={{ border: '1px solid rgba(255,255,255,0.15)' }}
            >
              Cancelar
            </button>
            <button
              onClick={() => { onConfirm(item, note); onClose() }}
              className="flex-[2] bg-brand-gold text-black font-black py-3 rounded-xl
                         hover:shadow-[0_0_20px_rgba(255,184,0,0.5)] transition-all"
            >
              Agregar al carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
