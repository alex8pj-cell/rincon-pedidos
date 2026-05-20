import { useState } from 'react'
import {
  collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp
} from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useMenu } from '../../hooks/useMenu'
import LoadingSpinner from '../shared/LoadingSpinner'

const EMPTY = { name: '', category: '', price: '', description: '', available: true, imageUrl: '' }

export default function MenuManager() {
  const { items, loading } = useMenu(false)
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  function startEdit(item) {
    setEditing(item.id)
    setForm({ ...item, price: item.price.toString() })
  }

  function cancelEdit() {
    setEditing(null)
    setForm(EMPTY)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    const data = { ...form, price: parseFloat(form.price) }
    try {
      if (editing) {
        await updateDoc(doc(db, 'menu', editing), data)
      } else {
        await addDoc(collection(db, 'menu'), { ...data, createdAt: serverTimestamp() })
      }
      cancelEdit()
    } finally {
      setSaving(false)
    }
  }

  async function toggleAvailable(item) {
    await updateDoc(doc(db, 'menu', item.id), { available: !item.available })
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este plato?')) return
    await deleteDoc(doc(db, 'menu', id))
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <form onSubmit={handleSave} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-4">{editing ? 'Editar plato' : 'Agregar plato'}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { name: 'name', placeholder: 'Nombre del plato', required: true },
            { name: 'category', placeholder: 'Categoría (ej: Entradas)', required: true },
            { name: 'price', placeholder: 'Precio', type: 'number', required: true },
            { name: 'imageUrl', placeholder: 'URL de imagen (opcional)' },
          ].map(field => (
            <input
              key={field.name}
              {...field}
              value={form[field.name]}
              onChange={e => setForm(f => ({ ...f, [field.name]: e.target.value }))}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            />
          ))}
          <textarea
            placeholder="Descripción (opcional)"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={2}
            className="sm:col-span-2 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400 resize-none"
          />
        </div>
        <div className="flex gap-3 mt-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold px-6 py-2.5 rounded-xl text-sm"
          >
            {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Agregar'}
          </button>
          {editing && (
            <button type="button" onClick={cancelEdit} className="border border-gray-200 text-gray-600 px-6 py-2.5 rounded-xl text-sm hover:bg-gray-50">
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <div key={item.id} className={`bg-white rounded-2xl border p-4 shadow-sm ${!item.available ? 'opacity-60' : 'border-gray-100'}`}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                <p className="text-xs text-gray-400">{item.category}</p>
              </div>
              <span className="text-amber-600 font-bold text-sm">${item.price.toFixed(2)}</span>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => startEdit(item)} className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">Editar</button>
              <button onClick={() => toggleAvailable(item)} className={`text-xs px-3 py-1.5 rounded-lg ${item.available ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {item.available ? 'Disponible' : 'No disp.'}
              </button>
              <button onClick={() => handleDelete(item.id)} className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 ml-auto">Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
