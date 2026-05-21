import { useState } from 'react'
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { usePromotions } from '../../hooks/usePromotions'
import LoadingSpinner from '../shared/LoadingSpinner'

const EMPTY = { title:'', description:'', badge:'', color:'gold', active:true, order:0 }
const inputCls = `w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30
                  focus:outline-none transition-all`
const inputStyle = { background:'#111', border:'1px solid rgba(255,184,0,0.25)' }

export default function PromotionsManager() {
  const { promotions, loading } = usePromotions(false)
  const [form, setForm]     = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  function startEdit(p) { setEditing(p.id); setForm({ ...p }) }
  function cancel()     { setEditing(null); setForm(EMPTY) }

  async function handleSave(e) {
    e.preventDefault(); setSaving(true)
    try {
      if (editing) { await updateDoc(doc(db,'promotions',editing), form) }
      else { await addDoc(collection(db,'promotions'), { ...form, createdAt: serverTimestamp() }) }
      cancel()
    } finally { setSaving(false) }
  }

  async function toggleActive(p) {
    await updateDoc(doc(db,'promotions',p.id), { active: !p.active })
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar esta promoción?')) return
    await deleteDoc(doc(db,'promotions',id))
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">

      {/* Formulario */}
      <form onSubmit={handleSave} className="rounded-2xl p-5"
            style={{ background:'#111', border:'1px solid rgba(255,184,0,0.2)' }}>
        <h3 className="font-black text-brand-gold mb-4">
          {editing ? '✏️ Editar promoción' : '＋ Nueva promoción'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input required placeholder="Título *" value={form.title}
            onChange={e=>setForm(f=>({...f,title:e.target.value}))}
            className={inputCls} style={inputStyle}
            onFocus={e=>e.target.style.borderColor='#FFB800'}
            onBlur={e=>e.target.style.borderColor='rgba(255,184,0,0.25)'}
          />
          <input placeholder="Emoji/badge (ej: 🔥)" value={form.badge}
            onChange={e=>setForm(f=>({...f,badge:e.target.value}))}
            className={inputCls} style={inputStyle}
            onFocus={e=>e.target.style.borderColor='#FFB800'}
            onBlur={e=>e.target.style.borderColor='rgba(255,184,0,0.25)'}
          />
          <textarea placeholder="Descripción breve" value={form.description} rows={2}
            onChange={e=>setForm(f=>({...f,description:e.target.value}))}
            className={`${inputCls} resize-none sm:col-span-2`} style={inputStyle}
            onFocus={e=>e.target.style.borderColor='#FFB800'}
            onBlur={e=>e.target.style.borderColor='rgba(255,184,0,0.25)'}
          />

          {/* Color */}
          <div className="flex gap-3">
            {['gold','red'].map(c => (
              <button key={c} type="button" onClick={() => setForm(f=>({...f,color:c}))}
                className="flex-1 py-2.5 rounded-xl font-black text-sm transition-all"
                style={form.color === c
                  ? { background: c==='gold'?'#FFB800':'#E8001C', color:'#000', boxShadow:`0 0 12px ${c==='gold'?'rgba(255,184,0,0.5)':'rgba(232,0,28,0.5)'}` }
                  : { background:'#1a1a1a', color:'#fff', border:'1px solid rgba(255,255,255,0.1)' }
                }>
                {c === 'gold' ? '🟡 Dorado' : '🔴 Rojo'}
              </button>
            ))}
          </div>

          {/* Orden */}
          <input type="number" placeholder="Orden (0,1,2…)" value={form.order}
            onChange={e=>setForm(f=>({...f,order:Number(e.target.value)}))}
            className={inputCls} style={inputStyle}
            onFocus={e=>e.target.style.borderColor='#FFB800'}
            onBlur={e=>e.target.style.borderColor='rgba(255,184,0,0.25)'}
          />
        </div>

        <div className="flex gap-3 mt-4">
          <button type="submit" disabled={saving}
            className="font-black px-6 py-2.5 rounded-xl transition-all disabled:opacity-40"
            style={{ background:'#FFB800', color:'#000', boxShadow: saving?'none':'0 0 12px rgba(255,184,0,0.35)' }}>
            {saving ? 'Guardando…' : editing ? 'Actualizar' : 'Agregar'}
          </button>
          {editing && (
            <button type="button" onClick={cancel}
              className="px-6 py-2.5 rounded-xl text-white/60 hover:text-white transition-colors"
              style={{ border:'1px solid rgba(255,255,255,0.15)' }}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Lista */}
      {promotions.length === 0 ? (
        <p className="text-center text-white/30 py-8">No hay promociones. ¡Crea la primera!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {promotions.map(p => (
            <div key={p.id} className={`rounded-2xl p-4 transition-opacity ${!p.active ? 'opacity-40' : ''}`}
                 style={{ background:'#1a1a1a', border:'1px solid rgba(255,184,0,0.15)' }}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  {p.badge && <span className="text-xl mr-1">{p.badge}</span>}
                  <span className="font-black text-white text-sm">{p.title}</span>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.color==='red'?'bg-red-900/40 text-red-400':'bg-yellow-900/40 text-yellow-400'}`}>
                  {p.color === 'red' ? '🔴' : '🟡'}
                </span>
              </div>
              {p.description && <p className="text-white/50 text-xs mb-3">{p.description}</p>}
              <div className="flex gap-2">
                <button onClick={() => startEdit(p)}
                  className="text-xs px-3 py-1.5 rounded-lg font-bold transition-colors"
                  style={{ border:'1px solid rgba(255,184,0,0.3)', color:'#FFB800' }}>
                  Editar
                </button>
                <button onClick={() => toggleActive(p)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors ${p.active?'bg-green-900/40 text-green-400':'bg-white/10 text-white/40'}`}>
                  {p.active ? 'Visible' : 'Oculta'}
                </button>
                <button onClick={() => handleDelete(p.id)}
                  className="text-xs px-3 py-1.5 rounded-lg font-bold ml-auto"
                  style={{ background:'rgba(232,0,28,0.15)', color:'#E8001C', border:'1px solid rgba(232,0,28,0.3)' }}>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
