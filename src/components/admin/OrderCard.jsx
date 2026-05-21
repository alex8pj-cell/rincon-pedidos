const STATUS = {
  pending:   { label:'Pendiente',  bg:'rgba(255,184,0,0.15)',  text:'#FFB800',  border:'rgba(255,184,0,0.4)'  },
  preparing: { label:'Preparando', bg:'rgba(59,130,246,0.15)', text:'#60a5fa',  border:'rgba(59,130,246,0.4)' },
  ready:     { label:'Listo',      bg:'rgba(34,197,94,0.15)',  text:'#4ade80',  border:'rgba(34,197,94,0.4)'  },
  delivered: { label:'Entregado',  bg:'rgba(255,255,255,0.05)',text:'#ffffff50', border:'rgba(255,255,255,0.1)'},
}
const NEXT = { pending:'preparing', preparing:'ready', ready:'delivered' }

const ORDER_TYPE_LABELS   = { domicilio:'🚚 Domicilio', recoger:'🏃 Recoger', 'para-llevar':'🥡 Para llevar', mesa:'🪑 Mesa' }
const PAYMENT_LABELS      = { efectivo:'💵 Efectivo', tarjeta:'💳 Tarjeta', transferencia:'📲 Transferencia' }

export default function OrderCard({ order, onUpdateStatus }) {
  const s    = STATUS[order.status] || STATUS.pending
  const next = NEXT[order.status]
  const ns   = next ? STATUS[next] : null
  const time = order.createdAt?.toDate
    ? order.createdAt.toDate().toLocaleTimeString('es', { hour:'2-digit', minute:'2-digit' })
    : '–'

  return (
    <div className="rounded-2xl p-4 flex flex-col gap-3"
         style={{ background:'#1a1a1a', border:'1px solid rgba(255,184,0,0.15)' }}>

      {/* Cabecera */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-black text-white text-sm truncate">{order.customerName || order.table || 'Cliente'}</p>
          <p className="text-white/40 text-xs mt-0.5">
            {time}{order.phone && <span className="ml-2">📞 {order.phone}</span>}
          </p>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0 whitespace-nowrap"
              style={{ background:s.bg, color:s.text, border:`1px solid ${s.border}` }}>
          {s.label}
        </span>
      </div>

      {/* Chips de tipo / zona / pago */}
      <div className="flex flex-wrap gap-1.5">
        {order.orderType && (
          <span className="text-xs px-2 py-0.5 rounded-lg font-bold"
                style={{ background:'rgba(255,184,0,0.1)', color:'#FFB800', border:'1px solid rgba(255,184,0,0.2)' }}>
            {ORDER_TYPE_LABELS[order.orderType] ?? order.orderType}
          </span>
        )}
        {order.orderType === 'domicilio' && order.zone && (
          <span className="text-xs px-2 py-0.5 rounded-lg font-bold"
                style={{ background:'rgba(59,130,246,0.1)', color:'#93c5fd', border:'1px solid rgba(59,130,246,0.2)' }}>
            📍 {order.zone.name}
          </span>
        )}
        {order.orderType === 'mesa' && order.tableNumber && (
          <span className="text-xs px-2 py-0.5 rounded-lg font-bold"
                style={{ background:'rgba(168,85,247,0.1)', color:'#d8b4fe', border:'1px solid rgba(168,85,247,0.2)' }}>
            🪑 {order.tableNumber}
          </span>
        )}
        {order.paymentMethod && (
          <span className="text-xs px-2 py-0.5 rounded-lg font-bold"
                style={{ background:'rgba(34,197,94,0.1)', color:'#86efac', border:'1px solid rgba(34,197,94,0.2)' }}>
            {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
          </span>
        )}
      </div>

      {/* Dirección */}
      {order.address && (
        <p className="text-xs rounded-xl px-3 py-1.5"
           style={{ background:'rgba(59,130,246,0.08)', border:'1px solid rgba(59,130,246,0.2)', color:'#93c5fd' }}>
          🏠 {order.address}
        </p>
      )}

      {/* Productos */}
      <ul className="space-y-1.5">
        {order.items?.map((item, i) => (
          <li key={i}>
            <div className="flex justify-between text-sm">
              <span className="text-white/80">{item.name} <span className="text-white/40">×{item.qty}</span></span>
              <span className="text-white font-bold">${(item.price * item.qty).toFixed(2)}</span>
            </div>
            {item.note && (
              <p className="text-xs ml-2 mt-0.5 text-black font-bold bg-brand-gold rounded px-1.5 inline-block">
                ✏️ {item.note}
              </p>
            )}
          </li>
        ))}
      </ul>

      {/* Nota general */}
      {order.note && (
        <p className="text-xs rounded-xl px-3 py-2"
           style={{ background:'rgba(255,184,0,0.08)', border:'1px solid rgba(255,184,0,0.2)', color:'#FFB800' }}>
          📝 {order.note}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 gap-2"
           style={{ borderTop:'1px solid rgba(255,255,255,0.06)' }}>
        <div>
          {order.deliveryCost > 0 && (
            <p className="text-white/30 text-xs">Envío +${order.deliveryCost?.toFixed(2)}</p>
          )}
          <p className="font-black text-brand-gold text-base">${order.total?.toFixed(2)}</p>
        </div>
        {next && ns ? (
          <button onClick={() => onUpdateStatus(order.id, next)}
            className="text-sm font-black px-4 py-2 rounded-xl transition-all"
            style={{ background:'rgba(255,184,0,0.15)', color:'#FFB800', border:'1px solid rgba(255,184,0,0.3)' }}
            onMouseEnter={e => { e.currentTarget.style.background='#FFB800'; e.currentTarget.style.color='#000' }}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(255,184,0,0.15)'; e.currentTarget.style.color='#FFB800' }}
          >
            → {ns.label}
          </button>
        ) : (
          <span className="text-xs text-white/20 italic">Completado</span>
        )}
      </div>
    </div>
  )
}
