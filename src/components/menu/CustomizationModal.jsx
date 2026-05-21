import { useState, useEffect } from 'react'
import { useCart } from '../../context/cartStore'

export default function CustomizationModal({ item, onClose }) {
  const { addItem } = useCart()
  const [note, setNote] = useState('')
  const [selections, setSelections] = useState({})

  useEffect(() => { setNote(''); setSelections({}) }, [item])

  if (!item) return null

  // item.customizations = [{ group: 'Cocción', multiple: false, options: ['término medio','bien cocido'] }, ...]
  const presets = item.customizations ?? []

  function toggle(group, option, multiple) {
    setSelections(prev => {
      if (multiple) {
        const current = prev[group] ?? []
        return {
          ...prev,
          [group]: current.includes(option)
            ? current.filter(o => o !== option)
            : [...current, option],
        }
      }
      return { ...prev, [group]: prev[group] === option ? undefined : option }
    })
  }

  function isSelected(group, option) {
    const val = selections[group]
    if (Array.isArray(val)) return val.includes(option)
    return val === option
  }

  function handleConfirm() {
    // Strip undefined values
    const cleaned = Object.fromEntries(
      Object.entries(selections).filter(([, v]) => v !== undefined && !(Array.isArray(v) && v.length === 0))
    )
    addItem(item, note, cleaned)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl bg-white overflow-hidden max-h-[90dvh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Product image */}
        {item.imageUrl && (
          <img src={item.imageUrl} alt={item.name} className="w-full h-44 object-cover shrink-0" />
        )}

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          {/* Name + price */}
          <div className="flex justify-between items-start">
            <div className="pr-4">
              <h3 className="text-lg font-bold text-[#111111] leading-tight">{item.name}</h3>
              {item.description && (
                <p className="text-[#6B7280] text-sm mt-1">{item.description}</p>
              )}
            </div>
            <span className="font-bold text-[#111111] text-lg whitespace-nowrap">
              ${Number(item.price).toFixed(2)}
            </span>
          </div>

          {/* Preset customization groups */}
          {presets.map(group => (
            <div key={group.group}>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-sm font-bold text-[#111111]">{group.group}</p>
                <span className="text-[11px] text-[#6B7280] bg-[#F3F4F6] rounded-full px-2 py-0.5">
                  {group.multiple ? 'Varios' : 'Elige uno'}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {group.options.map(opt => (
                  <button
                    key={opt}
                    onClick={() => toggle(group.group, opt, group.multiple)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                      isSelected(group.group, opt)
                        ? 'bg-[#FFB800] border-[#FFB800] text-[#111111] font-bold'
                        : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:border-[#FFB800]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Free text note */}
          <div>
            <label className="block text-sm font-bold text-[#111111] mb-2">
              Nota especial <span className="text-[#6B7280] font-normal">(opcional)</span>
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Ej: sin cebolla, extra salsa…"
              rows={2}
              maxLength={120}
              className="field resize-none"
            />
            <p className="text-right text-xs text-[#6B7280] mt-1">{note.length}/120</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-5 border-t border-[#E5E7EB] shrink-0">
          <button
            onClick={onClose}
            className="flex-1 font-bold py-3 rounded-xl border border-[#E5E7EB] text-[#6B7280] hover:text-[#111111] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="flex-[2] bg-[#FFB800] text-[#111111] font-bold py-3 rounded-xl hover:bg-[#e6a600] transition-colors shadow-float"
          >
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  )
}
