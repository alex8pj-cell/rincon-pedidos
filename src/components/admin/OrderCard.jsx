const STATUS_STYLES = {
  pending:   { label: 'Pendiente',  cls: 'bg-yellow-100 text-yellow-800' },
  preparing: { label: 'Preparando', cls: 'bg-blue-100   text-blue-800'   },
  ready:     { label: 'Listo',      cls: 'bg-green-100  text-green-800'  },
  delivered: { label: 'Entregado',  cls: 'bg-gray-100   text-gray-600'   },
}

const NEXT_STATUS = {
  pending:   'preparing',
  preparing: 'ready',
  ready:     'delivered',
}

const ORDER_TYPE_LABELS = {
  domicilio:    '🚚 Domicilio',
  recoger:      '🏃 Recoger',
  'para-llevar':'🥡 Para llevar',
  mesa:         '🪑 Mesa',
}

const PAYMENT_LABELS = {
  efectivo:      '💵 Efectivo',
  tarjeta:       '💳 Tarjeta',
  transferencia: '📲 Transferencia',
}

export default function OrderCard({ order, onUpdateStatus }) {
  const status     = STATUS_STYLES[order.status] || STATUS_STYLES.pending
  const nextStatus = NEXT_STATUS[order.status]

  const time = order.createdAt?.toDate
    ? order.createdAt.toDate().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
    : '–'

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col gap-3">

      {/* ── Cabecera ── */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-bold text-gray-900 text-sm leading-tight truncate">
            {order.customerName || order.table || 'Cliente'}
          </p>
          <p className="text-gray-400 text-xs mt-0.5">
            {time}
            {order.phone && <span className="ml-2">📞 {order.phone}</span>}
          </p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 ${status.cls}`}>
          {status.label}
        </span>
      </div>

      {/* ── Tipo de pedido ── */}
      <div className="flex flex-wrap gap-1.5">
        {order.orderType && (
          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-lg font-medium">
            {ORDER_TYPE_LABELS[order.orderType] ?? order.orderType}
          </span>
        )}
        {order.orderType === 'domicilio' && order.zone && (
          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-lg font-medium">
            📍 {order.zone.name}
          </span>
        )}
        {order.orderType === 'mesa' && order.tableNumber && (
          <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-lg font-medium">
            🪑 {order.tableNumber}
          </span>
        )}
        {order.paymentMethod && (
          <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-lg font-medium">
            {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
          </span>
        )}
      </div>

      {/* ── Dirección ── */}
      {order.address && (
        <p className="text-xs text-gray-500 bg-blue-50 rounded-xl px-3 py-1.5 border border-blue-100">
          🏠 {order.address}
        </p>
      )}

      {/* ── Productos ── */}
      <ul className="space-y-1.5">
        {order.items?.map((item, i) => (
          <li key={i}>
            <div className="flex justify-between text-sm">
              <span className="text-gray-700 font-medium">{item.name} <span className="text-gray-400 font-normal">×{item.qty}</span></span>
              <span className="text-gray-600 font-medium">${(item.price * item.qty).toFixed(2)}</span>
            </div>
            {item.note && (
              <p className="text-xs text-amber-700 ml-2 mt-0.5">✏️ {item.note}</p>
            )}
          </li>
        ))}
      </ul>

      {/* ── Nota general ── */}
      {order.note && (
        <p className="text-xs text-gray-600 bg-yellow-50 rounded-xl px-3 py-2 border border-yellow-100">
          📝 {order.note}
        </p>
      )}

      {/* ── Footer: total + acción ── */}
      <div className="flex items-center justify-between border-t pt-3 gap-2">
        <div className="text-sm">
          {order.deliveryCost > 0 && (
            <p className="text-gray-400 text-xs">Envío +${order.deliveryCost?.toFixed(2)}</p>
          )}
          <p className="font-bold text-amber-600 text-base">${order.total?.toFixed(2)}</p>
        </div>
        {nextStatus ? (
          <button
            onClick={() => onUpdateStatus(order.id, nextStatus)}
            className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold
                       px-4 py-2 rounded-xl transition-colors"
          >
            → {STATUS_STYLES[nextStatus].label}
          </button>
        ) : (
          <span className="text-xs text-gray-400 italic">Completado</span>
        )}
      </div>
    </div>
  )
}
