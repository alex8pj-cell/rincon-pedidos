import { useState } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '../../firebase/config'
import { useOrders } from '../../hooks/useOrders'
import OrderCard from '../../components/admin/OrderCard'
import MenuManager from '../../components/admin/MenuManager'
import LoadingSpinner from '../../components/shared/LoadingSpinner'

const TABS = ['Pedidos', 'Menú']

const STATUS_COLS = [
  { key: 'pending',   label: 'Pendientes',  color: 'border-yellow-400' },
  { key: 'preparing', label: 'Preparando',  color: 'border-blue-400' },
  { key: 'ready',     label: 'Listos',      color: 'border-green-400' },
  { key: 'delivered', label: 'Entregados',  color: 'border-gray-300' },
]

export default function DashboardPage() {
  const [tab, setTab] = useState('Pedidos')
  const { orders, loading, updateStatus } = useOrders()

  const activeOrders = orders.filter(o => o.status !== 'delivered')
  const todayRevenue = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + (o.total || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🍽️</span>
            <div>
              <h1 className="font-bold text-gray-900 text-base leading-tight">El Rincón de Las Delicias</h1>
              <p className="text-xs text-gray-400">Panel de administración</p>
            </div>
          </div>
          <button
            onClick={() => signOut(auth)}
            className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Pedidos activos', value: activeOrders.length, icon: '🔥' },
            { label: 'Pendientes', value: orders.filter(o => o.status === 'pending').length, icon: '⏳' },
            { label: 'En preparación', value: orders.filter(o => o.status === 'preparing').length, icon: '👨‍🍳' },
            { label: 'Ventas hoy', value: `$${todayRevenue.toFixed(2)}`, icon: '💰' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="text-2xl mb-1">{stat.icon}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Pedidos */}
        {tab === 'Pedidos' && (
          loading ? <LoadingSpinner /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {STATUS_COLS.map(col => {
                const colOrders = orders.filter(o => o.status === col.key)
                return (
                  <div key={col.key} className={`bg-gray-100 rounded-2xl p-3 border-t-4 ${col.color}`}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-700 text-sm">{col.label}</h3>
                      <span className="bg-white text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                        {colOrders.length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {colOrders.length === 0 ? (
                        <p className="text-center text-gray-400 text-xs py-6">Sin pedidos</p>
                      ) : (
                        colOrders.map(order => (
                          <OrderCard key={order.id} order={order} onUpdateStatus={updateStatus} />
                        ))
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}

        {/* Menú */}
        {tab === 'Menú' && <MenuManager />}
      </div>
    </div>
  )
}
