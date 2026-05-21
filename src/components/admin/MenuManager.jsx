import { useState } from 'react'
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useMenu } from '../../hooks/useMenu'
import LoadingSpinner from '../shared/LoadingSpinner'

const EMPTY = {
  name: '', category: '', price: '', description: '', available: true, imageUrl: '',
  customizations: [], // [{ group:'Cocción', multiple:false, options:['término medio','bien cocido'] }]
}

function CField({ label, children }) {
  return (
    <div>
      {label && <label className="block text-xs font-bold text-[#111111] mb-1">{label}</label>}
      {children}
    </div>
  )
}

function CustomizationsEditor({ value, onChange }) {
  function addGroup() {
    onChange([...value, { group: '', multiple: false, options: [] }])
  }
  function removeGroup(idx) {
    onChange(value.filter((_, i) => i !== idx))
  }
  function updateGroup(idx, key, val) {
    onChange(value.map((g, i) => i === idx ? { ...g, [key]: val } : g))
  }
  function addOption(idx) {
    onChange(value.map((g, i) => i === idx ? { ...g, options: [...g.options, ''] } : g))
  }
  function updateOption(gIdx, oIdx, val) {
    onChange(value.map((g, i) => i === gIdx
      ? { ...g, options: g.options.map((o, j) => j === oIdx ? val : o) }
      : g
    ))
  }
  function removeOption(gIdx, oIdx) {
    onChange(value.map((g, i) => i === gIdx
      ? { ...g, options: g.options.filter((_, j) => j !== oIdx) }
      : g
    ))
  }

  return (
    <div className="space-y-3">
      {value.map((group, gIdx) => (
        <div key={gIdx} className="rounded-xl border border-[#E5E7EB] p-3 space-y-2">
          <div className="flex gap-2 items-center">
            <input className="field text-sm flex-1" placeholder="Nombre del grupo (ej: Cocción)"
              value={group.group} onChange={e => updateGroup(gIdx, 'group', e.target.value)} />
            <label className="flex items-center gap-1.5 shrink-0 cursor-pointer">
              <input type="checkbox" checked={group.multiple}
                onChange={e => updateGroup(gIdx, 'multiple', e.target.checked)}
                className="w-3.5 h-3.5 accent-[#FFB800]" />
              <span className="text-xs text-[#6B7280]">Varios</span>
            </label>
            <button type="button" onClick={() => removeGroup(gIdx)}
              className="text-[#E8001C] text-lg shrink-0">×</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {group.options.map((opt, oIdx) => (
              <div key={oIdx} className="flex items-center gap-1">
                <input className="border border-[#E5E7EB] rounded-full px-3 py-1 text-xs focus:outline-none focus:border-[#FFB800] transition-colors"
                  value={opt} placeholder="opción"
                  onChange={e => updateOption(gIdx, oIdx, e.target.value)} />
                <button type="button" onClick={() => removeOption(gIdx, oIdx)}
                  className="text-[#E8001C] text-sm leading-none">×</button>
              </div>
            ))}
            <button type="button" onClick={() => addOption(gIdx)}
              className="text-xs font-bold text-[#FFB800] hover:text-[#111111] transition-colors">
              + opción
            </button>
          </div>
        </div>
      ))}
      <button type="button" onClick={addGroup}
        className="text-xs font-bold text-[#6B7280] hover:text-[#111111] transition-colors border border-dashed border-[#E5E7EB] rounded-xl px-4 py-2 w-full">
        + Agregar grupo de personalizaciones
      </button>
    </div>
  )
}

export default function MenuManager() {
  const { items, loading } = useMenu(false)
  const [form, setForm]       = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving]   = useState(false)

  function startEdit(item) {
    setEditing(item.id)
    setForm({
      ...item,
      price: item.price.toString(),
      customizations: item.customizations ?? [],
    })
  }
  function cancelEdit() { setEditing(null); setForm(EMPTY) }

  async function handleSave(e) {
    e.preventDefault(); setSaving(true)
    const data = {
      ...form,
      price: parseFloat(form.price),
      customizations: form.customizations.filter(g => g.group.trim()),
    }
    try {
      if (editing) { await updateDoc(doc(db, 'menu', editing), data) }
      else         { await addDoc(collection(db, 'menu'), { ...data, createdAt: serverTimestamp() }) }
      cancelEdit()
    } finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este plato?')) return
    await deleteDoc(doc(db, 'menu', id))
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
        <h3 className="font-bold text-[#111111] text-base mb-4">
          {editing ? '✏️ Editar plato' : '+ Agregar plato'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <CField label="Nombre *">
            <input required className="field text-sm" placeholder="Tacos al pastor"
              value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </CField>
          <CField label="Categoría *">
            <input required className="field text-sm" placeholder="Entradas, Tacos, Bebidas…"
              value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} />
          </CField>
          <CField label="Precio *">
            <input required className="field text-sm" type="number" min="0" step="0.5" placeholder="99.00"
              value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
          </CField>
          <CField label="URL Imagen">
            <input className="field text-sm" placeholder="https://…/imagen.jpg"
              value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} />
          </CField>
          <CField label="Descripción">
            <textarea className="field text-sm resize-none sm:col-span-2" rows={2}
              placeholder="Descripción breve…"
              value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </CField>
        </div>

        {/* Customizations */}
        <div className="mb-4">
          <p className="text-xs font-bold text-[#111111] mb-2">Personalizaciones predefinidas</p>
          <CustomizationsEditor
            value={form.customizations}
            onChange={c => setForm(p => ({ ...p, customizations: c }))}
          />
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="font-bold px-6 py-2.5 rounded-xl bg-[#FFB800] text-[#111111] shadow-float hover:bg-[#e6a600] transition-all disabled:opacity-40 text-sm">
            {saving ? 'Guardando…' : editing ? 'Actualizar' : 'Agregar'}
          </button>
          {editing && (
            <button type="button" onClick={cancelEdit}
              className="px-6 py-2.5 rounded-xl border border-[#E5E7EB] text-[#6B7280] hover:text-[#111111] transition-colors text-sm">
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Products grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <div key={item.id}
            className={`bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden transition-opacity ${!item.available ? 'opacity-50' : ''}`}>
            {item.imageUrl && (
              <img src={item.imageUrl} alt={item.name} className="w-full h-28 object-cover" />
            )}
            <div className="p-4">
              <div className="flex justify-between items-start mb-1">
                <div className="min-w-0 pr-2">
                  <p className="font-bold text-[#111111] text-sm truncate">{item.name}</p>
                  <p className="text-[#6B7280] text-xs">{item.category}</p>
                </div>
                <span className="font-bold text-[#111111] text-sm whitespace-nowrap">
                  ${Number(item.price).toFixed(2)}
                </span>
              </div>
              {item.description && (
                <p className="text-[#6B7280] text-xs mb-3 line-clamp-2">{item.description}</p>
              )}
              {/* Customization badges */}
              {item.customizations?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.customizations.map(g => (
                    <span key={g.group} className="text-[10px] bg-[#F3F4F6] text-[#6B7280] rounded-full px-2 py-0.5">
                      {g.group} ({g.options.length})
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={() => startEdit(item)}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:text-[#111111] transition-colors">
                  Editar
                </button>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${
                  item.available ? 'bg-green-50 text-green-700' : 'bg-[#F3F4F6] text-[#6B7280]'
                }`}>
                  {item.available ? '✓ Disponible' : 'Agotado'}
                </span>
                <button onClick={() => handleDelete(item.id)}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg ml-auto bg-red-50 text-[#E8001C] hover:bg-red-100 transition-colors">
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
