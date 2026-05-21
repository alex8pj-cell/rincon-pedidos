import { useState } from 'react'
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useMenu } from '../../hooks/useMenu'
import LoadingSpinner from '../shared/LoadingSpinner'

const EMPTY = { name:'', category:'', price:'', description:'', available:true, imageUrl:'' }
const inputCls = `w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30
                  focus:outline-none transition-all`
const inputStyle = { background:'#111', border:'1px solid rgba(255,184,0,0.25)' }
const focusOn  = e => e.target.style.borderColor = '#FFB800'
const focusOff = e => e.target.style.borderColor = 'rgba(255,184,0,0.25)'

export default function MenuManager() {
  const { items, loading } = useMenu(false)
  const [form, setForm]     = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  function startEdit(item) { setEditing(item.id); setForm({ ...item, price: item.price.toString() }) }
  function cancelEdit()    { setEditing(null); setForm(EMPTY) }

  async function handleSave(e) {
    e.preventDefault(); setSaving(true)
    const data = { ...form, price: parseFloat(form.price) }
    try {
      if (editing) { await updateDoc(doc(db,'menu',editing), data) }
      else { await addDoc(collection(db,'menu'), { ...data, createdAt: serverTimestamp() }) }
      cancelEdit()
    } finally { setSaving(false) }
  }

  async function toggleAvailable(item) {
    await updateDoc(doc(db,'menu',item.id), { available: !item.available })
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este plato?')) return
    await deleteDoc(doc(db,'menu',id))
  }

  if (loading) return <LoadingSpinner />

  const FIELDS = [
    { name:'name',        placeholder:'Nombre del plato *',      required:true },
    { name:'category',    placeholder:'Categoría (ej: Entradas) *', required:true },
    { name:'price',       placeholder:'Precio *',                required:true, type:'number' },
    { name:'imageUrl',    placeholder:'URL de imagen (opcional)' },
  ]

  return (
    <div className="space-y-6">

      {/* Formulario */}
      <form onSubmit={handleSave} className="rounded-2xl p-5"
            style={{ background:'#111', border:'1px solid rgba(255,184,0,0.2)' }}>
        <h3 className="font-black text-brand-gold mb-4">
          {editing ? '✏️ Editar plato' : '＋ Agregar plato'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FIELDS.map(f => (
            <input key={f.name} {...f} value={form[f.name]}
              onChange={e => setForm(p=>({...p,[f.name]:e.target.value}))}
              className={inputCls} style={inputStyle}
              onFocus={focusOn} onBlur={focusOff}
            />
          ))}
          <textarea placeholder="Descripción (opcional)" value={form.description} rows={2}
            onChange={e => setForm(p=>({...p,description:e.target.value}))}
            className={`${inputCls} resize-none sm:col-span-2`} style={inputStyle}
            onFocus={focusOn} onBlur={focusOff}
          />
        </div>
        <div className="flex gap-3 mt-4">
          <button type="submit" disabled={saving}
            className="font-black px-6 py-2.5 rounded-xl transition-all disabled:opacity-40"
            style={{ background:'#FFB800', color:'#000', boxShadow:saving?'none':'0 0 12px rgba(255,184,0,0.35)' }}>
            {saving ? 'Guardando…' : editing ? 'Actualizar' : 'Agregar'}
          </button>
          {editing && (
            <button type="button" onClick={cancelEdit}
              className="px-6 py-2.5 rounded-xl text-white/50 hover:text-white transition-colors"
              style={{ border:'1px solid rgba(255,255,255,0.15)' }}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Grid de platos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <div key={item.id}
               className={`rounded-2xl p-4 transition-opacity ${!item.available ? 'opacity-40' : ''}`}
               style={{ background:'#1a1a1a', border:'1px solid rgba(255,184,0,0.15)' }}>

            {item.imageUrl && (
              <img src={item.imageUrl} alt={item.name}
                   className="w-full h-28 object-cover rounded-xl mb-3" />
            )}

            <div className="flex justify-between items-start mb-1">
              <div className="min-w-0 pr-2">
                <p className="font-black text-white text-sm truncate">{item.name}</p>
                <p className="text-white/40 text-xs">{item.category}</p>
              </div>
              <span className="text-brand-gold font-black text-sm whitespace-nowrap">${item.price.toFixed(2)}</span>
            </div>

            {item.description && (
              <p className="text-white/30 text-xs mb-3 line-clamp-2">{item.description}</p>
            )}

            <div className="flex gap-2 mt-3">
              <button onClick={() => startEdit(item)}
                className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                style={{ border:'1px solid rgba(255,184,0,0.3)', color:'#FFB800' }}>
                Editar
              </button>
              <button onClick={() => toggleAvailable(item)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                  item.available ? 'bg-green-900/40 text-green-400' : 'bg-white/10 text-white/40'
                }`}>
                {item.available ? 'Disponible' : 'No disp.'}
              </button>
              <button onClick={() => handleDelete(item.id)}
                className="text-xs font-bold px-3 py-1.5 rounded-lg ml-auto"
                style={{ background:'rgba(232,0,28,0.15)', color:'#E8001C', border:'1px solid rgba(232,0,28,0.3)' }}>
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
