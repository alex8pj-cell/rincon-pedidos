import { useState } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '../../firebase/config'
import { useOrders } from '../../hooks/useOrders'
import OrderCard from '../../components/admin/OrderCard'
import MenuManager from '../../components/admin/MenuManager'
import PromotionsManager from '../../components/admin/PromotionsManager'
import TablesPanel from '../../components/admin/TablesPanel'
import AvailabilityPanel from '../../components/admin/AvailabilityPanel'
import ConfigPanel from '../../components/admin/ConfigPanel'
import LoadingSpinner from '../../components/shared/LoadingSpinner'

const TABS = [
  { key: 'Pedidos',        icon: '📋', enabled: true  },
  { key: 'Mesas',          icon: '🪑', enabled: true  },
  { key: 'Menú',           icon: '🍽️', enabled: true  },
  { key: 'Disponibilidad', icon: '✅', enabled: true  },
  { key: 'Configuración',  icon: '⚙️', enabled: true  },
  { key: 'Comandas',       icon: '🖨️', enabled: false },
  { key: 'Caja',           icon: '💰', enabled: false },
]

const STATUS_COLS = [
  { key: 'pending',   label: 'Pendientes', dotColor: '#FFB800' },
  { key: 'preparing', label: 'Preparando', dotColor: '#3b82f6' },
  { key: 'ready',     label: 'Listos',     dotColor: '#22c55e' },
  { key: 'delivered', label: 'Entregados', dotColor: '#9CA3AF' },
]

const TYPE_FILTER_OPTIONS = [
  { key: '', label: 'Todos' },
  { key: 'domicilio',     label: '🚚 Domicilio' },
  { key: 'recoger',       label: '🏃 Recoger' },
  { key: 'para-llevar',   label: '🥡 Para llevar' },
  { key: 'mesa',          label: '🪑 Mesa' },
]

function OrdersTab({ orders, loading, updateStatus }) {
  const [typeFilter, setTypeFilter]     = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const filtered = orders.filter(o =>
    (!typeFilter   || o.orderType === typeFilter) &&
    (!statusFilter || o.status    === statusFilter)
  )

  const activeOrders  = orders.filter(o => o.status !== 'delivered')
  const todayRevenue  = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + (o.total || 0), 0)

  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Activos',      value: activeOrders.length,                              dot: '#FFB800' },
          { label: 'Pendientes',   value: orders.filter(o => o.status === 'pending').length,   dot: '#FFB800' },
          { label: 'Preparando',   value: orders.filter(o => o.status === 'preparing').length, dot: '#3b82f6' },
          { label: 'Ventas hoy',   value: `$${todayRevenue.toFixed(2)}`,                       dot: '#22c55e' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-card">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ background: s.dot }} />
              <p className="text-xs text-[#6B7280] font-medium">{s.label}</p>
            </div>
            <p className="text-2xl font-bold text-[#111111]">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-1 bg-white border border-[#E5E7EB] rounded-xl p-1">
          {TYPE_FILTER_OPTIONS.map(o => (
            <button key={o.key} onClick={() => setTypeFilter(o.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                typeFilter === o.key ? 'bg-[#FFB800] text-[#111111]' : 'text-[#6B7280] hover:text-[#111111]'
              }`}>
              {o.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-white border border-[#E5E7EB] rounded-xl p-1">
          {[{ key: '', label: 'Todos' }, ...STATUS_COLS.map(c => ({ key: c.key, label: c.label }))].map(o => (
            <button key={o.key} onClick={() => setStatusFilter(o.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === o.key ? 'bg-[#FFB800] text-[#111111]' : 'text-[#6B7280] hover:text-[#111111]'
              }`}>
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban */}
      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STATUS_COLS.map(col => {
            const colOrders = filtered.filter(o => o.status === col.key)
            return (
              <div key={col.key} className="bg-[#F9FAFB] rounded-2xl p-3 border border-[#E5E7EB]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: col.dotColor }} />
                    <h3 className="font-bold text-sm text-[#111111]">{col.label}</h3>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white border border-[#E5E7EB] text-[#6B7280]">
                    {colOrders.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {colOrders.length === 0 ? (
                    <p className="text-center text-[#6B7280] text-xs py-8">Sin pedidos</p>
                  ) : colOrders.map(o => (
                    <OrderCard key={o.id} order={o} onUpdateStatus={updateStatus} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const [tab, setTab] = useState('Pedidos')
  const { orders, loading, updateStatus } = useOrders()

  return (
    <div className="min-h-screen bg-[#F9FAFB]">

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-20 bg-white border-b border-[#E5E7EB] shadow-card">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#111111] flex items-center justify-center text-base">🍽️</div>
            <div>
              <h1 className="font-bold text-[#111111] text-base leading-tight">El Rincón de Las Delicias</h1>
              <p className="text-[#6B7280] text-xs uppercase tracking-wider">Panel Admin</p>
            </div>
          </div>
          <button
            onClick={() => signOut(auth)}
            className="text-sm font-bold text-[#6B7280] hover:text-[#111111] transition-colors px-3 py-1.5 rounded-lg border border-[#E5E7EB] hover:border-[#E5E7EB] bg-white">
            Salir
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* ── TABS ── */}
        <div className="flex gap-1 flex-wrap">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => t.enabled && setTab(t.key)}
              disabled={!t.enabled}
              title={!t.enabled ? 'Próximamente' : undefined}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                !t.enabled
                  ? 'text-[#9CA3AF] bg-white border border-[#E5E7EB] cursor-not-allowed opacity-60'
                  : tab === t.key
                    ? 'bg-[#111111] text-white shadow-card'
                    : 'bg-white border border-[#E5E7EB] text-[#6B7280] hover:text-[#111111] hover:border-[#111111]/20'
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.key}</span>
              {!t.enabled && (
                <span className="text-[9px] font-bold bg-[#F3F4F6] text-[#9CA3AF] rounded-full px-1.5 py-0.5">
                  soon
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── TAB CONTENT ── */}
        {tab === 'Pedidos' && (
          <OrdersTab orders={orders} loading={loading} updateStatus={updateStatus} />
        )}
        {tab === 'Mesas' && <TablesPanel />}
        {tab === 'Menú' && <MenuManager />}
        {tab === 'Disponibilidad' && <AvailabilityPanel />}
        {tab === 'Configuración' && (
          <div className="space-y-5">
            <ConfigPanel />
            <div className="border-t border-[#E5E7EB] pt-5">
              <h3 className="font-bold text-[#111111] text-base mb-3">Promociones destacadas</h3>
              <PromotionsManager />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
