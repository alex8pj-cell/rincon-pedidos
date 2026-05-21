import { useState, useRef } from 'react'
import { useTables } from '../../hooks/useTables'
import { useMenu } from '../../hooks/useMenu'
import LoadingSpinner from '../shared/LoadingSpinner'

// ── Table chip on the floor plan ───────────────────────────────────────────────
function TableChip({ table, selected, onSelect, onDragEnd }) {
  const ref = useRef(null)
  const dragOffset = useRef({ x: 0, y: 0 })

  function onMouseDown(e) {
    e.preventDefault()
    const rect = ref.current.getBoundingClientRect()
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  function onMouseMove(e) {
    const parent = ref.current.parentElement.getBoundingClientRect()
    const x = Math.max(0, Math.min(e.clientX - parent.left - dragOffset.current.x, parent.width  - 80))
    const y = Math.max(0, Math.min(e.clientY - parent.top  - dragOffset.current.y, parent.height - 80))
    ref.current.style.left = x + 'px'
    ref.current.style.top  = y + 'px'
  }

  function onMouseUp() {
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
    const left = parseInt(ref.current.style.left)
    const top  = parseInt(ref.current.style.top)
    onDragEnd(table.id, left, top)
  }

  const statusColor = {
    available: '#22c55e',
    occupied:  '#FFB800',
    reserved:  '#3b82f6',
  }[table.status] ?? '#6B7280'

  return (
    <div
      ref={ref}
      className="absolute w-20 h-20 select-none"
      style={{ left: table.posX ?? 0, top: table.posY ?? 0 }}
    >
      <button
        onMouseDown={onMouseDown}
        onClick={() => onSelect(table)}
        className={`w-full h-full rounded-2xl border-2 flex flex-col items-center justify-center gap-0.5 transition-all ${
          selected?.id === table.id
            ? 'border-[#FFB800] bg-[#FFF7E0]'
            : 'bg-white border-[#E5E7EB] hover:border-[#FFB800]/50 shadow-card'
        }`}
      >
        <span className="text-2xl">🪑</span>
        <p className="text-xs font-bold text-[#111111] leading-none">{table.name}</p>
        <div className="w-2 h-2 rounded-full mt-0.5" style={{ background: statusColor }} />
      </button>
    </div>
  )
}

// ── Account panel for a selected table ────────────────────────────────────────
function TableAccount({ table, menuItems, onAddItem, onRemoveItem, onClose, onCloseAccount }) {
  const [search, setSearch] = useState('')
  const [qty, setQty]       = useState(1)
  const [pickedItem, setPicked] = useState(null)

  const filteredMenu = menuItems.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase())
  )

  async function handleAdd() {
    if (!pickedItem) return
    await onAddItem(table.id, { ...pickedItem, qty, note: '', selectedCustomizations: {} })
    setPicked(null); setSearch(''); setQty(1)
  }

  const account = table.account ?? { items: [], total: 0 }
  const hasItems = account.items.length > 0

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-float">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB] bg-[#F9FAFB]">
        <div>
          <h3 className="font-bold text-[#111111]">{table.name}</h3>
          <p className="text-xs text-[#6B7280]">{table.seats} sillas · {
            table.status === 'available' ? 'Disponible' : 'Ocupada'
          }</p>
        </div>
        <button onClick={onClose}
          className="w-8 h-8 rounded-full bg-[#F3F4F6] hover:bg-[#E5E7EB] flex items-center justify-center text-[#6B7280] text-lg transition-colors">
          ×
        </button>
      </div>

      {/* Add item */}
      <div className="p-4 border-b border-[#E5E7EB]">
        <p className="text-sm font-bold text-[#111111] mb-2">Agregar al cuenta</p>
        <div className="flex gap-2 mb-2">
          <input
            className="field text-sm flex-1"
            placeholder="Buscar producto…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPicked(null) }}
          />
          <input
            className="field text-sm w-16 text-center"
            type="number" min="1" max="20"
            value={qty}
            onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
          />
        </div>
        {search && filteredMenu.length > 0 && (
          <div className="border border-[#E5E7EB] rounded-xl overflow-hidden mb-2 max-h-40 overflow-y-auto">
            {filteredMenu.map(item => (
              <button key={item.id}
                className={`w-full flex justify-between px-3 py-2 text-sm text-left hover:bg-[#F9FAFB] transition-colors ${
                  pickedItem?.id === item.id ? 'bg-[#FFF7E0]' : ''
                }`}
                onClick={() => { setPicked(item); setSearch(item.name) }}
              >
                <span className="font-medium text-[#111111]">{item.name}</span>
                <span className="text-[#6B7280]">${Number(item.price).toFixed(2)}</span>
              </button>
            ))}
          </div>
        )}
        <button onClick={handleAdd} disabled={!pickedItem}
          className="w-full py-2 rounded-xl bg-[#FFB800] text-[#111111] font-bold text-sm disabled:opacity-40 hover:bg-[#e6a600] transition-colors">
          + Agregar
        </button>
      </div>

      {/* Account items */}
      <div className="p-4 space-y-2 max-h-60 overflow-y-auto">
        {!hasItems ? (
          <p className="text-center text-[#6B7280] text-sm py-4">Mesa sin consumo</p>
        ) : account.items.map(item => (
          <div key={item._key} className="flex items-center gap-2 p-2 rounded-xl bg-[#F9FAFB]">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[#111111] text-sm truncate">{item.name}</p>
              <p className="text-xs text-[#6B7280]">{item.qty} × ${Number(item.price).toFixed(2)}</p>
            </div>
            <p className="font-bold text-[#111111] text-sm">${(item.price * item.qty).toFixed(2)}</p>
            <button onClick={() => onRemoveItem(table.id, item._key)}
              className="text-[#E8001C] hover:opacity-70 text-sm ml-1">✕</button>
          </div>
        ))}
      </div>

      {/* Footer */}
      {hasItems && (
        <div className="px-4 pb-4 border-t border-[#E5E7EB] pt-3">
          <div className="flex justify-between font-bold mb-3">
            <span className="text-[#6B7280] text-sm">Total cuenta</span>
            <span className="text-[#111111] text-xl">${Number(account.total).toFixed(2)}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="flex-1 py-2.5 rounded-xl border border-[#E5E7EB] text-sm font-bold text-[#6B7280] hover:text-[#111111] transition-colors">
              🖨️ Comanda
            </button>
            <button
              onClick={() => onCloseAccount(table.id)}
              className="flex-1 py-2.5 rounded-xl bg-[#E8001C] text-white text-sm font-bold hover:opacity-90 transition-opacity">
              Cerrar cuenta
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main TablesPanel ───────────────────────────────────────────────────────────
export default function TablesPanel() {
  const { tables, loading, createTable, updateTablePosition, addItemToTable, removeItemFromTable, closeTableAccount } = useTables()
  const { items: menuItems } = useMenu(true)

  const [selected, setSelected] = useState(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newTable, setNewTable] = useState({ name: '', seats: 4 })
  const [creating, setCreating] = useState(false)

  async function handleCreate(e) {
    e.preventDefault(); setCreating(true)
    await createTable({ name: newTable.name, seats: parseInt(newTable.seats) || 4 })
    setNewTable({ name: '', seats: 4 }); setShowNewForm(false); setCreating(false)
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-4">

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="flex gap-4 text-xs text-[#6B7280]">
          {[['available','#22c55e','Disponible'],['occupied','#FFB800','Ocupada']].map(([s,c,l]) => (
            <span key={s} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />{l}
            </span>
          ))}
        </div>
        <button onClick={() => setShowNewForm(v => !v)}
          className="ml-auto text-sm font-bold text-[#FFB800] hover:text-[#111111] transition-colors">
          + Nueva mesa
        </button>
      </div>

      {/* New table form */}
      {showNewForm && (
        <form onSubmit={handleCreate} className="flex gap-2 items-end bg-white border border-[#E5E7EB] rounded-2xl p-4">
          <div className="flex-1">
            <label className="text-xs font-bold text-[#111111] mb-1 block">Nombre</label>
            <input className="field text-sm" value={newTable.name} required
              onChange={e => setNewTable(p => ({ ...p, name: e.target.value }))}
              placeholder="Mesa 1, Barra A…" />
          </div>
          <div className="w-20">
            <label className="text-xs font-bold text-[#111111] mb-1 block">Sillas</label>
            <input className="field text-sm text-center" type="number" min="1" max="20"
              value={newTable.seats}
              onChange={e => setNewTable(p => ({ ...p, seats: e.target.value }))} />
          </div>
          <button type="submit" disabled={creating}
            className="px-4 py-2 rounded-xl bg-[#FFB800] text-[#111111] font-bold text-sm disabled:opacity-40">
            {creating ? '…' : 'Crear'}
          </button>
        </form>
      )}

      {/* Floor plan + account panel side-by-side */}
      <div className="flex gap-4 flex-col lg:flex-row">

        {/* Floor plan */}
        <div className="flex-1 relative bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl overflow-hidden"
          style={{ minHeight: '400px' }}>
          {tables.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-16">
              <span className="text-5xl">🪑</span>
              <p className="text-[#6B7280] text-sm">No hay mesas.<br />Crea la primera arriba.</p>
            </div>
          ) : (
            tables.map(table => (
              <TableChip
                key={table.id}
                table={table}
                selected={selected}
                onSelect={t => setSelected(prev => prev?.id === t.id ? null : t)}
                onDragEnd={updateTablePosition}
              />
            ))
          )}
          <p className="absolute bottom-2 right-3 text-[10px] text-[#6B7280]">
            Arrastra para reposicionar · Clic para ver cuenta
          </p>
        </div>

        {/* Account panel */}
        {selected && (
          <div className="lg:w-80 shrink-0">
            <TableAccount
              table={tables.find(t => t.id === selected.id) ?? selected}
              menuItems={menuItems}
              onAddItem={addItemToTable}
              onRemoveItem={removeItemFromTable}
              onClose={() => setSelected(null)}
              onCloseAccount={async (id) => { await closeTableAccount(id); setSelected(null) }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
