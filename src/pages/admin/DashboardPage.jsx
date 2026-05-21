import { useState } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '../../firebase/config'
import { useOrders } from '../../hooks/useOrders'
import OrderCard from '../../components/admin/OrderCard'
import MenuManager from '../../components/admin/MenuManager'
import PromotionsManager from '../../components/admin/PromotionsManager'
import LoadingSpinner from '../../components/shared/LoadingSpinner'

const TABS = [
  { key:'Pedidos',      icon:'🔥' },
  { key:'Menú',         icon:'🍽️' },
  { key:'Promociones',  icon:'⭐' },
]

const STATUS_COLS = [
  { key:'pending',   label:'Pendientes', color:'#FFB800' },
  { key:'preparing', label:'Preparando', color:'#3b82f6' },
  { key:'ready',     label:'Listos',     color:'#22c55e' },
  { key:'delivered', label:'Entregados', color:'#ffffff30' },
]

export default function DashboardPage() {
  const [tab, setTab] = useState('Pedidos')
  const { orders, loading, updateStatus } = useOrders()

  const activeOrders  = orders.filter(o => o.status !== 'delivered')
  const todayRevenue  = orders.filter(o => o.status === 'delivered').reduce((s,o)=>s+(o.total||0),0)

  const STATS = [
    { label:'Pedidos activos',  value: activeOrders.length,                              icon:'🔥', color:'#FFB800' },
    { label:'Pendientes',       value: orders.filter(o=>o.status==='pending').length,    icon:'⏳', color:'#FFB800' },
    { label:'En preparación',   value: orders.filter(o=>o.status==='preparing').length,  icon:'👨‍🍳', color:'#3b82f6' },
    { label:'Ventas hoy',       value:`$${todayRevenue.toFixed(2)}`,                     icon:'💰', color:'#22c55e' },
  ]

  return (
    <div className="min-h-screen" style={{ background:'#000' }}>

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-20"
              style={{ background:'#000', borderBottom:'1px solid rgba(255,184,0,0.2)' }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🍽️</span>
            <div>
              <h1 className="font-black text-base leading-tight">
                <span className="text-brand-red">El Rincón</span>{' '}
                <span className="text-brand-gold">de Las Delicias</span>
              </h1>
              <p className="text-white/30 text-xs uppercase tracking-wider">Panel Admin</p>
            </div>
          </div>
          <button onClick={() => signOut(auth)}
            className="text-sm font-bold text-white/40 hover:text-white transition-colors px-3 py-1.5 rounded-lg"
            style={{ border:'1px solid rgba(255,255,255,0.1)' }}>
            Salir
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* ── STATS ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STATS.map(s => (
            <div key={s.label} className="rounded-2xl p-4"
                 style={{ background:'#111', border:`1px solid ${s.color}30` }}>
              <p className="text-2xl mb-1">{s.icon}</p>
              <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
              <p className="text-white/30 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── TABS ── */}
        <div className="flex gap-1 p-1 rounded-2xl w-fit"
             style={{ background:'#111', border:'1px solid rgba(255,184,0,0.15)' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="px-5 py-2 rounded-xl text-sm font-black transition-all flex items-center gap-2"
              style={tab === t.key
                ? { background:'#FFB800', color:'#000', boxShadow:'0 0 12px rgba(255,184,0,0.35)' }
                : { color:'rgba(255,255,255,0.4)' }
              }>
              <span>{t.icon}</span> {t.key}
            </button>
          ))}
        </div>

        {/* ── PEDIDOS — kanban ── */}
        {tab === 'Pedidos' && (
          loading ? <LoadingSpinner /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {STATUS_COLS.map(col => {
                const colOrders = orders.filter(o => o.status === col.key)
                return (
                  <div key={col.key} className="rounded-2xl p-3"
                       style={{ background:'#0d0d0d', borderTop:`3px solid ${col.color}`, border:`1px solid rgba(255,255,255,0.06)`, borderTopColor: col.color }}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-black text-sm" style={{ color: col.color }}>{col.label}</h3>
                      <span className="text-xs font-black px-2 py-0.5 rounded-full"
                            style={{ background:`${col.color}20`, color: col.color }}>
                        {colOrders.length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {colOrders.length === 0
                        ? <p className="text-center text-white/20 text-xs py-8">Sin pedidos</p>
                        : colOrders.map(o => <OrderCard key={o.id} order={o} onUpdateStatus={updateStatus} />)
                      }
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}

        {/* ── MENÚ ── */}
        {tab === 'Menú' && <MenuManager />}

        {/* ── PROMOCIONES ── */}
        {tab === 'Promociones' && <PromotionsManager />}
      </div>
    </div>
  )
}
