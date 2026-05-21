const STATUS = {
  pending:   { label: 'Pendiente',  bg: '#FFF7E0', text: '#92600A',  border: '#FFB800' },
  preparing: { label: 'Preparando', bg: '#EFF6FF', text: '#1D4ED8',  border: '#3b82f6' },
  ready:     { label: 'Listo',      bg: '#F0FDF4', text: '#166534',  border: '#22c55e' },
  delivered: { label: 'Entregado',  bg: '#F9FAFB', text: '#6B7280',  border: '#E5E7EB' },
}
const NEXT = { pending: 'preparing', preparing: 'ready', ready: 'delivered' }

const ORDER_TYPE_LABELS = {
  domicilio:     '🚚 Domicilio',
  recoger:       '🏃 Recoger',
  'para-llevar': '🥡 Para llevar',
  mesa:          '🪑 Mesa',
}
const PAYMENT_LABELS = {
  efectivo:      '💵 Efectivo',
  tarjeta:       '💳 Tarjeta',
  transferencia: '📲 Transferencia',
}

export default function OrderCard({ order, onUpdateStatus }) {
  const s    = STATUS[order.status] || STATUS.pending
  const next = NEXT[order.status]
  const ns   = next ? STATUS[next] : null
  const time = order.createdAt?.toDate
    ? order.createdAt.toDate().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
    : '–'

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 flex flex-col gap-3 shadow-card">

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-bold text-[#111111] text-sm truncate">
            {order.customerName || order.table || 'Cliente'}
          </p>
          <p className="text-[#6B7280] text-xs mt-0.5">
            {time}
            {order.phone && <span className="ml-2">📞 {order.phone}</span>}
          </p>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0 whitespace-nowrap border"
          style={{ background: s.bg, color: s.text, borderColor: s.border }}>
          {s.label}
        </span>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {order.orderType && (
          <span className="text-xs px-2 py-0.5 rounded-lg font-medium bg-[#FFF7E0] text-[#92600A] border border-[#FFB800]/30">
            {ORDER_TYPE_LABELS[order.orderType] ?? order.orderType}
          </span>
        )}
        {order.orderType === 'domicilio' && order.zone && (
          <span className="text-xs px-2 py-0.5 rounded-lg font-medium bg-blue-50 text-blue-700 border border-blue-200">
            📍 {order.zone.name}
          </span>
        )}
        {order.orderType === 'mesa' && order.tableNumber && (
          <span className="text-xs px-2 py-0.5 rounded-lg font-medium bg-purple-50 text-purple-700 border border-purple-200">
            🪑 {order.tableNumber}
          </span>
        )}
        {order.paymentMethod && (
          <span className="text-xs px-2 py-0.5 rounded-lg font-medium bg-green-50 text-green-700 border border-green-200">
            {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
          </span>
        )}
      </div>

      {/* Address */}
      {order.address && (
        <p className="text-xs rounded-xl px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200">
          🏠 {order.address}
        </p>
      )}

      {/* Products */}
      <ul className="space-y-1.5">
        {order.items?.map((item, i) => (
          <li key={i}>
            <div className="flex justify-between text-sm">
              <span className="text-[#111111]">
                {item.name} <span className="text-[#6B7280]">×{item.qty}</span>
              </span>
              <span className="font-bold text-[#111111]">${(item.price * item.qty).toFixed(2)}</span>
            </div>
            {item.note && (
              <p className="text-xs ml-2 mt-0.5 font-medium bg-[#FFF7E0] text-[#92600A] rounded px-1.5 inline-block">
                ✏️ {item.note}
              </p>
            )}
          </li>
        ))}
      </ul>

      {/* Note */}
      {order.note && (
        <p className="text-xs rounded-xl px-3 py-2 bg-[#FFF7E0] text-[#92600A] border border-[#FFB800]/30">
          📝 {order.note}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 gap-2 border-t border-[#E5E7EB]">
        <div>
          {order.deliveryCost > 0 && (
            <p className="text-[#6B7280] text-xs">Envío +${order.deliveryCost?.toFixed(2)}</p>
          )}
          <p className="font-bold text-[#111111] text-base">${order.total?.toFixed(2)}</p>
        </div>
        {next && ns ? (
          <button onClick={() => onUpdateStatus(order.id, next)}
            className="text-sm font-bold px-4 py-2 rounded-xl transition-all bg-[#FFF7E0] text-[#92600A] border border-[#FFB800]/30 hover:bg-[#FFB800] hover:text-[#111111] hover:border-[#FFB800]">
            → {ns.label}
          </button>
        ) : (
          <span className="text-xs text-[#6B7280] italic">Completado</span>
        )}
      </div>
    </div>
  )
}
